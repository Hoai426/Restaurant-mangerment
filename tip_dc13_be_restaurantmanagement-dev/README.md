# tip_dc13_b23_be_restaurantmanagement

Backend Quản lý nhà hàng — Spring Boot 4.1.0 + Java 21 + MySQL + Flyway.

## Yêu cầu

- JDK 21
- MySQL 8.0+
- Không cần cài Maven (đã có Maven Wrapper)

## Build

Windows:

```powershell
.\mvnw.cmd clean package -DskipTests
```

Linux/macOS:

```bash
./mvnw clean package -DskipTests
```

Kết quả: `target/restaurant-management-be-0.0.1-SNAPSHOT.jar`

## Chạy

Biến môi trường bắt buộc:

| Biến | Ví dụ |
|---|---|
| `DB_URL` | `jdbc:mysql://localhost:3306/restaurant_management` |
| `DB_USERNAME` | `root` |
| `DB_PASSWORD` | `secret` |
| `JWT_SECRET` | chuỗi ngẫu nhiên >= 32 ký tự |
| `MAIL_USERNAME` / `MAIL_PASSWORD` | tài khoản Gmail App Password |
| `ADMIN_USERNAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | tài khoản admin khởi tạo |

Tùy chọn:

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Danh sách origin FE, cách nhau dấu phẩy |
| `JPA_SHOW_SQL` | `false` | Bật log SQL |
| `FLYWAY_BASELINE_ON_MIGRATE` | `false` | Chỉ bật khi baseline DB cũ (xem bên dưới) |
| `FLYWAY_BASELINE_VERSION` | `1` | Version baseline khi bật cờ trên |

Chạy dev (bật log SQL):

```powershell
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev"
```

Chạy production:

```powershell
java -jar target/restaurant-management-be-0.0.1-SNAPSHOT.jar
```

Ứng dụng chạy ở port `8080`.

## Flyway & baseline

Schema do Flyway quản lý (`ddl-auto=none`), migration nằm trong `src/main/resources/db/migration` (V1 → V7).

- **DB trống:** Flyway tự chạy toàn bộ V1 → V7. Không cần baseline.
- **DB đã có `flyway_schema_history`:** Flyway chỉ chạy migration còn thiếu.
- **DB đã có dữ liệu nhưng CHƯA có `flyway_schema_history`:**
  - Nếu schema đã khớp toàn bộ V1 → V7 (ví dụ DB đang chạy bản cũ): chạy **một lần** với
    `FLYWAY_BASELINE_ON_MIGRATE=true` và `FLYWAY_BASELINE_VERSION=7`.
  - Nếu schema chỉ có phần của V1 và cần áp V2 → V7: dùng `FLYWAY_BASELINE_VERSION=1`.
  - Sau khi baseline xong, đặt lại `FLYWAY_BASELINE_ON_MIGRATE=false`.

Mặc định `baseline-on-migrate=false` để Flyway **dừng ngay** thay vì âm thầm bỏ qua V1 trên một DB lạ.
