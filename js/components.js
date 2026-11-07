/**
 * Reusable Components and Layout Shell for Vietjet Travel Prototype
 * Shared Header, Footer, Toast notifications, and Navigation State
 */

import { updateCartBadge } from './cart-service.js';
import { getEngineStatus } from './data-service.js';

export function renderHeader(activePage = '') {
  const headerContainer = document.querySelector('#site-header-container');
  if (!headerContainer) return;

  headerContainer.innerHTML = `
    <div class="demo-banner">
      <span class="badge-demo">Bản thử nghiệm</span>
      Website độc lập phục vụ trình diễn prototype - Không đại diện cho website chính thức của Vietjet Air. Dữ liệu là demo giả định.
    </div>
    <header class="site-header">
      <div class="container header-inner">
        <a href="index.html" class="brand">
          vietjet<span class="accent">Travel</span>
          <span class="brand-tag">Prototype</span>
        </a>

        <nav class="site-nav" id="main-nav">
          <a href="index.html" class="nav-link ${activePage === 'home' ? 'active' : ''}">Trang chủ</a>
          <a href="flights.html" class="nav-link ${activePage === 'flights' ? 'active' : ''}">Chuyến bay</a>
          <a href="tours.html" class="nav-link ${activePage === 'tours' ? 'active' : ''}">Tour du lịch</a>
        </nav>

        <div class="header-actions">
          <a href="cart.html" class="cart-button" title="Xem giỏ hàng">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span>Giỏ hàng</span>
            <span class="cart-badge" id="cart-count-badge" style="display: none;">0</span>
          </a>

          <button class="mobile-nav-toggle" id="mobile-nav-btn" aria-label="Menu điều hướng">
            ☰
          </button>
        </div>
      </div>
    </header>
  `;

  // Attach mobile toggle event
  const toggleBtn = document.querySelector('#mobile-nav-btn');
  const nav = document.querySelector('#main-nav');
  if (toggleBtn && nav) {
    toggleBtn.addEventListener('click', () => {
      nav.classList.toggle('is-open');
    });
  }

  // Initial cart badge update
  updateCartBadge();
}

export function renderFooter() {
  const footerContainer = document.querySelector('#site-footer-container');
  if (!footerContainer) return;

  const engine = getEngineStatus();
  const engineLabel = engine === 'sqlite-wasm' ? 'SQLite WASM (IndexedDB)' : 'SQLite Adapter (IndexedDB)';

  footerContainer.innerHTML = `
    <footer class="site-footer">
      <div class="container footer-top">
        <div>
          <div class="footer-brand">vietjet<span>Travel</span></div>
          <p class="footer-desc">
            Nền tảng tìm kiếm chuyến bay và tour du lịch hàng đầu Việt Nam. Khám phá các điểm đến hấp dẫn với mức giá ưu đãi nhất.
          </p>
          <div class="db-status-pill">
            <span class="db-indicator"></span>
            <span>Cơ sở dữ liệu: ${engineLabel}</span>
          </div>
        </div>

        <div>
          <h4 class="footer-title">Khám phá</h4>
          <div class="footer-links">
            <a href="flights.html" class="footer-link">Tìm chuyến bay</a>
            <a href="tours.html" class="footer-link">Tour trọn gói</a>
            <a href="flights.html?airline=airline-vj" class="footer-link">Vé bay Vietjet Air</a>
            <a href="flights.html?airline=airline-vn" class="footer-link">Vé bay Vietnam Airlines</a>
          </div>
        </div>

        <div>
          <h4 class="footer-title">Hỗ trợ khách hàng</h4>
          <div class="footer-links">
            <a href="javascript:void(0)" class="footer-link">Hướng dẫn đặt vé</a>
            <a href="javascript:void(0)" class="footer-link">Chính sách hành lý</a>
            <a href="javascript:void(0)" class="footer-link">Điều khoản dịch vụ</a>
            <a href="javascript:void(0)" class="footer-link">Chính sách bảo mật</a>
          </div>
        </div>

        <div>
          <h4 class="footer-title">Thông tin liên hệ mẫu</h4>
          <div class="footer-links">
            <span class="footer-link">Email demo: nvhai061993@gmail.com</span>
            <span class="footer-link">Hotline demo: 1900 1886 (Fictional)</span>
            <span class="footer-link">Địa chỉ: TP. Hồ Chí Minh & Hà Nội</span>
          </div>
        </div>
      </div>

      <div class="container footer-bottom">
        <div>© 2026 Vietjet Travel Prototype. Dự án mô phỏng độc lập theo tài liệu kỹ thuật.</div>
        <div>Lưu ý: Không thu thập thẻ ngân hàng hay mật khẩu người dùng.</div>
      </div>
    </footer>
  `;
}

export function showToast(message, type = 'success') {
  let container = document.querySelector('#toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
