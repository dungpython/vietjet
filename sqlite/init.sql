-- =============================================================================
-- Vietjet Travel Prototype - Complete SQLite Database Initialization
-- Combined Schema & Seed Data
-- =============================================================================

PRAGMA foreign_keys = ON;

-- =============================================================================
-- PART 1: SCHEMA DEFINITION
-- =============================================================================

CREATE TABLE IF NOT EXISTS airlines (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_path TEXT,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS flights (
  id TEXT PRIMARY KEY,
  airline_id TEXT NOT NULL,
  flight_number TEXT NOT NULL,
  origin_code TEXT NOT NULL,
  origin_city TEXT NOT NULL,
  destination_code TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  departure_datetime TEXT NOT NULL,
  arrival_datetime TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  stops INTEGER NOT NULL DEFAULT 0,
  aircraft_type TEXT,
  service_summary TEXT,
  economy_price INTEGER NOT NULL,
  business_price INTEGER,
  trip_type TEXT NOT NULL DEFAULT 'oneway',
  FOREIGN KEY (airline_id) REFERENCES airlines(id)
);

CREATE TABLE IF NOT EXISTS tours (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  operator_name TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_city TEXT,
  departure_datetime TEXT,
  duration_days INTEGER NOT NULL,
  duration_nights INTEGER NOT NULL,
  associated_airline_id TEXT,
  thumbnail_path TEXT,
  price INTEGER NOT NULL,
  service_summary TEXT,
  description TEXT,
  is_featured INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (associated_airline_id) REFERENCES airlines(id)
);

CREATE TABLE IF NOT EXISTS tour_itinerary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tour_id TEXT NOT NULL,
  day_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cart_items (
  id TEXT PRIMARY KEY,
  item_type TEXT NOT NULL CHECK (item_type IN ('flight', 'tour')),
  item_ref_id TEXT NOT NULL,
  selected_fare TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL,
  added_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  booking_reference TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_note TEXT,
  total_amount INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  email_status TEXT NOT NULL DEFAULT 'not_configured'
);

CREATE TABLE IF NOT EXISTS booking_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id TEXT NOT NULL,
  item_type TEXT NOT NULL,
  item_ref_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  selected_fare TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_flights_route ON flights(origin_code, destination_code, departure_datetime);
CREATE INDEX IF NOT EXISTS idx_flights_airline ON flights(airline_id);
CREATE INDEX IF NOT EXISTS idx_tours_featured ON tours(is_featured);
CREATE INDEX IF NOT EXISTS idx_tours_destination ON tours(destination);
CREATE INDEX IF NOT EXISTS idx_tour_itinerary_tour ON tour_itinerary(tour_id, day_number);
CREATE INDEX IF NOT EXISTS idx_bookings_ref ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_booking_items_booking ON booking_items(booking_id);

-- =============================================================================
-- PART 2: SEED DATA
-- =============================================================================

-- Airlines
INSERT INTO airlines (id, name, slug, logo_path, is_active) VALUES
('airline-vj', 'VietJet Air', 'vietjet-air', 'assets/images/airlines/vietjet.svg', 1),
('airline-vn', 'Vietnam Airlines', 'vietnam-airlines', 'assets/images/airlines/vietnam-airlines.svg', 1),
('airline-sq', 'Singapore Airlines', 'singapore-airlines', 'assets/images/airlines/singapore-airlines.svg', 1),
('airline-qh', 'Bamboo Airways', 'bamboo-airways', 'assets/images/airlines/bamboo-airways.svg', 1);

-- Flights
INSERT INTO flights (
  id, airline_id, flight_number,
  origin_code, origin_city, destination_code, destination_city,
  departure_datetime, arrival_datetime, duration_minutes,
  stops, aircraft_type, service_summary,
  economy_price, business_price, trip_type
) VALUES
('flight-vj-101', 'airline-vj', 'VJ120', 'SGN', 'TP. Hồ Chí Minh', 'HAN', 'Hà Nội', '2026-11-15T06:30:00', '2026-11-15T08:45:00', 135, 0, 'Airbus A321', '7kg hành lý xách tay, dịch vụ suất ăn tính phí', 1250000, 2850000, 'oneway'),
('flight-vj-102', 'airline-vj', 'VJ128', 'SGN', 'TP. Hồ Chí Minh', 'HAN', 'Hà Nội', '2026-11-15T14:15:00', '2026-11-15T16:30:00', 135, 0, 'Airbus A321', '7kg hành lý xách tay, quầy check-in ưu tiên', 1450000, 3100000, 'oneway'),
('flight-vn-201', 'airline-vn', 'VN210', 'SGN', 'TP. Hồ Chí Minh', 'HAN', 'Hà Nội', '2026-11-15T09:00:00', '2026-11-15T11:15:00', 135, 0, 'Boeing 787-9', '12kg xách tay + 23kg ký gửi, suất ăn nóng miễn phí', 1950000, 4500000, 'oneway'),
('flight-qh-301', 'airline-qh', 'QH204', 'SGN', 'TP. Hồ Chí Minh', 'HAN', 'Hà Nội', '2026-11-15T11:30:00', '2026-11-15T13:45:00', 135, 0, 'Airbus A320', '7kg xách tay + 20kg ký gửi, nước suối và khăn lạnh', 1600000, 3600000, 'oneway'),
('flight-vj-103', 'airline-vj', 'VJ135', 'HAN', 'Hà Nội', 'SGN', 'TP. Hồ Chí Minh', '2026-11-18T10:00:00', '2026-11-18T12:15:00', 135, 0, 'Airbus A321', '7kg hành lý xách tay, chọn chỗ ngồi trả phí', 1300000, 2900000, 'oneway'),
('flight-vn-202', 'airline-vn', 'VN215', 'HAN', 'Hà Nội', 'SGN', 'TP. Hồ Chí Minh', '2026-11-18T16:00:00', '2026-11-18T18:15:00', 135, 0, 'Boeing 787-9', '12kg xách tay + 23kg ký gửi, giải trí màn hình cá nhân', 2100000, 4600000, 'oneway'),
('flight-vj-104', 'airline-vj', 'VJ622', 'SGN', 'TP. Hồ Chí Minh', 'DAD', 'Đà Nẵng', '2026-11-16T07:10:00', '2026-11-16T08:35:00', 85, 0, 'Airbus A320', '7kg hành lý xách tay tiêu chuẩn', 890000, 2150000, 'oneway'),
('flight-vn-203', 'airline-vn', 'VN122', 'SGN', 'TP. Hồ Chí Minh', 'DAD', 'Đà Nẵng', '2026-11-16T13:45:00', '2026-11-16T15:10:00', 85, 0, 'Airbus A321', '12kg xách tay + 23kg ký gửi, bánh ngọt và nước uống', 1350000, 3200000, 'oneway'),
('flight-vj-105', 'airline-vj', 'VJ631', 'DAD', 'Đà Nẵng', 'SGN', 'TP. Hồ Chí Minh', '2026-11-19T18:30:00', '2026-11-19T19:55:00', 85, 0, 'Airbus A320', '7kg hành lý xách tay tiêu chuẩn', 950000, 2200000, 'oneway'),
('flight-vj-106', 'airline-vj', 'VJ321', 'SGN', 'TP. Hồ Chí Minh', 'PQC', 'Phú Quốc', '2026-11-17T08:20:00', '2026-11-17T09:25:00', 65, 0, 'Airbus A320', '7kg hành lý xách tay, bay ngắm cảnh biển đảo', 780000, 1950000, 'oneway'),
('flight-vn-204', 'airline-vn', 'VN1820', 'SGN', 'TP. Hồ Chí Minh', 'PQC', 'Phú Quốc', '2026-11-17T15:00:00', '2026-11-17T16:05:00', 65, 0, 'Airbus A321', '12kg xách tay + 23kg ký gửi, khăn thơm và nước khoáng', 1200000, 2750000, 'oneway'),
('flight-vj-107', 'airline-vj', 'VJ334', 'PQC', 'Phú Quốc', 'SGN', 'TP. Hồ Chí Minh', '2026-11-20T11:00:00', '2026-11-20T12:05:00', 65, 0, 'Airbus A320', '7kg hành lý xách tay tiêu chuẩn', 820000, 1990000, 'oneway'),
('flight-qh-302', 'airline-qh', 'QH1562', 'HAN', 'Hà Nội', 'CXR', 'Nha Trang', '2026-11-16T10:15:00', '2026-11-16T12:05:00', 110, 0, 'Airbus A320', '7kg xách tay + 20kg ký gửi, nước suối và đồ ăn nhẹ', 1420000, 3300000, 'oneway'),
('flight-vj-108', 'airline-vj', 'VJ811', 'SGN', 'TP. Hồ Chí Minh', 'SIN', 'Singapore', '2026-11-22T08:55:00', '2026-11-22T12:05:00', 130, 0, 'Airbus A321', '7kg xách tay, đường bay quốc tế linh hoạt giá rẻ', 1850000, 4200000, 'oneway'),
('flight-sq-401', 'airline-sq', 'SQ178', 'SGN', 'TP. Hồ Chí Minh', 'SIN', 'Singapore', '2026-11-22T12:15:00', '2026-11-22T15:20:00', 125, 0, 'Boeing 787-10', '25kg ký gửi, ẩm thực 5 sao, giải trí KrisWorld đỉnh cao', 3850000, 8900000, 'oneway'),
('flight-sq-402', 'airline-sq', 'SQ177', 'SIN', 'Singapore', 'SGN', 'TP. Hồ Chí Minh', '2026-11-26T16:30:00', '2026-11-26T17:40:00', 130, 0, 'Boeing 787-10', '25kg ký gửi, phòng chờ thương gia, trải nghiệm chuẩn quốc tế', 3900000, 9100000, 'oneway');

-- Featured Tours (8 records)
INSERT INTO tours (
  id, title, slug, operator_name,
  destination, departure_city, departure_datetime,
  duration_days, duration_nights, associated_airline_id,
  thumbnail_path, price, service_summary, description, is_featured
) VALUES
(
  'tour-dn-01',
  'Khám Phá Đà Nẵng - Hội An - Cầu Vàng Bà Nà Hills',
  'da-nang-hoi-an-ba-na-hills',
  'Viet Travel Life',
  'Đà Nẵng - Quảng Nam',
  'TP. Hồ Chí Minh',
  '2026-11-20T06:00:00',
  3, 2, 'airline-vj',
  'assets/images/tours/tour-danang.jpg',
  3990000,
  'Vé máy bay khứ hồi VietJet, Khách sạn 4 sao ven biển, Vé cáp treo Bà Nà Hills, HDV tiếng Việt trọn tuyến',
  'Hành trình 3 ngày 2 đêm chiêm ngưỡng Cầu Vàng Bà Nà Hills biểu tượng thế giới, tản bộ phố cổ Hội An lung linh đèn lồng và thưởng thức hải sản miền Trung tươi ngon.',
  1
),
(
  'tour-pq-02',
  'Thiên Đường Nghỉ Dưỡng Đảo Ngọc Phú Quốc - Cáp Treo Hòn Thơm',
  'phu-quoc-hon-thom-resort',
  'Vin Wonder Travel',
  'Kiên Giang (Phú Quốc)',
  'TP. Hồ Chí Minh',
  '2026-11-21T07:30:00',
  4, 3, 'airline-vj',
  'assets/images/tours/tour-phuquoc.jpg',
  5490000,
  'Vé máy bay VietJet Air, Resort 5 sao có bãi biển riêng, Cano 4 đảo lặn san hô, Cáp treo Hòn Thơm',
  'Thả mình giữa làn nước biển ngọc bích của đảo ngọc Phú Quốc, trải nghiệm lặn biển ngắm san hô tại Hòn Mây Rút, ngắm hoàng hôn Sunset Sanato và thưởng thức ẩm thực chợ đêm Grand World.',
  1
),
(
  'tour-hl-03',
  'Kỳ Quan Hạ Long - Du Thuyền 5 Sao Sang Trọng Trên Vịnh Di Sản',
  'ha-noi-ha-long-du-thuyen',
  'Heritage Voyages',
  'Quảng Ninh (Hạ Long)',
  'Hà Nội',
  '2026-11-22T08:00:00',
  3, 2, 'airline-vn',
  'assets/images/tours/tour-halong.jpg',
  4650000,
  'Xe Limousine VIP đưa đón, 1 đêm Du thuyền 5 sao đẳng cấp, Chèo kayak hang Luồn, Đầy đủ các bữa ăn hải sản',
  'Hành trình thưởng ngoạn di sản thiên nhiên thế giới Vịnh Hạ Long, ngắm bình minh trên boong tàu sang trọng, khám phá vẻ đẹp huyền ảo của hang Sửng Sốt và trải nghiệm chèo thuyền kayak.',
  1
),
(
  'tour-sp-04',
  'Sapa Mây Trắng - Chinh Phục Đỉnh Fansipan Nóc Nhà Đông Dương',
  'sapa-fansipan-muong-hoa',
  'North Star Discovery',
  'Lào Cai (Sapa)',
  'Hà Nội',
  '2026-11-23T06:30:00',
  3, 2, NULL,
  'assets/images/tours/tour-sapa.jpg',
  3290000,
  'Xe giường nằm VIP cao cấp, Khách sạn 4 sao trung tâm thị xã, Vé cáp treo Sun World Fansipan Legend, Trekking bản Cát Cát',
  'Chinh phục đỉnh thiêng Fansipan 3.143m ngắm nhìn biển mây bồng bềnh, ghé thăm bản làng người H''Mông mộc mạc tại Cát Cát và chiêm ngưỡng vẻ đẹp thung lũng Mường Hoa.',
  1
),
(
  'tour-nt-05',
  'Nha Trang Biển Gọi - Du Ngoạn 3 Đảo VIP & Tắm Bùn Khoáng Nóng',
  'nha-trang-bien-xanh-3-dao',
  'Ocean Gateway Holidays',
  'Khánh Hòa (Nha Trang)',
  'TP. Hồ Chí Minh',
  '2026-11-24T07:00:00',
  4, 3, 'airline-qh',
  'assets/images/tours/tour-nhatrang.jpg',
  4890000,
  'Vé máy bay Bamboo Airways khứ hồi, Khách sạn 4 sao mặt biển Trần Phú, Cano VIP tham quan vịnh Nha Trang, Vé tắm bùn I-Resort',
  'Trải nghiệm kỳ nghỉ rực rỡ tại vịnh biển Nha Trang thơ mộng, thỏa sức bơi lội tắm biển tại Bãi Tranh, ngắm san hô Hòn Tằm và thư giãn phục hồi sức khỏe với tắm khoáng bùn tự nhiên.',
  1
),
(
  'tour-dl-06',
  'Đà Lạt Ngàn Hoa - Săn Mây Cầu Đất & Trải Nghiệm Máng Trượt Datanla',
  'da-lat-san-may-datanla',
  'Highland Dream Tours',
  'Lâm Đồng (Đà Lạt)',
  'TP. Hồ Chí Minh',
  '2026-11-25T06:00:00',
  3, 2, 'airline-vj',
  'assets/images/tours/tour-dalat.jpg',
  2950000,
  'Xe du lịch đời mới máy lạnh, Khách sạn view thung lũng thông, Tour đón bình minh săn mây đồi chè Cầu Đất, Vé máng trượt thác Datanla',
  'Tận hưởng bầu không khí se lạnh trong lành của phố hoa Đà Lạt, đón bình minh rực rỡ trên thảm gỗ săn mây Cầu Đất, dạo chơi bờ hồ Tuyền Lâm và khám phá văn hóa bản địa cao nguyên.',
  1
),
(
  'tour-sin-07',
  'Singapore Hiện Đại - Kỳ Quan Jewel Changi & Siêu Cây Ánh Sáng',
  'singapore-jewel-gardens-by-the-bay',
  'Asia Lion Holidays',
  'Singapore',
  'TP. Hồ Chí Minh',
  '2026-11-26T08:30:00',
  4, 3, 'airline-sq',
  'assets/images/tours/tour-singapore.jpg',
  10990000,
  'Vé máy bay Singapore Airlines khứ hồi, Khách sạn 4 sao trung tâm Orchard, Vé Cloud Forest & Flower Dome, Bữa tối buffet hải sản',
  'Chuyến du lịch quốc tế đẳng cấp khám phá đảo quốc sư tử hiện đại bậc nhất châu Á, chiêm ngưỡng siêu cây ánh sáng tại Gardens by the Bay, thác nước trong nhà Jewel Changi và khu phố Marina Bay.',
  1
),
(
  'tour-qbinh-08',
  'Khám Phá Di Sản Thiên Nhiên Thế Giới Phong Nha - Suối Nước Moọc',
  'quang-binh-dong-phong-nha-suoi-mooc',
  'Cave Discovery Vietnam',
  'Quảng Bình',
  'Hà Nội',
  '2026-11-27T07:15:00',
  3, 2, 'airline-vn',
  'assets/images/tours/tour-quangbinh.jpg',
  3750000,
  'Vé máy bay Vietnam Airlines, Resort Bảo Ninh ven biển, Thuyền tham quan Động Phong Nha di sản, Chèo kayak suối Nước Moọc',
  'Khám phá vương quốc hang động kỳ vĩ Phong Nha - Kẻ Bàng, chiêm ngưỡng thạch nhũ hàng triệu năm tuổi và hòa mình vào dòng suối xanh ngọc bích mát lạnh Suối Nước Moọc.',
  1
);

-- Tour Itineraries (26 records)
INSERT INTO tour_itinerary (tour_id, day_number, title, description) VALUES
-- tour-dn-01
('tour-dn-01', 1, 'Ngày 1: Đón bay Đà Nẵng - Bán đảo Sơn Trà - Phố cổ Hội An', 'Xe và HDV đón quý khách tại sân bay Đà Nẵng. Khởi hành tham quan Chùa Linh Ứng - Bán đảo Sơn Trà. Buổi chiều di chuyển về phố cổ Hội An, bách bộ ngắm đèn lồng lung linh và thưởng thức đặc sản cao lầu, mì Quảng.'),
('tour-dn-01', 2, 'Ngày 2: Sun World Bà Nà Hills - Cầu Vàng - Fantasy Park', 'Đón bình minh tại thành phố biển. Lên cáp treo Bà Nà Hills check-in Cầu Vàng lừng danh thế giới, tham quan Làng Pháp cổ kính và thỏa sức vui chơi tại công viên giải trí trong nhà Fantasy Park.'),
('tour-dn-01', 3, 'Ngày 3: Chợ Hàn - Mua sắm đặc sản miền Trung - Tiễn sân bay', 'Tự do tắm biển Mỹ Khê buổi sớm. Tham quan mua sắm quà lưu niệm và đặc sản khô tại Chợ Hàn. Xe đưa đoàn ra sân bay Đà Nẵng làm thủ tục chuyến bay về, kết thúc chuyến đi trọn vẹn.'),

-- tour-pq-02
('tour-pq-02', 1, 'Ngày 1: Đón bay Phú Quốc - Check-in Sunset Sanato - Grand World', 'Đón quý khách tại sân bay Phú Quốc về resort nhận phòng nghỉ ngơi. Chiều tham quan Sunset Sanato chụp ảnh hoàng hôn nghệ thuật. Tối khám phá thành phố không ngủ Grand World Phú Quốc.'),
('tour-pq-02', 2, 'Ngày 2: Cano du ngoạn 4 đảo - Hòn Mây Rút - Cáp treo Hòn Thơm', 'Lên cano cao tốc tham quan Hòn Móng Tay, Hòn Gầm Ghì lặn ngắm san hô tự nhiên, Hòn Mây Rút check-in flycam. Trải nghiệm tuyến cáp treo vượt biển 3 dây Hòn Thơm dài nhất thế giới ngắm toàn cảnh biển Nam đảo.'),
('tour-pq-02', 3, 'Ngày 3: VinWonders & Safari bán hoang dã lớn nhất Việt Nam', 'Cả ngày vui chơi bất tận tại công viên chủ đề VinWonders Phú Quốc với thủy cung hình rùa khổng lồ và công viên chăm sóc bảo tồn động vật bán hoang dã Vinpearl Safari.'),
('tour-pq-02', 4, 'Ngày 4: Vườn tiêu suối Đá - Cơ sở nuôi cấy ngọc trai - Tiễn bay', 'Ghé thăm vườn tiêu truyền thống, cơ sở ủ rượu sim và trang trại nuôi cấy ngọc trai Phú Quốc. Mua sắm đặc sản địa phương trước khi xe đưa đoàn ra sân bay Phú Quốc trở về.'),

-- tour-hl-03
('tour-hl-03', 1, 'Ngày 1: Hà Nội - Tuần Châu - Check-in Du thuyền 5 sao - Hang Luồn', 'Xe Limousine đón khách từ trung tâm Hà Nội đi cảng Tuần Châu. Nhận phòng trên du thuyền 5 sao, thưởng thức tiệc trưa buffet ngắm vịnh di sản. Trải nghiệm chèo kayak qua Hang Luồn.'),
('tour-hl-03', 2, 'Ngày 2: Hang Sửng Sốt - Đảo Ti Tốp - Tiệc hoàng hôn Sunset Party', 'Khám phá hang động thạch nhũ Sửng Sốt lớn nhất Vịnh Hạ Long. Tắm biển và leo đỉnh Ti Tốp ngắm toàn cảnh 360 độ vịnh xanh. Tham gia tiệc trà chiều hoàng hôn và lớp học nấu ăn trên boong tàu.'),
('tour-hl-03', 3, 'Ngày 3: Thái Cực Quyền đón bình minh - Cảng Tuần Châu - Về Hà Nội', 'Tập dưỡng sinh Tai Chi đón ánh bình minh trên boong tàu. Dùng bữa trưa sớm trong khi tàu nhẹ nhàng lướt qua các hòn đảo đá vôi về bến Tuần Châu. Xe đưa quý khách về điểm hẹn Hà Nội an toàn.'),

-- tour-sp-04
('tour-sp-04', 1, 'Ngày 1: Hà Nội - Sapa - Bản Cát Cát mộc mạc - Nhà thờ đá', 'Khởi hành bằng xe Limousine từ Hà Nội đi Sapa theo cao tốc Nội Bài - Lào Cai. Buổi chiều trekking khám phá bản văn hóa Cát Cát của đồng bào H''Mông, ngắm guồng nước và suối Mường Hoa.'),
('tour-sp-04', 2, 'Ngày 2: Cáp treo Fansipan ngắm biển mây - Đèo Ô Quy Hồ hùng vĩ', 'Chinh phục đỉnh Fansipan 3.143m huyền thoại bằng hệ thống cáp treo hiện đại. Chiêm bái quần thể kiến trúc tâm linh trên mây. Buổi chiều ngắm hoàng hôn rực rỡ tại đèo Ô Quy Hồ.'),
('tour-sp-04', 3, 'Ngày 3: Thung lũng Mường Hoa - Chợ Sapa - Khởi hành về Hà Nội', 'Tự do dạo chơi thung lũng Mường Hoa, chụp ảnh ruộng bậc thang hoặc ghé chợ thị xã Sapa chọn mua hạt dẻ, thịt trâu gác bếp và rau củ tươi ngon trước khi lên xe về Hà Nội.'),

-- tour-nt-05
('tour-nt-05', 1, 'Ngày 1: Sân bay Cam Ranh - Tháp Bà Ponagar - Biển Nha Trang', 'Xe đón đoàn tại sân bay Cam Ranh đưa về khách sạn ven biển. Chiều viếng thăm tháp cổ Ponagar kỳ bí của người Chăm, ngắm nhìn sông Cái hiền hòa. Tự do tắm biển Trần Phú.'),
('tour-nt-05', 2, 'Ngày 2: Du ngoạn Vịnh Nha Trang - Bãi Tranh - Hòn Tằm thư giãn', 'Cano đưa quý khách tham quan các đảo đẹp nhất vịnh. Vui chơi dù lượn, mô tô nước tại Bãi Tranh, thưởng thức tiệc BBQ hải sản tại làng chài và nghỉ ngơi tại khu du lịch Hòn Tằm.'),
('tour-nt-05', 3, 'Ngày 3: Trải nghiệm tắm bùn khoáng I-Resort - Chợ Đêm Nha Trang', 'Buổi sáng ngâm bùn khoáng nóng thiên nhiên giúp thư giãn cơ thể và làm đẹp da tại I-Resort. Chiều ghé thăm Viện Hải Dương Học với hàng nghìn sinh vật biển kỳ lạ. Tối dạo phố ẩm thực chợ đêm.'),
('tour-nt-05', 4, 'Ngày 4: Chợ Đầm mua quà hải sản - Tiễn sân bay Cam Ranh', 'Mua sắm đặc sản mực một nắng, chả cá Nha Trang và yến sào tại trung tâm thương mại Chợ Đầm. Xe đưa quý khách ra sân bay Cam Ranh đáp chuyến bay về TP. Hồ Chí Minh.'),

-- tour-dl-06
('tour-dl-06', 1, 'Ngày 1: TP.HCM - Đà Lạt - Ga xe lửa cổ - Quảng trường Lâm Viên', 'Xe đón khách xuất phát lên thành phố ngàn hoa. Ghé thăm Ga Đà Lạt với kiến trúc đầu tàu hơi nước độc đáo, check-in đóa hoa dã quỳ khổng lồ tại Quảng trường Lâm Viên bên hồ Xuân Hương.'),
('tour-dl-06', 2, 'Ngày 2: Săn mây đồi chè Cầu Đất - Thác Datanla - Thiền Viện Trúc Lâm', 'Sáng sớm trải nghiệm tour săn biển mây bồng bềnh tại đồi chè Cầu Đất. Trưa tham quan thác Datanla trải nghiệm hệ thống máng trượt uốn lượn xuyên rừng thông. Viếng Thiền Viện Trúc Lâm thanh tịnh.'),
('tour-dl-06', 3, 'Ngày 3: Vườn dâu tây công nghệ cao - Chợ Đà Lạt - Về TP.HCM', 'Tự tay hái và thưởng thức những trái dâu tây tươi mọng tại vườn sinh thái. Mua sắm mứt hoa quả, atiso tại chợ Đà Lạt trước khi khởi hành trở về TP. Hồ Chí Minh.'),

-- tour-sin-07
('tour-sin-07', 1, 'Ngày 1: TP.HCM - Sân bay Changi - Thác nước Jewel - Marina Bay', 'Đáp chuyến bay đi Singapore, chiêm ngưỡng thác nước trong nhà cao nhất thế giới tại Jewel Changi. Xe đón về khách sạn, tối dạo phố vịnh Marina ngắm show nhạc nước Spectra rực rỡ.'),
('tour-sin-07', 2, 'Ngày 2: Đảo Sentosa - Universal Studios - Biểu diễn ánh sáng Wings', 'Cả ngày khám phá đảo thiên đường giải trí Sentosa, tham quan chụp ảnh tại quả cầu xoay Universal Studios, thủy cung S.E.A Aquarium và thưởng thức màn biểu diễn nhạc nước laser Wings of Time.'),
('tour-sin-07', 3, 'Ngày 3: Gardens by the Bay - Cloud Forest & Flower Dome - Chinatown', 'Khám phá công viên cây năng lượng khổng lồ Gardens by the Bay, bước vào nhà kính nhân tạo mát lạnh Cloud Forest ngắm thác nước trong nhà, thăm chùa Răng Phật linh thiêng tại khu phố người Hoa.'),
('tour-sin-07', 4, 'Ngày 4: Công viên Sư tử biển Merlion - Mua sắm Orchard - Về TP.HCM', 'Check-in biểu tượng chú Sư tử biển phun nước Merlion Park nhìn ra nhà hát Trái Sầu Riêng Esplanade. Tự do mua sắm tại thiên đường Orchard Road trước khi ra sân bay Changi đáp chuyến bay về Việt Nam.'),

-- tour-qbinh-08
('tour-qbinh-08', 1, 'Ngày 1: Hà Nội - Đồng Hới - Đồi cát Quang Phú - Biển Nhật Lệ', 'Bay từ Hà Nội vào sân bay Đồng Hới. Check-in khách sạn, trưa thưởng thức hải sản địa phương. Chiều trải nghiệm trượt cát tại đồi cát trắng Quang Phú và tắm biển Nhật Lệ hoàng hôn.'),
('tour-qbinh-08', 2, 'Ngày 2: Di sản Phong Nha Kẻ Bàng - Động Phong Nha - Suối Nước Moọc', 'Đi thuyền trên sông Son êm đềm tiến vào lòng Động Phong Nha chiêm ngưỡng kỳ quan thạch nhũ đệ nhất động. Chiều tắm suối, chèo thuyền kayak và nhảy cầu mạo hiểm tại Suối Nước Moọc thơ mộng.'),
('tour-qbinh-08', 3, 'Ngày 3: Tượng đài Mẹ Suốt - Chợ Đồng Hới - Tiễn sân bay', 'Ghé thăm bến đò Mẹ Suốt bên dòng sông Nhật Lệ lịch sử. Mua sắm đặc sản khoai gieo, hải sản khô tại chợ trung tâm Đồng Hới. Xe tiễn quý khách ra sân bay Đồng Hới đáp chuyến bay về.');
