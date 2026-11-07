# Vietjet Travel Prototype - SQLite Database Files

Thư mục này chứa các file `.sql` khởi tạo và nạp dữ liệu mẫu cho cơ sở dữ liệu SQLite của dự án **Vietjet Travel Website Prototype**, theo đúng yêu cầu tại `04_DATA_MODEL_AND_SQLITE.md`.

## Danh sách các file

1. **`01_schema.sql`**: Chứa câu lệnh DDL định nghĩa các bảng, khóa chính, khóa ngoại, ràng buộc và các index tối ưu truy vấn:
   - `airlines`: Thông tin hãng hàng không (VietJet Air, Vietnam Airlines, Singapore Airlines, Bamboo Airways).
   - `flights`: Danh sách các chuyến bay mẫu (chặng bay, mã sân bay, ngày giờ ISO 8601, giá vé VNĐ).
   - `tours`: Danh sách tour du lịch (tiêu đề, hãng điều hành, điểm đến, thời lượng, giá, cờ `is_featured`).
   - `tour_itinerary`: Lịch trình chi tiết theo từng ngày của tour (cascade delete khi xóa tour).
   - `cart_items`: Các mục khách hàng thêm vào giỏ hàng (`flight` hoặc `tour`).
   - `bookings`: Đơn đặt chỗ hoàn tất của khách hàng (mã đặt chỗ, thông tin khách, trạng thái email).
   - `booking_items`: Chi tiết các dịch vụ trong đơn đặt chỗ.

2. **`02_seed.sql`**: Chứa dữ liệu mẫu (seed data) phục vụ chạy thử nghiệm:
   - **4 hãng hàng không**: VietJet Air, Vietnam Airlines, Singapore Airlines, Bamboo Airways.
   - **16 chuyến bay mẫu**: Bao phủ các tuyến nội địa phổ biến (SGN - HAN, HAN - SGN, SGN - DAD, DAD - SGN, SGN - PQC, PQC - SGN, HAN - CXR) và quốc tế (SGN - SIN, SIN - SGN), giá vé định dạng số nguyên VNĐ, thời gian khởi hành trong tương lai theo chuẩn ISO 8601.
   - **Đúng 8 tour nổi bật (`is_featured = 1`)**: Kèm thông tin nhà tổ chức, hãng bay liên kết, hình ảnh 600x400 đại diện, tóm tắt dịch vụ.
   - **26 bản ghi lịch trình tour (`tour_itinerary`)**: Mỗi tour đều có tối thiểu từ 3 đến 4 ngày lịch trình chi tiết tương ứng với thời lượng.

3. **`init.sql`**: File hợp nhất toàn bộ DDL (Schema) và DML (Seed Data) vào một file duy nhất để nạp trực tiếp qua SQLite WASM (SQL.js), script migration hoặc SQLite CLI.

## Nguyên tắc dữ liệu

- **Khóa ngoại**: Luôn kích hoạt `PRAGMA foreign_keys = ON;`.
- **Định dạng thời gian**: Chuẩn chuỗi ISO 8601 (ví dụ: `2026-11-15T06:30:00`).
- **Định dạng tiền tệ**: Lưu dưới dạng số nguyên VNĐ (`INTEGER`), không dùng số thực / float.
- **Tính chất dữ liệu**: Toàn bộ là dữ liệu giả định/demo phục vụ prototype, không phải lịch bay hoặc báo giá thời gian thực.
