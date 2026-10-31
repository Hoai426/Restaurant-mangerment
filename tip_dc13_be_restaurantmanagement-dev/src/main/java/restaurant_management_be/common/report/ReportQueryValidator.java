package restaurant_management_be.common.report;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import restaurant_management_be.common.exception.AppException;
import restaurant_management_be.common.exception.ErrorCode;
import restaurant_management_be.common.specification.FilterCriteria;
import restaurant_management_be.dto.reports.ReportMetricRequest;
import restaurant_management_be.dto.reports.ReportQueryRequest;

@Component
@RequiredArgsConstructor
public class ReportQueryValidator {

    private static final String METRIC_ALIAS_PATTERN = "[A-Za-z][A-Za-z0-9_]*";

    private final EntityManager entityManager;
    private final ReportFilterBuilder reportFilterBuilder;

    public ReportQueryPlan createPlan(ReportQueryRequest request) {
        if (request == null) {
            throw invalidRequest("Request báo cáo không được null");
        }
        if (request.getTarget() == null) {
            throw invalidRequest("Vui lòng chọn target báo cáo");
        }

        List<ReportMetricRequest> metrics = request.getMetrics();
        validateMetrics(metrics);

        List<String> groupFields = normalizeGroupFields(request.getGroupFields());
        List<FilterCriteria> filters = normalizeFilters(request.getFilters());
        List<ReportMetricRequest> normalizedMetrics = normalizeMetrics(metrics);
        validateSelectionAliases(groupFields, normalizedMetrics);

        ReportRange range = ReportRangeResolver.resolve(
                request.getPreset(), request.getStartDate(), request.getEndDate(), request.getGroupBy());
        String timeField = request.getTimeField();
        if (timeField == null || timeField.isBlank()) {
            timeField = defaultTimeField(request.getTarget());
        } else {
            timeField = timeField.trim();
        }

        ReportQueryPlan plan = new ReportQueryPlan(
                request.getTarget(), range, timeField, groupFields,
                normalizedMetrics, filters, request.getTopN());
        validateFields(plan);
        return plan;
    }

    private void validateMetrics(List<ReportMetricRequest> metrics) {
        if (metrics == null || metrics.isEmpty()) {
            throw invalidRequest("Vui lòng khai báo ít nhất 1 metric");
        }
        for (ReportMetricRequest metric : metrics) {
            if (metric == null || metric.getOp() == null
                    || metric.getField() == null || metric.getField().isBlank()
                    || metric.getAlias() == null || metric.getAlias().isBlank()) {
                throw invalidRequest("Mỗi metric cần có op, field và alias hợp lệ");
            }
        }
    }

    private List<String> normalizeGroupFields(List<String> groupFields) {
        if (groupFields == null || groupFields.isEmpty()) {
            return List.of();
        }

        List<String> normalized = new ArrayList<>(groupFields.size());
        for (String groupField : groupFields) {
            if (groupField == null || groupField.isBlank()) {
                throw invalidRequest("Group field không được để trống");
            }
            normalized.add(groupField.trim());
        }
        return List.copyOf(normalized);
    }

    private List<ReportMetricRequest> normalizeMetrics(List<ReportMetricRequest> metrics) {
        List<ReportMetricRequest> normalized = new ArrayList<>(metrics.size());
        for (ReportMetricRequest metric : metrics) {
            normalized.add(new ReportMetricRequest(
                    metric.getOp(), metric.getField().trim(), metric.getAlias().trim()));
        }
        return List.copyOf(normalized);
    }

    private List<FilterCriteria> normalizeFilters(List<FilterCriteria> filters) {
        if (filters == null || filters.isEmpty()) {
            return List.of();
        }

        List<FilterCriteria> normalized = new ArrayList<>(filters);
        for (FilterCriteria filter : normalized) {
            if (filter == null || filter.getField() == null || filter.getField().isBlank()) {
                throw invalidRequest("Mỗi filter cần có field hợp lệ");
            }
        }
        return List.copyOf(normalized);
    }

    private void validateSelectionAliases(
            List<String> groupFields,
            List<ReportMetricRequest> metrics) {
        Set<String> aliases = new HashSet<>();
        aliases.add("period");

        for (String groupField : groupFields) {
            String alias = "group_" + groupField.replace('.', '_');
            if (!aliases.add(alias)) {
                throw invalidRequest("Group field bị trùng alias kết quả: " + groupField);
            }
        }

        for (ReportMetricRequest metric : metrics) {
            String alias = metric.getAlias();
            if (!alias.matches(METRIC_ALIAS_PATTERN) || !aliases.add(alias)) {
                throw invalidRequest("Alias metric phải hợp lệ và duy nhất");
            }
        }

    }

    private String defaultTimeField(ReportTarget target) {
        return switch (target) {
            case PAYMENTS -> "paidAt";
            case ORDERS, ORDER_ITEMS -> "createdAt";
        };
    }

    private AppException invalidRequest(String message) {
        return new AppException(ErrorCode.VALIDATION_FAILED, message, HttpStatus.BAD_REQUEST);
    }

    private void validateFields(ReportQueryPlan plan) {
        CriteriaQuery<Object[]> criteriaQuery = entityManager.getCriteriaBuilder().createQuery(Object[].class);
        Root<?> root = criteriaQuery.from(plan.target().entityClass());

        Path<?> timePath = reportFilterBuilder.resolveScalarPath(root, plan.timeField());
        if (timePath.getJavaType() != LocalDateTime.class) {
            throw invalidRequest("Field thời gian của report phải có kiểu LocalDateTime");
        }

        for (String groupField : plan.groupFields()) {
            reportFilterBuilder.resolveScalarPath(root, groupField);
        }

        for (ReportMetricRequest metric : plan.metrics()) {
            Path<?> metricPath = reportFilterBuilder.resolveScalarPath(root, metric.getField());
            if (requiresNumericField(metric.getOp())
                    && !Number.class.isAssignableFrom(wrapPrimitive(metricPath.getJavaType()))) {
                throw invalidRequest(metric.getOp() + " chỉ hỗ trợ field kiểu số");
            }
        }

        for (FilterCriteria filter : plan.filters()) {
            reportFilterBuilder.resolveScalarPath(root, filter.getField());
        }
    }

    private boolean requiresNumericField(ReportMetric metric) {
        return metric == ReportMetric.SUM || metric == ReportMetric.AVG
                || metric == ReportMetric.MIN || metric == ReportMetric.MAX;
    }

    private Class<?> wrapPrimitive(Class<?> type) {
        if (type == int.class) return Integer.class;
        if (type == long.class) return Long.class;
        if (type == double.class) return Double.class;
        if (type == float.class) return Float.class;
        if (type == short.class) return Short.class;
        if (type == byte.class) return Byte.class;
        return type;
    }
}
