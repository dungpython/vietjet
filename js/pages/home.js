/**
 * Homepage Controller for Vietjet Travel Prototype
 * Conforms to 01_PROJECT_REQUIREMENTS.md (Section 4) & 03_PAGES_AND_USER_FLOWS.md
 */

import { initDatabase, getAirlines, getFeaturedTours } from '../data-service.js';
import { renderHeader, renderFooter, showToast } from '../components.js';
import { formatVND, buildQueryString, escapeHTML } from '../router-utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  renderHeader('home');
  await initDatabase();
  renderFooter();

  initSearchForm();
  await loadFeaturedTours();
  await loadAirlineBrands();
});

function initSearchForm() {
  const form = document.querySelector('#flight-search-form');
  const tripTypeRadios = document.querySelectorAll('input[name="trip_type"]');
  const returnDateField = document.querySelector('#return-date-container');
  const depDateInput = document.querySelector('#departure-date');
  const retDateInput = document.querySelector('#return-date');
  const originSelect = document.querySelector('#origin-select');
  const destSelect = document.querySelector('#dest-select');

  // Set default dates
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  const returnDate = new Date();
  returnDate.setDate(today.getDate() + 10);

  if (depDateInput) {
    depDateInput.value = nextWeek.toISOString().split('T')[0];
    depDateInput.min = today.toISOString().split('T')[0];
  }
  if (retDateInput) {
    retDateInput.value = returnDate.toISOString().split('T')[0];
    retDateInput.min = today.toISOString().split('T')[0];
  }

  // Toggle Return Date based on trip type
  tripTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'roundtrip') {
        returnDateField.style.display = 'flex';
        retDateInput.setAttribute('required', 'true');
      } else {
        returnDateField.style.display = 'none';
        retDateInput.removeAttribute('required');
      }
    });
  });

  // Handle Form Submission
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const origin = originSelect.value;
      const destination = destSelect.value;
      const tripType = document.querySelector('input[name="trip_type"]:checked').value;
      const departureDate = depDateInput.value;
      const retDate = retDateInput.value;
      const passengers = document.querySelector('#passengers-input').value;
      const cabin = document.querySelector('#cabin-select').value;

      // Validation
      if (origin === destination) {
        showToast('Điểm đi và điểm đến không được trùng nhau!', 'error');
        destSelect.focus();
        return;
      }

      if (tripType === 'roundtrip' && retDate < departureDate) {
        showToast('Ngày về không thể sớm hơn ngày khởi hành!', 'error');
        retDateInput.focus();
        return;
      }

      const params = {
        origin,
        destination,
        trip_type: tripType,
        departure_date: departureDate,
        return_date: tripType === 'roundtrip' ? retDate : '',
        passengers,
        cabin
      };

      window.location.href = `flights.html${buildQueryString(params)}`;
    });
  }
}

async function loadFeaturedTours() {
  const container = document.querySelector('#featured-tours-list');
  if (!container) return;

  try {
    const tours = await getFeaturedTours();
    if (!tours || tours.length === 0) {
      container.innerHTML = '<div class="empty-desc">Đang tải danh sách tour du lịch...</div>';
      return;
    }

    container.innerHTML = tours.map(tour => `
      <div class="card tour-card">
        <div class="tour-card-thumb">
          <img src="${escapeHTML(tour.thumbnail_path)}" alt="${escapeHTML(tour.title)}" loading="lazy" onerror="this.src='assets/images/tours/tour-danang.jpg'">
          <span class="tour-card-badge">${tour.duration_days} ngày ${tour.duration_nights} đêm</span>
        </div>
        <div class="tour-card-body">
          <div class="tour-card-meta">
            <span>📍 ${escapeHTML(tour.destination)}</span>
            <span>🚩 ${escapeHTML(tour.departure_city || 'Toàn quốc')}</span>
          </div>
          <h3 class="tour-card-title">${escapeHTML(tour.title)}</h3>
          <p class="tour-card-operator">Đơn vị: ${escapeHTML(tour.operator_name)}</p>
          <p class="tour-card-summary">${escapeHTML(tour.service_summary || '')}</p>
          <div class="tour-card-footer">
            <div>
              <div class="price-label">Giá trọn gói từ</div>
              <div class="price">${formatVND(tour.price)}</div>
            </div>
            <a href="tour-detail.html?id=${encodeURIComponent(tour.id)}" class="btn btn-primary btn-sm">Xem chi tiết</a>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error loading featured tours:', err);
    container.innerHTML = '<div class="empty-desc">Không thể tải danh sách tour mẫu.</div>';
  }
}

async function loadAirlineBrands() {
  const container = document.querySelector('#airline-brands-list');
  if (!container) return;

  try {
    const airlines = await getAirlines();
    if (!airlines || airlines.length === 0) return;

    container.innerHTML = airlines.map(a => `
      <a href="flights.html?airline=${encodeURIComponent(a.id)}" class="card airline-card">
        <img src="${escapeHTML(a.logo_path)}" alt="${escapeHTML(a.name)}" class="airline-card-logo" onerror="this.style.display='none'">
        <span class="airline-card-title">${escapeHTML(a.name)}</span>
        <span class="btn btn-ghost btn-sm">Xem chuyến bay →</span>
      </a>
    `).join('');
  } catch (err) {
    console.error('Error loading airline brands:', err);
  }
}
