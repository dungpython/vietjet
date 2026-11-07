/**
 * Confirmation Page Controller for Vietjet Travel Prototype
 * Conforms to 01_PROJECT_REQUIREMENTS.md (Sections 10 & 11) & 03_PAGES_AND_USER_FLOWS.md
 */

import { initDatabase, getBookingByReference } from '../data-service.js';
import { sendBookingConfirmation, generateMailtoLink } from '../email-service.js';
import { renderHeader, renderFooter } from '../components.js';
import { getQueryParams, formatVND, formatDateVN, escapeHTML } from '../router-utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  renderHeader('');
  await initDatabase();
  renderFooter();

  const params = getQueryParams();
  if (!params.ref) {
    renderRefNotFound();
    return;
  }

  const booking = await getBookingByReference(params.ref);
  if (!booking) {
    renderRefNotFound();
    return;
  }

  await renderConfirmation(booking);
});

function renderRefNotFound() {
  const container = document.querySelector('#confirmation-container');
  if (!container) return;
  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">⚠️</div>
      <h2 class="empty-title">Không tìm thấy mã đơn đặt chỗ</h2>
      <p class="empty-desc">Không tìm thấy thông tin đơn hàng tương ứng với mã yêu cầu trong cơ sở dữ liệu SQLite.</p>
      <a href="index.html" class="btn btn-primary">Quay về trang chủ</a>
    </div>
  `;
}

async function renderConfirmation(booking) {
  const container = document.querySelector('#confirmation-container');
  if (!container) return;

  const emailResult = await sendBookingConfirmation(booking);
  const mailtoUrl = generateMailtoLink(booking);

  container.innerHTML = `
    <div style="max-width: 760px; margin: 0 auto;">
      <!-- Success Icon & Header -->
      <div class="card" style="padding: var(--spacing-2xl); text-align: center; margin-bottom: var(--spacing-xl); border-top: 6px solid var(--color-success);">
        <div style="width: 72px; height: 72px; background: #ECFDF5; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto var(--spacing-lg) auto; color: var(--color-success); font-size: 36px; border: 2px solid #A7F3D0;">
          ✓
        </div>
        <h1 style="font-size: 28px; font-weight: 900; color: var(--color-text); margin-bottom: 8px;">
          Đặt dịch vụ thành công!
        </h1>
        <p style="color: var(--color-muted); font-size: 15px; margin-bottom: var(--spacing-lg);">
          Cảm ơn bạn đã trải nghiệm hệ thống đặt vé và tour du lịch demo của chúng tôi.
        </p>

        <!-- Booking Reference Box -->
        <div style="background-color: var(--color-surface); border: 2px dashed var(--color-primary); border-radius: var(--radius-md); padding: var(--spacing-md) var(--spacing-xl); display: inline-block; margin-bottom: var(--spacing-lg);">
          <div style="font-size: 12px; font-weight: 700; color: var(--color-muted); text-transform: uppercase; letter-spacing: 1px;">Mã đặt chỗ (Booking Reference)</div>
          <div style="font-size: 32px; font-weight: 900; color: var(--color-primary); letter-spacing: 2px; margin-top: 4px;">
            ${escapeHTML(booking.booking_reference)}
          </div>
        </div>

        <div style="font-size: 13px; color: var(--color-muted);">
          Thời gian khởi tạo: ${formatDateVN(booking.created_at)}
        </div>
      </div>

      <!-- Booking Details & Items -->
      <div class="card" style="padding: var(--spacing-xl); margin-bottom: var(--spacing-xl);">
        <h2 style="font-size: 18px; font-weight: 800; border-bottom: 1px solid var(--color-border); padding-bottom: 10px; margin-bottom: var(--spacing-md);">
          Chi tiết dịch vụ đã đặt
        </h2>

        <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: var(--spacing-lg);">
          ${booking.items && booking.items.length > 0 ? booking.items.map(item => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px dashed var(--color-border);">
              <div>
                <div style="font-weight: 700; font-size: 15px; color: var(--color-text);">${escapeHTML(item.item_name)}</div>
                <div style="font-size: 13px; color: var(--color-muted);">${escapeHTML(item.selected_fare || '')} • Số lượng: ${item.quantity}</div>
              </div>
              <div style="font-weight: 800; color: var(--color-primary); font-size: 16px;">
                ${formatVND(item.unit_price * item.quantity)}
              </div>
            </div>
          `).join('') : '<p class="empty-desc">Không có dữ liệu chi tiết các mục.</p>'}
        </div>

        <!-- Total -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: var(--spacing-md); font-size: 18px; font-weight: 900;">
          <span>Tổng tiền thanh toán (Mô phỏng):</span>
          <span class="price price-large">${formatVND(booking.total_amount)}</span>
        </div>

        <!-- Customer Summary -->
        <div style="margin-top: var(--spacing-xl); background: var(--color-surface); padding: var(--spacing-md); border-radius: var(--radius-md); font-size: 14px;">
          <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 8px;">Thông tin khách hàng:</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div>👤 <strong>Họ tên:</strong> ${escapeHTML(booking.customer_name)}</div>
            <div>📞 <strong>SĐT:</strong> ${escapeHTML(booking.customer_phone)}</div>
            <div style="grid-column: span 2;">✉ <strong>Email:</strong> ${escapeHTML(booking.customer_email)}</div>
            ${booking.customer_note ? `<div style="grid-column: span 2;">📝 <strong>Ghi chú:</strong> ${escapeHTML(booking.customer_note)}</div>` : ''}
          </div>
        </div>
      </div>

      <!-- Safe Email Adapter Status Box (Conforms to technical constraints) -->
      <div class="card" style="padding: var(--spacing-xl); margin-bottom: var(--spacing-xl); background-color: #F8FAFC; border-left: 4px solid #3B82F6;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="font-size: 18px;">📧</span>
          <h3 style="font-size: 16px; font-weight: 800; color: #1E293B;">Trạng thái Email thông báo (Safe Adapter)</h3>
          <span class="badge badge-blue">Chế độ Demo</span>
        </div>
        <p style="font-size: 13px; color: #475569; line-height: 1.6; margin-bottom: 12px;">
          Để bảo vệ tuyệt đối thông tin bảo mật, website frontend tĩnh <strong>không nhúng mật khẩu Gmail</strong> <code>nvhai061993@gmail.com</code> vào mã nguồn. Trạng thái hiện tại: <strong>Chưa cấu hình gửi tự động</strong>.
        </p>
        <p style="font-size: 13px; color: #475569; margin-bottom: 16px;">
          Bạn có thể mở ứng dụng gửi thư của máy tính để gửi thông tin xác nhận này:
        </p>
        <a href="${mailtoUrl}" class="btn btn-secondary btn-sm" style="background: #FFFFFF;">
          ✉ Mở ứng dụng Mail gửi xác nhận đến nvhai061993@gmail.com
        </a>
      </div>

      <!-- Actions -->
      <div style="display: flex; gap: 16px; justify-content: center; margin-bottom: var(--spacing-3xl);">
        <a href="index.html" class="btn btn-primary">Trang chủ</a>
        <button onclick="window.print()" class="btn btn-secondary">🖨 In xác nhận</button>
      </div>
    </div>
  `;
}
