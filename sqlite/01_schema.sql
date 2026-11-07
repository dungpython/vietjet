-- =============================================================================
-- Database Schema for Vietjet Travel Booking Prototype (SQLite)
-- Conforms to requirements in 04_DATA_MODEL_AND_SQLITE.md
-- =============================================================================

PRAGMA foreign_keys = ON;

-- 1. Airlines table
CREATE TABLE IF NOT EXISTS airlines (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_path TEXT,
  is_active INTEGER NOT NULL DEFAULT 1
);

-- 2. Flights table
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

-- 3. Tours table
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

-- 4. Tour itinerary table
CREATE TABLE IF NOT EXISTS tour_itinerary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tour_id TEXT NOT NULL,
  day_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
);

-- 5. Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
  id TEXT PRIMARY KEY,
  item_type TEXT NOT NULL CHECK (item_type IN ('flight', 'tour')),
  item_ref_id TEXT NOT NULL,
  selected_fare TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL,
  added_at TEXT NOT NULL
);

-- 6. Bookings table
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

-- 7. Booking items table
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

-- =============================================================================
-- Indexes for optimized querying
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_flights_route ON flights(origin_code, destination_code, departure_datetime);
CREATE INDEX IF NOT EXISTS idx_flights_airline ON flights(airline_id);
CREATE INDEX IF NOT EXISTS idx_tours_featured ON tours(is_featured);
CREATE INDEX IF NOT EXISTS idx_tours_destination ON tours(destination);
CREATE INDEX IF NOT EXISTS idx_tour_itinerary_tour ON tour_itinerary(tour_id, day_number);
CREATE INDEX IF NOT EXISTS idx_bookings_ref ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_booking_items_booking ON booking_items(booking_id);
