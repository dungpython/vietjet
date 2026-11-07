/**
 * Data Service for Vietjet Travel Prototype
 * Implements the API specified in 04_DATA_MODEL_AND_SQLITE.md
 * Queries SQLite via dbManager or fallback adapter.
 */

import { dbManager } from './database.js';

export async function initDatabase() {
  await dbManager.init();
}

export function getEngineStatus() {
  return dbManager.getEngine();
}

/**
 * Get all active airlines
 */
export async function getAirlines() {
  if (dbManager.engine === 'sqlite-wasm') {
    return dbManager.query('SELECT * FROM airlines WHERE is_active = 1 ORDER BY name ASC');
  }
  return dbManager.fallbackData.airlines.filter(a => a.is_active === 1);
}

/**
 * Get exactly 8 featured tours
 */
export async function getFeaturedTours() {
  if (dbManager.engine === 'sqlite-wasm') {
    return dbManager.query('SELECT * FROM tours WHERE is_featured = 1 ORDER BY price ASC LIMIT 8');
  }
  return dbManager.fallbackData.tours
    .filter(t => t.is_featured === 1)
    .slice(0, 8);
}

/**
 * Search and filter flights
 * Criteria: origin, destination, departureDate, airline, cabin, sort (price_asc, price_desc, time_asc)
 */
export async function searchFlights(criteria = {}) {
  const { origin, destination, departureDate, airline, tripType, stops, sort } = criteria;

  if (dbManager.engine === 'sqlite-wasm') {
    let sql = 'SELECT f.*, a.name as airline_name, a.logo_path FROM flights f JOIN airlines a ON f.airline_id = a.id WHERE 1=1';
    const params = [];

    if (origin) {
      sql += ' AND (f.origin_code = ? OR f.origin_city LIKE ?)';
      params.push(origin, `%${origin}%`);
    }
    if (destination) {
      sql += ' AND (f.destination_code = ? OR f.destination_city LIKE ?)';
      params.push(destination, `%${destination}%`);
    }
    if (departureDate) {
      sql += ' AND substr(f.departure_datetime, 1, 10) = ?';
      params.push(departureDate);
    }
    if (airline) {
      sql += ' AND f.airline_id = ?';
      params.push(airline);
    }
    if (stops !== undefined && stops !== null && stops !== '') {
      sql += ' AND f.stops = ?';
      params.push(parseInt(stops, 10));
    }

    if (sort === 'price_asc') {
      sql += ' ORDER BY f.economy_price ASC';
    } else if (sort === 'price_desc') {
      sql += ' ORDER BY f.economy_price DESC';
    } else if (sort === 'time_asc') {
      sql += ' ORDER BY f.departure_datetime ASC';
    } else {
      sql += ' ORDER BY f.departure_datetime ASC';
    }

    return dbManager.query(sql, params);
  }

  // Fallback adapter logic
  let results = dbManager.fallbackData.flights.map(f => {
    const a = dbManager.fallbackData.airlines.find(air => air.id === f.airline_id) || {};
    return { ...f, airline_name: a.name || '', logo_path: a.logo_path || '' };
  });

  if (origin) {
    results = results.filter(f => f.origin_code === origin || f.origin_city.toLowerCase().includes(origin.toLowerCase()));
  }
  if (destination) {
    results = results.filter(f => f.destination_code === destination || f.destination_city.toLowerCase().includes(destination.toLowerCase()));
  }
  if (departureDate) {
    results = results.filter(f => f.departure_datetime.startsWith(departureDate));
  }
  if (airline) {
    results = results.filter(f => f.airline_id === airline);
  }
  if (stops !== undefined && stops !== null && stops !== '') {
    results = results.filter(f => f.stops === parseInt(stops, 10));
  }

  if (sort === 'price_asc') {
    results.sort((a, b) => a.economy_price - b.economy_price);
  } else if (sort === 'price_desc') {
    results.sort((a, b) => b.economy_price - a.economy_price);
  } else {
    results.sort((a, b) => new Date(a.departure_datetime) - new Date(b.departure_datetime));
  }

  return results;
}

/**
 * Get flight by ID
 */
export async function getFlightById(id) {
  if (!id) return null;
  if (dbManager.engine === 'sqlite-wasm') {
    const rows = dbManager.query(
      'SELECT f.*, a.name as airline_name, a.logo_path FROM flights f JOIN airlines a ON f.airline_id = a.id WHERE f.id = ?',
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  }
  const f = dbManager.fallbackData.flights.find(item => item.id === id);
  if (!f) return null;
  const a = dbManager.fallbackData.airlines.find(air => air.id === f.airline_id) || {};
  return { ...f, airline_name: a.name || '', logo_path: a.logo_path || '' };
}

/**
 * Search and filter tours
 */
export async function searchTours(filters = {}) {
  const { destination, departureCity, durationDays, airline, sort } = filters;

  if (dbManager.engine === 'sqlite-wasm') {
    let sql = 'SELECT t.*, a.name as airline_name FROM tours t LEFT JOIN airlines a ON t.associated_airline_id = a.id WHERE 1=1';
    const params = [];

    if (destination) {
      sql += ' AND (t.destination LIKE ? OR t.title LIKE ?)';
      params.push(`%${destination}%`, `%${destination}%`);
    }
    if (departureCity) {
      sql += ' AND t.departure_city LIKE ?';
      params.push(`%${departureCity}%`);
    }
    if (durationDays) {
      sql += ' AND t.duration_days = ?';
      params.push(parseInt(durationDays, 10));
    }
    if (airline) {
      sql += ' AND t.associated_airline_id = ?';
      params.push(airline);
    }

    if (sort === 'price_asc') {
      sql += ' ORDER BY t.price ASC';
    } else if (sort === 'price_desc') {
      sql += ' ORDER BY t.price DESC';
    } else {
      sql += ' ORDER BY t.is_featured DESC, t.price ASC';
    }

    return dbManager.query(sql, params);
  }

  // Fallback adapter logic
  let results = dbManager.fallbackData.tours.map(t => {
    const a = dbManager.fallbackData.airlines.find(air => air.id === t.associated_airline_id) || {};
    return { ...t, airline_name: a.name || '' };
  });

  if (destination) {
    results = results.filter(t => t.destination.toLowerCase().includes(destination.toLowerCase()) || t.title.toLowerCase().includes(destination.toLowerCase()));
  }
  if (departureCity) {
    results = results.filter(t => t.departure_city && t.departure_city.toLowerCase().includes(departureCity.toLowerCase()));
  }
  if (durationDays) {
    results = results.filter(t => t.duration_days === parseInt(durationDays, 10));
  }
  if (airline) {
    results = results.filter(t => t.associated_airline_id === airline);
  }

  if (sort === 'price_asc') {
    results.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    results.sort((a, b) => b.price - a.price);
  } else {
    results.sort((a, b) => b.is_featured - a.is_featured || a.price - b.price);
  }

  return results;
}

/**
 * Get tour by ID
 */
export async function getTourById(id) {
  if (!id) return null;
  if (dbManager.engine === 'sqlite-wasm') {
    const rows = dbManager.query(
      'SELECT t.*, a.name as airline_name FROM tours t LEFT JOIN airlines a ON t.associated_airline_id = a.id WHERE t.id = ?',
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  }
  const t = dbManager.fallbackData.tours.find(item => item.id === id);
  if (!t) return null;
  const a = dbManager.fallbackData.airlines.find(air => air.id === t.associated_airline_id) || {};
  return { ...t, airline_name: a.name || '' };
}

/**
 * Get tour itinerary days
 */
export async function getTourItinerary(tourId) {
  if (!tourId) return [];
  if (dbManager.engine === 'sqlite-wasm') {
    return dbManager.query(
      'SELECT * FROM tour_itinerary WHERE tour_id = ? ORDER BY day_number ASC',
      [tourId]
    );
  }
  return dbManager.fallbackData.tour_itinerary
    .filter(i => i.tour_id === tourId)
    .sort((a, b) => a.day_number - b.day_number);
}

/**
 * Cart Operations
 */
export async function getCartItems() {
  if (dbManager.engine === 'sqlite-wasm') {
    return dbManager.query('SELECT * FROM cart_items ORDER BY added_at DESC');
  }
  return dbManager.fallbackData.cart_items || [];
}

export async function addCartItem(item) {
  const id = 'cart-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
  const addedAt = new Date().toISOString();
  const quantity = item.quantity || 1;

  if (dbManager.engine === 'sqlite-wasm') {
    await dbManager.run(
      'INSERT INTO cart_items (id, item_type, item_ref_id, selected_fare, quantity, unit_price, added_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, item.item_type, item.item_ref_id, item.selected_fare || null, quantity, item.unit_price, addedAt]
    );
  } else {
    dbManager.fallbackData.cart_items = dbManager.fallbackData.cart_items || [];
    dbManager.fallbackData.cart_items.push({
      id,
      item_type: item.item_type,
      item_ref_id: item.item_ref_id,
      selected_fare: item.selected_fare || null,
      quantity,
      unit_price: item.unit_price,
      added_at: addedAt
    });
    await dbManager.persist();
  }
  return id;
}

export async function removeCartItem(cartItemId) {
  if (dbManager.engine === 'sqlite-wasm') {
    await dbManager.run('DELETE FROM cart_items WHERE id = ?', [cartItemId]);
  } else {
    dbManager.fallbackData.cart_items = (dbManager.fallbackData.cart_items || []).filter(i => i.id !== cartItemId);
    await dbManager.persist();
  }
}

export async function clearCart() {
  if (dbManager.engine === 'sqlite-wasm') {
    await dbManager.run('DELETE FROM cart_items');
  } else {
    dbManager.fallbackData.cart_items = [];
    await dbManager.persist();
  }
}

/**
 * Create demo booking
 */
export async function createBooking(customer, cartItems) {
  const bookingId = 'bk-' + Date.now();
  const bookingRef = 'VJ-' + Math.floor(100000 + Math.random() * 900000);
  const createdAt = new Date().toISOString();
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.unit_price * (item.quantity || 1)), 0);

  if (dbManager.engine === 'sqlite-wasm') {
    await dbManager.run(
      'INSERT INTO bookings (id, booking_reference, customer_name, customer_email, customer_phone, customer_note, total_amount, created_at, email_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [bookingId, bookingRef, customer.name, customer.email, customer.phone, customer.note || '', totalAmount, createdAt, 'not_configured']
    );

    for (const item of cartItems) {
      await dbManager.run(
        'INSERT INTO booking_items (booking_id, item_type, item_ref_id, item_name, selected_fare, quantity, unit_price) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [bookingId, item.item_type, item.item_ref_id, item.name || 'Dịch vụ', item.selected_fare || null, item.quantity || 1, item.unit_price]
      );
    }
  } else {
    dbManager.fallbackData.bookings = dbManager.fallbackData.bookings || [];
    dbManager.fallbackData.booking_items = dbManager.fallbackData.booking_items || [];

    dbManager.fallbackData.bookings.push({
      id: bookingId,
      booking_reference: bookingRef,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      customer_note: customer.note || '',
      total_amount: totalAmount,
      created_at: createdAt,
      email_status: 'not_configured'
    });

    for (const item of cartItems) {
      dbManager.fallbackData.booking_items.push({
        id: Date.now() + Math.floor(Math.random() * 1000),
        booking_id: bookingId,
        item_type: item.item_type,
        item_ref_id: item.item_ref_id,
        item_name: item.name || 'Dịch vụ',
        selected_fare: item.selected_fare || null,
        quantity: item.quantity || 1,
        unit_price: item.unit_price
      });
    }
    await dbManager.persist();
  }

  // Clear cart after booking
  await clearCart();

  return {
    bookingId,
    bookingReference: bookingRef,
    totalAmount,
    createdAt
  };
}

/**
 * Get booking by booking_reference
 */
export async function getBookingByReference(reference) {
  if (!reference) return null;

  if (dbManager.engine === 'sqlite-wasm') {
    const bookings = dbManager.query('SELECT * FROM bookings WHERE booking_reference = ?', [reference]);
    if (bookings.length === 0) return null;
    const booking = bookings[0];
    const items = dbManager.query('SELECT * FROM booking_items WHERE booking_id = ?', [booking.id]);
    return { ...booking, items };
  }

  const b = (dbManager.fallbackData.bookings || []).find(x => x.booking_reference === reference);
  if (!b) return null;
  const items = (dbManager.fallbackData.booking_items || []).filter(x => x.booking_id === b.id);
  return { ...b, items };
}
