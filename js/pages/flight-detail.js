/**
 * Flight Detail Controller for Vietjet Travel Prototype
 * Conforms to 01_PROJECT_REQUIREMENTS.md (Section 6) & 03_PAGES_AND_USER_FLOWS.md
 */

import { initDatabase, getFlightById } from '../data-service.js';
import { addFlightToCart } from '../cart-service.js';
import { renderHeader, renderFooter, showToast } from '../components.js';
import { getQueryParams, formatVND, formatDateVN, formatTime, formatDuration, escapeHTML } from '../router-utils.js';

let currentFlight = null;
let selectedFareClass = 'economy';

document.addEventListener('DOMContentLoaded', async () => {
  renderHeader('flights');
  await initDatabase();
  renderFooter();

  const params = getQueryParams();
  if (!params.id) {
    renderNotFound();
    return;
  }

  currentFlight = await getFlightById(params.id);
  if (!currentFlight) {
    renderNotFound();
    return;
  }

  renderFlightDetail();
  attachEvents();
});

function renderNotFound() {
  const container = document.querySelector('#flight-detail-container');
  if (!container) return;
  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">❌</div>
      <h2 class="empty-title">Không tìm thấy thông tin chuyến bay</h2>
      <p class="empty-desc">Chuyến bay bạn yêu cầu không tồn tại hoặc đã hết thời gian hiển thị trong hệ thống demo.</p>
      <a href="flights.html" class="btn btn-primary">Quay lại danh sách chuyến bay</a>
    </div>
  `;
}

function renderFlightDetail() {
  const container = document.querySelector('#flight-detail-container');
  if (!container || !currentFlight) return;

  const f = currentFlight;
  const ecoPrice = f.economy_price;
  const busPrice = f.business_price || (f.economy_price * 2);

  container.innerHTML = `
    <div style="margin-bottom: var(--spacing-xl);">
      <a href="flights.html" class="btn btn-ghost btn-sm">← Quay lại danh sách chuyến bay</a>
    </div>

    <!-- Flight Header Overview -->
    <div class="card" style="padding: var(--spacing-xl); margin-bottom: var(--spacing-xl);">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border); padding-bottom: var(--spacing-md); margin-bottom: var(--spacing-lg);">
        <div style="display: flex; align-items: center; gap: 12px;">
          <img src="${escapeHTML(f.logo_path)}" alt="${escapeHTML(f.airline_name)}" class="airline-logo-sm" onerror="this.style.display='none'">
          <div>
            <h1 style="font-size: 24px; font-weight: 800; margin: 0;">${escapeHTML(f.airline_name)} - Số hiệu ${escapeHTML(f.flight_number)}</h1>
            <div style="color: var(--color-muted); font-size: 14px;">Dòng máy bay: <strong>${escapeHTML(f.aircraft_type || 'Airbus A320')}</strong> • Bay thẳng</div>
          </div>
        </div>
        <div class="badge badge-green">Đang mở bán vé demo</div>
      </div>

      <!-- Schedule Route -->
      <div style="display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: var(--spacing-xl); background: var(--color-surface); padding: var(--spacing-lg); border-radius: var(--radius-md);">
        <div>
          <div style="font-size: 13px; color: var(--color-muted); font-weight: 600;">KHỞI HÀNH</div>
          <div style="font-size: 28px; font-weight: 900; color: var(--color-text);">${formatTime(f.departure_datetime)}</div>
          <div style="font-size: 16px; font-weight: 700;">${escapeHTML(f.origin_city)} (${escapeHTML(f.origin_code)})</div>
          <div style="font-size: 13px; color: var(--color-muted);">Ngày: ${formatDateVN(f.departure_datetime)}</div>
        </div>

        <div style="text-align: center;">
          <div style="font-size: 13px; font-weight: 600; color: var(--color-muted);">${formatDuration(f.duration_minutes)}</div>
          <div style="font-size: 20px; color: var(--color-primary); margin: 4px 0;">✈ ──────── ✈</div>
          <div class="flight-stops-tag">Bay thẳng không đổi chặng</div>
        </div>

        <div style="text-align: right;">
          <div style="font-size: 13px; color: var(--color-muted); font-weight: 600;">HẠ CÁNH</div>
          <div style="font-size: 28px; font-weight: 900; color: var(--color-text);">${formatTime(f.arrival_datetime)}</div>
          <div style="font-size: 16px; font-weight: 700;">${escapeHTML(f.destination_city)} (${escapeHTML(f.destination_code)})</div>
          <div style="font-size: 13px; color: var(--color-muted);">Ngày: ${formatDateVN(f.arrival_datetime)}</div>
        </div>
      </div>
    </div>

    <!-- Fare Selection Grid -->
    <h2 style="font-size: 22px; font-weight: 800; margin-bottom: var(--spacing-md);">Chọn hạng vé phù hợp với bạn</h2>
    <p style="color: var(--color-muted); font-size: 14px; margin-bottom: var(--spacing-lg);">Mọi quyền lợi và mức giá hiển thị dưới đây là thông tin mẫu thử nghiệm prototype.</p>

    <div class="fare-cards-grid">
      <!-- Economy Fare Card -->
      <div class="fare-card selected" id="fare-card-economy" data-fare="economy">
        <div class="fare-card-header">
          <div>
            <div class="fare-title">Hạng Phổ Thông (Eco)</div>
            <div class="price-label">Lựa chọn tiết kiệm nhất</div>
          </div>
          <div class="price">${formatVND(ecoPrice)}</div>
        </div>
        <ul class="fare-benefits">
          <li>01 kiện hành lý xách tay 07kg tiêu chuẩn</li>
          <li>Ghế ngồi êm ái khoảng để chân rộng rãi</li>
          <li>Nước lọc miễn phí suốt hành trình</li>
          <li>Được phép đổi ngày bay (áp dụng phí chênh lệch giá vé)</li>
          <li>Suất ăn nóng và nước ngọt có tính phí trên tàu bay</li>
        </ul>
        <div style="margin-top: var(--spacing-md); text-align: center;">
          <span class="badge badge-red" id="badge-selected-eco">Đang chọn hạng này</span>
        </div>
      </div>

      <!-- Business Fare Card -->
      <div class="fare-card" id="fare-card-business" data-fare="business">
        <div class="fare-card-header">
          <div>
            <div class="fare-title">Hạng Thương Gia (Business)</div>
            <div class="price-label">Trải nghiệm dịch vụ 5 sao đẳng cấp</div>
          </div>
          <div class="price">${formatVND(busPrice)}</div>
        </div>
        <ul class="fare-benefits">
          <li>02 kiện xách tay 12kg + 30kg hành lý ký gửi miễn cước</li>
          <li>Ưu tiên làm thủ tục tại quầy Check-in riêng & Lối đi an ninh riêng</li>
          <li>Sử dụng phòng chờ Thương gia (Business Lounge) sang trọng</li>
          <li>Suất ăn nóng ẩm thực cao cấp và đồ uống miễn phí</li>
          <li>Miễn phí đổi vé và hoàn vé linh hoạt</li>
        </ul>
        <div style="margin-top: var(--spacing-md); text-align: center;">
          <span class="badge badge-red" id="badge-selected-bus" style="display: none;">Đang chọn hạng này</span>
        </div>
      </div>
    </div>

    <!-- Action Section -->
    <div class="card" style="padding: var(--spacing-xl); display: flex; justify-content: space-between; align-items: center; background-color: var(--color-primary-soft); border-color: rgba(238, 29, 35, 0.2);">
      <div>
        <div style="font-size: 14px; color: var(--color-muted);">Tổng thanh toán tạm tính:</div>
        <div class="price price-large" id="selected-fare-display-price">${formatVND(ecoPrice)}</div>
        <div style="font-size: 13px; color: var(--color-text); margin-top: 4px;" id="selected-fare-label">
          Đang chọn: <strong>Hạng Phổ Thông (Eco)</strong> cho 01 hành khách
        </div>
      </div>

      <div style="display: flex; gap: 12px;">
        <button id="add-to-cart-btn" class="btn btn-primary btn-lg">
          🛒 Thêm vào giỏ hàng
        </button>
      </div>
    </div>
  `;
}

function attachEvents() {
  const ecoCard = document.querySelector('#fare-card-economy');
  const busCard = document.querySelector('#fare-card-business');
  const ecoBadge = document.querySelector('#badge-selected-eco');
  const busBadge = document.querySelector('#badge-selected-bus');
  const displayPrice = document.querySelector('#selected-fare-display-price');
  const displayLabel = document.querySelector('#selected-fare-label');
  const addCartBtn = document.querySelector('#add-to-cart-btn');

  if (ecoCard && busCard) {
    ecoCard.addEventListener('click', () => {
      selectedFareClass = 'economy';
      ecoCard.classList.add('selected');
      busCard.classList.remove('selected');
      ecoBadge.style.display = 'inline-block';
      busBadge.style.display = 'none';
      displayPrice.textContent = formatVND(currentFlight.economy_price);
      displayLabel.innerHTML = 'Đang chọn: <strong>Hạng Phổ Thông (Eco)</strong> cho 01 hành khách';
    });

    busCard.addEventListener('click', () => {
      selectedFareClass = 'business';
      busCard.classList.add('selected');
      ecoCard.classList.remove('selected');
      busBadge.style.display = 'inline-block';
      ecoBadge.style.display = 'none';
      const bPrice = currentFlight.business_price || (currentFlight.economy_price * 2);
      displayPrice.textContent = formatVND(bPrice);
      displayLabel.innerHTML = 'Đang chọn: <strong>Hạng Thương Gia (Business)</strong> cho 01 hành khách';
    });
  }

  if (addCartBtn) {
    addCartBtn.addEventListener('click', async () => {
      try {
        await addFlightToCart(currentFlight, selectedFareClass);
        showToast('Đã thêm vé máy bay vào giỏ hàng thành công!', 'success');

        // Update button text temporarily
        addCartBtn.textContent = '✓ Đã thêm vào giỏ';
        addCartBtn.disabled = true;
        setTimeout(() => {
          addCartBtn.textContent = '🛒 Thêm vào giỏ hàng';
          addCartBtn.disabled = false;
        }, 2000);
      } catch (err) {
        console.error('Failed to add flight to cart:', err);
        showToast('Không thể thêm vào giỏ hàng.', 'error');
      }
    });
  }
}
