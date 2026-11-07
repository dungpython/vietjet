/**
 * Cart Service for Vietjet Travel Prototype
 * Handles cart item state, cart badge, and checkout helpers.
 */

import { getCartItems, addCartItem, removeCartItem, clearCart } from './data-service.js';

export async function updateCartBadge() {
  const badgeEl = document.querySelector('#cart-count-badge');
  if (!badgeEl) return;

  try {
    const items = await getCartItems();
    const totalCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    badgeEl.textContent = totalCount;
    badgeEl.style.display = totalCount > 0 ? 'inline-block' : 'none';
  } catch (err) {
    console.error('Failed to update cart badge:', err);
  }
}

export async function addFlightToCart(flight, fareClass = 'economy') {
  const unitPrice = fareClass === 'business' ? (flight.business_price || flight.economy_price * 2) : flight.economy_price;
  const fareLabel = fareClass === 'business' ? 'Hạng Thương gia (Business)' : 'Hạng Phổ thông (Eco)';

  const item = {
    item_type: 'flight',
    item_ref_id: flight.id,
    selected_fare: fareLabel,
    unit_price: unitPrice,
    quantity: 1,
    name: `Vé máy bay ${flight.airline_name} ${flight.flight_number} (${flight.origin_code} - ${flight.destination_code})`
  };

  const id = await addCartItem(item);
  await updateCartBadge();
  return id;
}

export async function addTourToCart(tour) {
  const item = {
    item_type: 'tour',
    item_ref_id: tour.id,
    selected_fare: `${tour.duration_days} ngày ${tour.duration_nights} đêm`,
    unit_price: tour.price,
    quantity: 1,
    name: `Tour du lịch: ${tour.title}`
  };

  const id = await addCartItem(item);
  await updateCartBadge();
  return id;
}
