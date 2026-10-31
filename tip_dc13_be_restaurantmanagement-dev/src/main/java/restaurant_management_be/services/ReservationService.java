package restaurant_management_be.services;

import restaurant_management_be.common.specification.SearchRequest;
import restaurant_management_be.dto.reservations.ReservationCreateRequest;
import restaurant_management_be.dto.reservations.ReservationResponse;
import restaurant_management_be.dto.reservations.ReservationUpdateRequest;
import restaurant_management_be.dto.reservations.ReservationUpdateStatusRequest;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ReservationService {

    List<ReservationResponse> createReservation(ReservationCreateRequest request);
    List<ReservationResponse> updateReservation(Long id, ReservationUpdateRequest request);
    List<ReservationResponse> getReservationDetail(Long id);
    Page<ReservationResponse> searchReservations(SearchRequest request, Pageable pageable);
    List<ReservationResponse> updateReservationStatus(Long id, ReservationUpdateStatusRequest request);
}
