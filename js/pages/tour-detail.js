/**
 * Tour Detail Controller for Vietjet Travel Prototype
 * Conforms to 01_PROJECT_REQUIREMENTS.md (Section 8) & 03_PAGES_AND_USER_FLOWS.md
 */

import { initDatabase, getTourById, getTourItinerary } from '../data-service.js';
import { addTourToCart } from '../cart-service.js';
import { renderHeader, renderFooter, showToast } from '../components.js';
import { getQueryParams, formatVND, formatDateVN, escapeHTML } from '../router-utils.js';

let currentTour = null;

document.addEventListener('DOMContentLoaded', async () => {
  renderHeader('tours');
  await initDatabase();
  renderFooter();

  const params = getQueryParams();
  if (!params.id) {
    renderTourNotFound();
    return;
  }

  currentTour = await getTourById(params.id);
  if (!currentTour) {
    renderTourNotFound();
    return;
  }

  const itinerary = await getTourItinerary(currentTour.id);
  renderTourDetail(itinerary);
  attachTourDetailEvents();
});

function renderTourNotFound() {
  const container = document.querySelector('#tour-detail-container');
  if (!container) return;
  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">❌</div>
      <h2 class="empty-title">Không tìm thấy thông tin tour</h2>
      <p class="empty-desc">Tour du lịch bạn chọn không tồn tại hoặc đã tạm dừng nhận đăng ký.</p>
      <a href="tours.html" class="btn btn-primary">Quay lại danh sách tour</a>
    </div>
  `;
}

function renderTourDetail(itinerary = []) {
  const container = document.querySelector('#tour-detail-container');
  if (!container || !currentTour) return;

  const t = currentTour;

  container.innerHTML = `
    <div style="margin-bottom: var(--spacing-xl);">
      <a href="tours.html" class="btn btn-ghost btn-sm">← Quay lại danh sách tour</a>
    </div>

    <!-- Tour Banner & Overview -->
    <div class="card" style="overflow: hidden; margin-bottom: var(--spacing-xl);">
      <div style="position: relative; max-height: 420px; overflow: hidden; background-color: #374151;">
        <img src="${escapeHTML(t.thumbnail_path)}" alt="${escapeHTML(t.title)}" style="width: 100%; height: 380px; object-fit: cover;" onerror="this.src='assets/images/tours/tour-danang.jpg'">
        <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: var(--spacing-xl); background: linear-gradient(transparent, rgba(0,0,0,0.85)); color: #FFFFFF;">
          <div style="display: flex; gap: 8px; margin-bottom: 8px;">
            <span class="badge badge-red">Tour Nổi Bật</span>
            <span class="badge badge-blue">${t.duration_days} ngày ${t.duration_nights} đêm</span>
            ${t.airline_name ? `<span class="badge badge-green">Hãng bay: ${escapeHTML(t.airline_name)}</span>` : ''}
          </div>
          <h1 style="font-size: 28px; font-weight: 800; line-height: 1.3; margin: 0;">${escapeHTML(t.title)}</h1>
        </div>
      </div>

      <div style="padding: var(--spacing-xl); display: grid; grid-template-columns: 2fr 1fr; gap: var(--spacing-xl);">
        <div>
          <h2 style="font-size: 20px; font-weight: 800; margin-bottom: var(--spacing-md);">Giới thiệu hành trình</h2>
          <p style="color: #4B5563; font-size: 15px; line-height: 1.7; margin-bottom: var(--spacing-lg);">
            ${escapeHTML(t.description || t.service_summary)}
          </p>

          <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 10px;">Dịch vụ bao gồm trong tour:</h3>
          <div style="background-color: var(--color-surface); padding: var(--spacing-md); border-radius: var(--radius-md); font-size: 14px; line-height: 1.6; color: #374151; margin-bottom: var(--spacing-xl);">
            ✨ ${escapeHTML(t.service_summary || 'Xe đưa đón, hướng dẫn viên, khách sạn lưu trú tiêu chuẩn.')}
          </div>

          <!-- Day by day Itinerary -->
          <h2 style="font-size: 20px; font-weight: 800; margin-bottom: var(--spacing-md);">Lịch trình chi tiết từng ngày</h2>
          <div class="itinerary-list">
            ${itinerary.length > 0 ? itinerary.map(item => `
              <div class="itinerary-item">
                <div class="itinerary-header">
                  <span class="day-badge">Ngày ${item.day_number}</span>
                  <span>${escapeHTML(item.title)}</span>
                </div>
                <div class="itinerary-content">
                  ${escapeHTML(item.description)}
                </div>
              </div>
            `).join('') : '<p class="empty-desc">Chưa có thông tin lịch trình chi tiết.</p>'}
          </div>

          <!-- Policy & Notes Placeholder -->
          <div style="margin-top: var(--spacing-2xl); border-top: 1px solid var(--color-border); padding-top: var(--spacing-lg);">
            <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">Quy định hủy tour & Lưu ý demo:</h3>
            <p style="font-size: 13px; color: var(--color-muted); line-height: 1.6;">
              Hủy trước 07 ngày: miễn phí. Hủy trước 03-05 ngày: phí 50% tiền cọc. Mọi thông tin chương trình là dữ liệu mô phỏng độc lập cho prototype website.
            </p>
          </div>
        </div>

        <!-- Sticky Booking Widget -->
        <div>
          <div class="order-summary-box">
            <div style="font-size: 13px; color: var(--color-muted); font-weight: 600;">GIÁ TOUR TRỌN GÓI / KHÁCH</div>
            <div class="price price-large" style="margin: 8px 0;">${formatVND(t.price)}</div>
            
            <div style="margin: var(--spacing-md) 0; font-size: 14px; display: flex; flex-direction: column; gap: 8px; border-bottom: 1px solid var(--color-border); padding-bottom: var(--spacing-md);">
              <div>📍 <strong>Điểm đến:</strong> ${escapeHTML(t.destination)}</div>
              <div>🚩 <strong>Khởi hành từ:</strong> ${escapeHTML(t.departure_city || 'TP. Hồ Chí Minh')}</div>
              <div>📅 <strong>Ngày khởi hành mẫu:</strong> ${formatDateVN(t.departure_datetime)}</div>
              <div>🏢 <strong>Nhà tổ chức:</strong> ${escapeHTML(t.operator_name)}</div>
            </div>

            <button id="add-tour-to-cart-btn" class="btn btn-primary btn-lg" style="width: 100%;">
              🛒 Thêm tour vào giỏ hàng
            </button>
            <p style="font-size: 12px; color: var(--color-muted); text-align: center; margin-top: 10px;">
              Xác nhận tức thì • Không trừ tiền tài khoản
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function attachTourDetailEvents() {
  const addBtn = document.querySelector('#add-tour-to-cart-btn');
  if (addBtn && currentTour) {
    addBtn.addEventListener('click', async () => {
      try {
        await addTourToCart(currentTour);
        showToast('Đã thêm tour du lịch vào giỏ hàng thành công!', 'success');

        addBtn.textContent = '✓ Đã thêm vào giỏ';
        addBtn.disabled = true;
        setTimeout(() => {
          addBtn.textContent = '🛒 Thêm tour vào giỏ hàng';
          addBtn.disabled = false;
        }, 2000);
      } catch (err) {
        console.error('Failed to add tour to cart:', err);
        showToast('Không thể thêm tour vào giỏ hàng.', 'error');
      }
    });
  }
}
