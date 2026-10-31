package restaurant_management_be.controllers;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import restaurant_management_be.common.response.SuccessResponse;
import restaurant_management_be.common.specification.SearchRequest;
import restaurant_management_be.dto.tables.TableCreateRequest;
import restaurant_management_be.dto.tables.TableResponse;
import restaurant_management_be.services.TableService;
import restaurant_management_be.dto.tables.TableUpdateRequest;
import restaurant_management_be.dto.tables.TableUpdateStatusRequest;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@RestController
@RequestMapping("/api/tables")
public class TableController {

    private final TableService tableService;

    public TableController(TableService tableService) {
        this.tableService = tableService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<SuccessResponse<TableResponse>> createTable(
            @Valid @RequestBody TableCreateRequest request) {
        TableResponse result = tableService.createTable(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(SuccessResponse.created("Tạo bàn thành công", result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SuccessResponse<TableResponse>> getTableById(@PathVariable Long id) {
        TableResponse result = tableService.getTableById(id);
        return ResponseEntity.ok(SuccessResponse.ok(result));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}")
    public ResponseEntity<SuccessResponse<TableResponse>> updateTable(
            @PathVariable Long id,
            @Valid @RequestBody TableUpdateRequest request) {
        TableResponse result = tableService.updateTable(id, request);
        return ResponseEntity.ok(SuccessResponse.ok("Cập nhật bàn thành công", result));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<SuccessResponse<TableResponse>> updateTableStatus(
            @PathVariable Long id,
            @Valid @RequestBody TableUpdateStatusRequest request) {
        TableResponse result = tableService.updateTableStatus(id, request);
        return ResponseEntity.ok(SuccessResponse.ok("Cập nhật trạng thái bàn thành công", result));
    }

    @GetMapping
    public ResponseEntity<SuccessResponse<List<TableResponse>>> getAllTables() {
        return ResponseEntity.ok(SuccessResponse.ok(tableService.getAllTables()));
    }

    @PostMapping("/search")
    public ResponseEntity<SuccessResponse<Page<TableResponse>>> searchTables(
            @RequestBody SearchRequest request, Pageable pageable) {
        return ResponseEntity.ok(SuccessResponse.ok(tableService.searchTables(request, pageable)));
    }
}
