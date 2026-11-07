/**
 * Tours Listing Controller for Vietjet Travel Prototype
 * Conforms to 01_PROJECT_REQUIREMENTS.md (Section 7) & 03_PAGES_AND_USER_FLOWS.md
 */

import { initDatabase, searchTours } from '../data-service.js';
import { renderHeader, renderFooter } from '../components.js';
import { getQueryParams, formatVND, escapeHTML } from '../router-utils.js';

let currentFilters = {};

document.addEventListener('DOMContentLoaded', async () => {
  renderHeader('tours');
  await initDatabase();
  renderFooter();

  currentFilters = getQueryParams();
  await executeTourSearch();
  attachTourFilterEvents();
});

async function executeTourSearch() {
  const container = document.querySelector('#tours-results-container');
  const countBadge = document.querySelector('#tours-count-badge');
  if (!container) return;

  container.innerHTML = '<div class="empty-state"><div class="empty-desc">Đang tìm các tour du lịch phù hợp...</div></div>';

  try {
    const tours = await searchTours(currentFilters);

    if (countBadge) {
      countBadge.textContent = `${tours.length} tour du lịch`;
    }

    if (!tours || tours.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🏖️</div>
          <h3 class="empty-title">Không tìm thấy tour phù hợp</h3>
          <p class="empty-desc">Hãy thử thay đổi điểm đến hoặc điều chỉnh khoảng thời gian mong muốn của bạn.</p>
          <button id="reset-tour-filters-btn" class="btn btn-primary">Xóa bộ lọc & Xem tất cả</button>
        </div>
      `;
      const resetBtn = document.querySelector('#reset-tour-filters-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          window.location.href = 'tours.html';
        });
      }
      return;
    }

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: var(--spacing-lg);">
        ${tours.map(t => `
          <div class="card tour-card">
            <div class="tour-card-thumb">
              <img src="${escapeHTML(t.thumbnail_path)}" alt="${escapeHTML(t.title)}" loading="lazy" onerror="this.src='assets/images/tours/tour-danang.jpg'">
              <span class="tour-card-badge">${t.duration_days} ngày ${t.duration_nights} đêm</span>
            </div>
            <div class="tour-card-body">
              <div class="tour-card-meta">
                <span>📍 ${escapeHTML(t.destination)}</span>
                <span>🚩 ${escapeHTML(t.departure_city || 'Toàn quốc')}</span>
              </div>
              <h3 class="tour-card-title">${escapeHTML(t.title)}</h3>
              <p class="tour-card-operator">Nhà tổ chức: ${escapeHTML(t.operator_name)}</p>
              ${t.airline_name ? `<p style="font-size: 12px; color: var(--color-primary); font-weight: 600; margin-bottom: 6px;">✈ Bay cùng: ${escapeHTML(t.airline_name)}</p>` : ''}
              <p class="tour-card-summary">${escapeHTML(t.service_summary || '')}</p>
              <div class="tour-card-footer">
                <div>
                  <div class="price-label">Giá trọn gói từ</div>
                  <div class="price">${formatVND(t.price)}</div>
                </div>
                <a href="tour-detail.html?id=${encodeURIComponent(t.id)}" class="btn btn-primary btn-sm">Xem chi tiết</a>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

  } catch (err) {
    console.error('Failed to search tours:', err);
    container.innerHTML = '<div class="empty-state"><p class="empty-desc">Không thể tải danh sách tour du lịch.</p></div>';
  }
}

function attachTourFilterEvents() {
  const sortSelect = document.querySelector('#tour-sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentFilters.sort = e.target.value;
      executeTourSearch();
    });
  }

  const durationCheckboxes = document.querySelectorAll('input[name="duration_filter"]');
  durationCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      const checked = Array.from(document.querySelectorAll('input[name="duration_filter"]:checked')).map(el => el.value);
      currentFilters.durationDays = checked.length === 1 ? checked[0] : '';
      executeTourSearch();
    });
  });

  const destFilter = document.querySelector('#tour-dest-filter');
  if (destFilter) {
    destFilter.addEventListener('change', (e) => {
      currentFilters.destination = e.target.value;
      executeTourSearch();
    });
  }

  const clearBtn = document.querySelector('#clear-tour-filters');
  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      currentFilters = {};
      document.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
      if (destFilter) destFilter.value = '';
      if (sortSelect) sortSelect.value = '';
      executeTourSearch();
    });
  }
}
