/**
 * Cart and Checkout Controller for Vietjet Travel Prototype
 * Conforms to 01_PROJECT_REQUIREMENTS.md (Sections 9 & 10) & 03_PAGES_AND_USER_FLOWS.md
 */

import { initDatabase, getCartItems, removeCartItem, clearCart, createBooking, getFlightById, getTourById } from '../data-service.js';
import { updateCartBadge } from '../cart-service.js';
import { renderHeader, renderFooter, showToast } from '../components.js';
import { formatVND, escapeHTML } from '../router-utils.js';

let cartItemsWithDetails = [];

document.addEventListener('DOMContentLoaded', async () => {
  renderHeader('cart');
  await initDatabase();
  renderFooter();

  await loadAndRenderCart();
  attachCheckoutFormEvents();
});

async function loadAndRenderCart() {
  const container = document.querySelector('#cart-content-container');
  if (!container) return;

  const rawCartItems = await getCartItems();
  await updateCartBadge();

  if (!rawCartItems || rawCartItems.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🛒</div>
        <h2 class="empty-title">Giỏ hàng của bạn đang trống</h2>
        <p class="empty-desc">Chưa có chuyến bay hoặc tour du lịch nào được chọn. Hãy khám phá và thêm các dịch vụ bạn yêu thích!</p>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <a href="flights.html" class="btn btn-primary">Tìm chuyến bay</a>
          <a href="tours.html" class="btn btn-secondary">Khám phá tour du lịch</a>
        </div>
      </div>
    `;
    return;
  }

  // Enrich item details
  cartItemsWithDetails = [];
  let subtotal = 0;

  for (const item of rawCartItems) {
    let name = item.item_type === 'flight' ? 'Vé máy bay' : 'Tour du lịch';
    let subtitle = item.selected_fare || '';

    if (item.item_type === 'flight') {
      const flight = await getFlightById(item.item_ref_id);
      if (flight) {
        name = `Vé máy bay ${flight.airline_name} ${flight.flight_number}: ${flight.origin_city} ➔ ${flight.destination_city}`;
      }
    } else if (item.item_type === 'tour') {
      const tour = await getTourById(item.item_ref_id);
      if (tour) {
        name = `Tour: ${tour.title}`;
        subtitle = `Thời lượng: ${tour.duration_days} ngày ${tour.duration_nights} đêm - Điểm đến: ${tour.destination}`;
      }
    }

    const itemTotal = item.unit_price * (item.quantity || 1);
    subtotal += itemTotal;

    cartItemsWithDetails.push({
      ...item,
      name,
      subtitle,
      lineTotal: itemTotal
    });
  }

  container.innerHTML = `
    <div class="cart-layout">
      <!-- Items List -->
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
          <h2 style="font-size: 20px; font-weight: 800;">Dịch vụ đã chọn (${cartItemsWithDetails.length})</h2>
          <button id="clear-cart-btn" class="btn btn-ghost btn-sm" style="color: var(--color-danger);">
            🗑 Xóa toàn bộ giỏ hàng
          </button>
        </div>

        <div class="cart-items-list">
          ${cartItemsWithDetails.map(item => `
            <div class="cart-item-row" data-id="${escapeHTML(item.id)}">
              <div class="cart-item-meta">
                <span class="badge ${item.item_type === 'flight' ? 'badge-blue' : 'badge-green'}" style="margin-bottom: 6px;">
                  ${item.item_type === 'flight' ? '✈ Chuyến bay' : '🏖 Tour du lịch'}
                </span>
                <div class="cart-item-name">${escapeHTML(item.name)}</div>
                <div class="cart-item-sub">${escapeHTML(item.subtitle)} • SL: ${item.quantity || 1}</div>
              </div>
              <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
                <div class="cart-item-price">${formatVND(item.lineTotal)}</div>
                <button class="btn btn-ghost btn-sm remove-item-btn" data-id="${escapeHTML(item.id)}" style="color: var(--color-danger); padding: 2px 6px;">
                  Xóa
                </button>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Customer Information Form -->
        <div class="card" style="padding: var(--spacing-xl); margin-top: var(--spacing-2xl);">
          <h3 style="font-size: 18px; font-weight: 800; margin-bottom: var(--spacing-md); border-bottom: 1px solid var(--color-border); padding-bottom: 8px;">
            Thông tin người đặt dịch vụ (Demo)
          </h3>
          <p style="font-size: 13px; color: var(--color-muted); margin-bottom: var(--spacing-lg);">
            Hệ thống chỉ thu thập thông tin cơ bản cho mục đích thử nghiệm và tạo đơn hàng mô phỏng.
          </p>

          <form id="checkout-form">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md); margin-bottom: var(--spacing-md);">
              <div class="form-field">
                <label class="form-label" for="cust-name">Họ và tên <span class="required">*</span></label>
                <input type="text" id="cust-name" class="form-control" placeholder="Nguyễn Văn A" required>
              </div>
              <div class="form-field">
                <label class="form-label" for="cust-phone">Số điện thoại <span class="required">*</span></label>
                <input type="tel" id="cust-phone" class="form-control" placeholder="0912345678" required>
              </div>
            </div>

            <div class="form-field" style="margin-bottom: var(--spacing-md);">
              <label class="form-label" for="cust-email">Địa chỉ Email <span class="required">*</span></label>
              <input type="email" id="cust-email" class="form-control" placeholder="example@email.com" required>
            </div>

            <div class="form-field" style="margin-bottom: var(--spacing-md);">
              <label class="form-label" for="cust-note">Ghi chú hoặc yêu cầu đặc biệt (Không bắt buộc)</label>
              <textarea id="cust-note" class="form-control" rows="2" placeholder="Ví dụ: Cần ghế gần cửa sổ hoặc suất ăn chay..."></textarea>
            </div>

            <div style="margin-bottom: var(--spacing-lg);">
              <label style="display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: #4B5563; cursor: pointer;">
                <input type="checkbox" id="cust-consent" style="margin-top: 3px;" required>
                <span>Tôi đồng ý với các điều khoản mẫu và hiểu rõ đây là website thử nghiệm độc lập (demo prototype), không có thanh toán tiền thực tế.</span>
              </label>
            </div>

            <button type="submit" id="submit-booking-btn" class="btn btn-primary btn-lg" style="width: 100%;">
              ✓ Xác nhận đặt dịch vụ & Hoàn tất
            </button>
          </form>
        </div>
      </div>

      <!-- Order Summary Column -->
      <div>
        <div class="order-summary-box">
          <h3 style="font-size: 18px; font-weight: 800; margin-bottom: var(--spacing-md);">Tóm tắt chi phí</h3>
          <div class="summary-row">
            <span>Tạm tính các mục</span>
            <span>${formatVND(subtotal)}</span>
          </div>
          <div class="summary-row">
            <span>Thuế & Phí dịch vụ</span>
            <span style="color: var(--color-success); font-weight: 600;">Đã bao gồm</span>
          </div>
          <div class="summary-row total">
            <span>Tổng cộng thanh toán</span>
            <span class="price">${formatVND(subtotal)}</span>
          </div>
          <p style="font-size: 12px; color: var(--color-muted); margin-top: var(--spacing-md); line-height: 1.5;">
            * Mức giá mang tính chất minh họa phục vụ demo hệ thống SQLite Web.
          </p>
        </div>
      </div>
    </div>
  `;

  // Attach Item Remove Events
  document.querySelectorAll('.remove-item-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.getAttribute('data-id');
      await removeCartItem(id);
      showToast('Đã xóa mục khỏi giỏ hàng.', 'info');
      await loadAndRenderCart();
    });
  });

  // Attach Clear Cart Event
  const clearBtn = document.querySelector('#clear-cart-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', async () => {
      if (confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?')) {
        await clearCart();
        showToast('Đã xóa sạch giỏ hàng.', 'info');
        await loadAndRenderCart();
      }
    });
  }

  attachCheckoutFormEvents();
}

function attachCheckoutFormEvents() {
  const form = document.querySelector('#checkout-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.querySelector('#cust-name').value.trim();
    const phone = document.querySelector('#cust-phone').value.trim();
    const email = document.querySelector('#cust-email').value.trim();
    const note = document.querySelector('#cust-note').value.trim();
    const consent = document.querySelector('#cust-consent').checked;

    if (!name || !phone || !email) {
      showToast('Vui lòng điền đầy đủ các thông tin bắt buộc!', 'error');
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('Địa chỉ email không hợp lệ!', 'error');
      document.querySelector('#cust-email').focus();
      return;
    }

    if (!consent) {
      showToast('Vui lòng tích chọn đồng ý điều khoản thử nghiệm!', 'error');
      return;
    }

    const submitBtn = document.querySelector('#submit-booking-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Đang xử lý lưu đơn hàng vào SQLite...';
    }

    try {
      const customer = { name, phone, email, note };
      const booking = await createBooking(customer, cartItemsWithDetails);

      showToast('Đặt dịch vụ thành công! Đang chuyển hướng...', 'success');
      setTimeout(() => {
        window.location.href = `confirmation.html?ref=${encodeURIComponent(booking.bookingReference)}`;
      }, 800);
    } catch (err) {
      console.error('Failed to create booking:', err);
      showToast('Đã xảy ra lỗi khi tạo đơn đặt hàng.', 'error');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = '✓ Xác nhận đặt dịch vụ & Hoàn tất';
      }
    }
  });
}
