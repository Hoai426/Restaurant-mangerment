package restaurant_management_be.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import restaurant_management_be.entities.RefreshToken;
import restaurant_management_be.entities.User;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String tokenHash);

    void deleteByUser(User user);
}
