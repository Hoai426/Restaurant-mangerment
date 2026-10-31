package restaurant_management_be.dto.reports;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
public class ReportResult {

    private List<Map<String, Object>> rows;
    private int rowCount;
}
