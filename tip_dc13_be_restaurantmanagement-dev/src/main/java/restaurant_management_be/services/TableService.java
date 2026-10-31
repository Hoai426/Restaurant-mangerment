package restaurant_management_be.services;

import restaurant_management_be.common.specification.SearchRequest;
import restaurant_management_be.dto.tables.TableCreateRequest;
import restaurant_management_be.dto.tables.TableResponse;
import restaurant_management_be.dto.tables.TableUpdateRequest;
import restaurant_management_be.dto.tables.TableUpdateStatusRequest;
import restaurant_management_be.entities.Tables;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TableService {
    TableResponse createTable(TableCreateRequest request);
    TableResponse getTableById(Long id);
    TableResponse updateTable(Long id, TableUpdateRequest request);
    TableResponse updateTableStatus(Long id, TableUpdateStatusRequest request);
    List<TableResponse> getAllTables();
    Page<TableResponse> searchTables(SearchRequest request, Pageable pageable);

    List<Tables> getTablesByIds(List<Long> ids);

    void markReserved(List<Long> tableIds);

    void markAvailable(List<Long> tableIds);
}
