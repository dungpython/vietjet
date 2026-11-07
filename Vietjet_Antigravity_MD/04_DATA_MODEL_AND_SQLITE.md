# 04 --- Data Model and SQLite

## Runtime approach

Use SQLite WASM in the browser, for example SQL.js. Since browser
JavaScript cannot write directly to an arbitrary local disk path,
persist the exported SQLite database bytes in IndexedDB. On startup: 1.
Open IndexedDB. 2. Load the saved SQLite database bytes if present. 3.
Otherwise initialize the schema and seed sample data. 4. Run queries
through SQL.js. 5. Export and save database bytes after mutations.

If SQL.js setup proves too heavy for the first iteration, build a small
data-access adapter and use JSON seed data temporarily. Keep the adapter
interface stable so SQLite can be added without rewriting page logic. Do
not silently describe JSON/localStorage as SQLite.

## Suggested schema

``` sql
PRAGMA foreign_keys = ON;

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
```

## Data rules

-   Store dates as ISO 8601 strings.
-   Store prices as integer VND, not floating point.
-   Use stable string IDs for sample airlines, flights, and tours.
-   Use parameterized SQL queries where supported.
-   Escape user-generated text before inserting into HTML; prefer
    `textContent` over `innerHTML`.
-   Do not use the database as a substitute for server-side security.
-   Do not store card numbers, passwords, or sensitive identity
    documents.

## Example seed data

Create at least: - 4 airline records. - 12--20 sample flight records
across several routes and dates. - Exactly 8 featured tour records. - At
least 3 itinerary days for each featured tour, adjusted to the tour
duration.

Sample records must be clearly fictional/demo inventory. Prices and
schedules are not live quotes.

## Data access API

Create a small module such as `js/data-service.js` with functions:

``` js
initDatabase()
getAirlines()
getFeaturedTours()
searchFlights(criteria)
getFlightById(id)
searchTours(filters)
getTourById(id)
getTourItinerary(tourId)
getCartItems()
addCartItem(item)
removeCartItem(cartItemId)
clearCart()
createBooking(customer, cartItems)
getBookingByReference(reference)
```

Keep SQL details inside the data service. Page scripts should call these
functions rather than assembling SQL queries themselves.
