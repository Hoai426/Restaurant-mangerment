# tip_dc13_b23_be_restaurantmanagement

Backend Quản lý nhà hàng — Spring Boot 4.1.0 + Java 21 + MySQL 8 + Flyway.

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

## Cấu hình

Copy `.env.example` thành `.env` rồi điền giá trị:

```powershell
Copy-Item .env.example .env
```

| Biến | Bắt buộc | Mặc định | Ý nghĩa |
|---|---|---|---|
| `DB_URL` | ✅ | — | `jdbc:mysql://host:3306/restaurant_management` |
| `DB_USERNAME` / `DB_PASSWORD` | ✅ | — | Tài khoản MySQL |
| `JWT_SECRET` | ✅ | — | Tối thiểu **32 byte**, sinh bằng `openssl rand -base64 48` |
| `MAIL_USERNAME` / `MAIL_PASSWORD` | ✅ | — | Gmail + **App Password** (bật 2FA) |
| `ADMIN_USERNAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | ✅ | — | Admin khởi tạo lần đầu |
| `ADMIN_PHONE` | ❌ | `+1000000000` | Số điện thoại admin |
| `CORS_ALLOWED_ORIGINS` | ❌ | `http://localhost:3000` | Danh sách origin FE, cách nhau dấu phẩy |
| `PORT` | ❌ | `8080` | PaaS tự inject |
| `JPA_SHOW_SQL` | ❌ | `false` | Bật log SQL |
| `FLYWAY_BASELINE_ON_MIGRATE` | ❌ | `false` | Chỉ bật khi baseline DB cũ |
| `FLYWAY_BASELINE_VERSION` | ❌ | `1` | Version baseline |

Ứng dụng **dừng ngay khi khởi động** nếu thiếu biến bắt buộc hoặc `JWT_SECRET` < 32 byte.

## Chạy

Dev (bật log SQL):

```powershell
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev"
```

Production:

```powershell
java -Xmx512m -jar target/restaurant-management-be-0.0.1-SNAPSHOT.jar
```

Health check: `GET /actuator/health`, `/actuator/health/liveness`, `/actuator/health/readiness`
Swagger: `/swagger-ui.html`

## Flyway & baseline

Schema do Flyway quản lý (`ddl-auto=none`), migration nằm trong `src/main/resources/db/migration` (V1 → V7).

- **DB trống:** Flyway tự chạy toàn bộ V1 → V7.
- **DB đã có `flyway_schema_history`:** chỉ chạy migration còn thiếu.
- **DB có dữ liệu nhưng chưa có history:**
  - Schema đã khớp V1 → V7: chạy **một lần** với `FLYWAY_BASELINE_ON_MIGRATE=true`, `FLYWAY_BASELINE_VERSION=7`.
  - Chỉ có schema của V1, cần áp V2 → V7: dùng `FLYWAY_BASELINE_VERSION=1`.
  - Sau đó đặt lại `FLYWAY_BASELINE_ON_MIGRATE=false`.

Mặc định `false` để Flyway dừng ngay thay vì âm thầm bỏ qua V1 trên DB lạ.

## Deploy

### PaaS (Render / Railway / Heroku)

Do repo chứa cả FE và BE, phải đặt **Root Directory** = `tip_dc13_be_restaurantmanagement-dev`.

- Build command: `./mvnw -B clean package -DskipTests`
- Start command: `java -jar target/restaurant-management-be-0.0.1-SNAPSHOT.jar`
- Health check path: `/actuator/health`
- Khai báo đủ biến môi trường ở trên; **không** cần set `PORT` (nền tảng tự inject, app đã đọc).

### VPS (systemd)

```ini
# /etc/systemd/system/restaurant-be.service
[Unit]
Description=Restaurant Management Backend
After=network.target

[Service]
User=restaurant
WorkingDirectory=/opt/restaurant-be
EnvironmentFile=/opt/restaurant-be/.env
ExecStart=/usr/bin/java -Xmx512m -jar /opt/restaurant-be/app.jar
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now restaurant-be
```

Đặt sau nginx reverse proxy và giữ `server.forward-headers-strategy=framework` (đã cấu hình sẵn).

### Docker

```bash
docker build -t restaurant-be .
docker run -p 8080:8080 --env-file .env restaurant-be
```

Full stack local (MySQL + backend):

```bash
docker compose up --build
```

## Kiểm tra trước khi lên production

- [ ] `JWT_SECRET` ≥ 32 byte và không dùng lại ở môi trường khác
- [ ] `CORS_ALLOWED_ORIGINS` trỏ đúng domain FE
- [ ] `ADMIN_PASSWORD` mạnh, đổi sau lần đăng nhập đầu
- [ ] DB trống hoặc đã baseline đúng (xem mục Flyway)
- [ ] `/actuator/health` trả `UP`
- [ ] `JPA_SHOW_SQL=false`
