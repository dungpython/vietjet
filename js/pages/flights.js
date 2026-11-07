/**
 * Flights Listing Controller for Vietjet Travel Prototype
 * Conforms to 01_PROJECT_REQUIREMENTS.md (Section 5) & 03_PAGES_AND_USER_FLOWS.md
 */

import { initDatabase, getAirlines, searchFlights } from '../data-service.js';
import { renderHeader, renderFooter } from '../components.js';
import { getQueryParams, formatVND, formatDateVN, formatTime, formatDuration, escapeHTML } from '../router-utils.js';

let currentCriteria = {};
let allAirlines = [];

document.addEventListener('DOMContentLoaded', async () => {
  renderHeader('flights');
  await initDatabase();
  renderFooter();

  currentCriteria = getQueryParams();
  allAirlines = await getAirlines();

  populateFilterControls();
  await executeSearch();
  attachFilterEvents();
});

function populateFilterControls() {
  // Populate airlines in filter
  const airlineFilterContainer = document.querySelector('#filter-airlines-list');
  if (airlineFilterContainer && allAirlines.length > 0) {
    airlineFilterContainer.innerHTML = allAirlines.map(a => `
      <div class="filter-option">
        <label>
          <input type="checkbox" name="airline_filter" value="${escapeHTML(a.id)}" ${currentCriteria.airline === a.id ? 'checked' : ''}>
          <span>${escapeHTML(a.name)}</span>
        </label>
      </div>
    `).join('');
  }

  // Pre-fill route badges or title
  const searchSummaryEl = document.querySelector('#search-summary-title');
  if (searchSummaryEl) {
    if (currentCriteria.origin && currentCriteria.destination) {
      searchSummaryEl.textContent = `Chuyến bay từ ${currentCriteria.origin} đi ${currentCriteria.destination}`;
    } else if (currentCriteria.airline) {
      const matched = allAirlines.find(a => a.id === currentCriteria.airline);
      searchSummaryEl.textContent = matched ? `Chuyến bay hãng ${matched.name}` : 'Tất cả chuyến bay có sẵn';
    } else {
      searchSummaryEl.textContent = 'Tất cả chuyến bay đang mở bán';
    }
  }

  // Pre-fill sort select
  const sortSelect = document.querySelector('#sort-select');
  if (sortSelect && currentCriteria.sort) {
    sortSelect.value = currentCriteria.sort;
  }
}

async function executeSearch() {
  const container = document.querySelector('#flight-results-container');
  const countBadge = document.querySelector('#results-count-badge');
  if (!container) return;

  container.innerHTML = '<div class="empty-state"><div class="empty-desc">Đang tìm kiếm chuyến bay phù hợp từ cơ sở dữ liệu...</div></div>';

  try {
    const flights = await searchFlights(currentCriteria);

    if (countBadge) {
      countBadge.textContent = `${flights.length} chuyến bay`;
    }

    if (!flights || flights.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">✈️</div>
          <h3 class="empty-title">Không tìm thấy chuyến bay phù hợp</h3>
          <p class="empty-desc">Rất tiếc, không có chuyến bay nào khớp với tiêu chí tìm kiếm hoặc bộ lọc hiện tại của bạn.</p>
          <button id="reset-filters-btn" class="btn btn-primary">Xóa bộ lọc & Xem tất cả</button>
        </div>
      `;
      const resetBtn = document.querySelector('#reset-filters-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          window.location.href = 'flights.html';
        });
      }
      return;
    }

    container.innerHTML = flights.map(f => {
      const isBusiness = currentCriteria.cabin === 'business';
      const displayPrice = isBusiness && f.business_price ? f.business_price : f.economy_price;
      const cabinLabel = isBusiness ? 'Thương gia' : 'Phổ thông';

      return `
        <div class="card flight-card">
          <div class="flight-card-main">
            <!-- Airline Info -->
            <div class="flight-airline-info">
              <img src="${escapeHTML(f.logo_path)}" alt="${escapeHTML(f.airline_name)}" class="airline-logo-sm" onerror="this.style.display='none'">
              <div>
                <div class="flight-airline-name">${escapeHTML(f.airline_name)}</div>
                <div class="flight-code">${escapeHTML(f.flight_number)} • ${escapeHTML(f.aircraft_type || 'Airbus A320')}</div>
              </div>
            </div>

            <!-- Route Info -->
            <div class="flight-route-info">
              <div class="flight-point">
                <div class="flight-time">${formatTime(f.departure_datetime)}</div>
                <div class="flight-airport">${escapeHTML(f.origin_code)}</div>
                <div class="flight-city">${escapeHTML(f.origin_city)}</div>
              </div>

              <div class="flight-duration-center">
                <div class="duration-label">${formatDuration(f.duration_minutes)}</div>
                <div class="flight-path-line"></div>
                <div class="flight-stops-tag">${f.stops === 0 ? 'Bay thẳng' : `${f.stops} điểm dừng`}</div>
              </div>

              <div class="flight-point">
                <div class="flight-time">${formatTime(f.arrival_datetime)}</div>
                <div class="flight-airport">${escapeHTML(f.destination_code)}</div>
                <div class="flight-city">${escapeHTML(f.destination_city)}</div>
              </div>
            </div>

            <!-- Price & Action -->
            <div class="flight-price-col">
              <div class="price-label">Giá từ (${cabinLabel})</div>
              <div class="price">${formatVND(displayPrice)}</div>
              <a href="flight-detail.html?id=${encodeURIComponent(f.id)}" class="btn btn-primary btn-sm" style="margin-top: 8px;">
                Chọn vé
              </a>
            </div>
          </div>

          <div style="font-size: 13px; color: var(--color-muted); border-top: 1px dashed var(--color-border); padding-top: 8px; display: flex; justify-content: space-between; align-items: center;">
            <span>📅 Ngày bay: ${formatDateVN(f.departure_datetime)}</span>
            <span>${escapeHTML(f.service_summary || 'Hành lý xách tay tiêu chuẩn')}</span>
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('Search flights failed:', err);
    container.innerHTML = '<div class="empty-state"><p class="empty-desc">Đã xảy ra lỗi khi truy vấn chuyến bay.</p></div>';
  }
}

function attachFilterEvents() {
  // Sort select change
  const sortSelect = document.querySelector('#sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentCriteria.sort = e.target.value;
      executeSearch();
    });
  }

  // Airline checkboxes
  const airlineCheckboxes = document.querySelectorAll('input[name="airline_filter"]');
  airlineCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      const selected = Array.from(document.querySelectorAll('input[name="airline_filter"]:checked')).map(el => el.value);
      currentCriteria.airline = selected.length === 1 ? selected[0] : '';
      executeSearch();
    });
  });

  // Direct flights filter
  const directCheckbox = document.querySelector('#filter-direct-only');
  if (directCheckbox) {
    directCheckbox.addEventListener('change', (e) => {
      currentCriteria.stops = e.target.checked ? '0' : '';
      executeSearch();
    });
  }

  // Clear filters link
  const clearBtn = document.querySelector('#clear-all-filters');
  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      currentCriteria = {};
      document.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
      if (sortSelect) sortSelect.value = '';
      executeSearch();
    });
  }
}
