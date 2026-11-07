# 02 --- UI/UX and Design System

## Visual direction

Create a clean, modern travel-booking interface with a bright
background, generous whitespace, clear hierarchy, and a confident red
accent.

## Color tokens

``` css
:root {
  --color-primary: #EE1D23;
  --color-primary-hover: #D71920;
  --color-primary-soft: #FFF0F0;
  --color-text: #252525;
  --color-muted: #6B7280;
  --color-border: #E5E7EB;
  --color-background: #FFFFFF;
  --color-surface: #F8F9FB;
  --color-success: #16834A;
  --color-warning: #B7791F;
  --color-danger: #C62828;
}
```

Use red for primary actions, active states, important highlights, and
selected controls. Do not use red for every element.

## Typography

-   Use a clean sans-serif stack such as `Inter, Arial, sans-serif`.
-   Headings: bold, compact, readable.
-   Body: 14--16px baseline.
-   Prices: visually prominent, with VND formatting.
-   Avoid very small text; secondary labels should remain legible.

## Layout

-   Content max width: approximately 1200--1280px.
-   Desktop page gutters: 24--32px.
-   Mobile gutters: 16px.
-   Header height: approximately 72px desktop.
-   Cards: white surface, subtle border, 12--16px radius, restrained
    shadow.
-   Flight and tour listing: 280px filter column plus flexible results
    column on wide screens; stack filters above results on mobile.

## Components

Create reusable CSS classes for: - `.site-header`, `.site-nav`,
`.brand` - `.container`, `.page-section` - `.btn`, `.btn-primary`,
`.btn-secondary`, `.btn-ghost` - `.card`, `.tour-card`, `.flight-card`,
`.airline-card` - `.search-panel`, `.form-field`, `.form-control` -
`.filter-sidebar`, `.filter-group` - `.price`, `.badge`,
`.empty-state` - `.cart-item`, `.booking-summary` - `.toast`, `.modal`,
`.site-footer`

## Interaction states

Every interactive element needs: - Default state. - Hover state. -
Keyboard focus state. - Disabled state when relevant. - Selected/active
state for filters and fare cards.

Use visible focus outlines. Do not rely on color alone to communicate
selected states.

## Images

-   Tour thumbnails: 600×400 (3:2 aspect ratio).
-   Use consistent image cropping with `object-fit: cover`.
-   Add meaningful `alt` text.
-   Provide local fallback images when an image is unavailable.
-   Do not use copyrighted airline logos or travel images without
    permission. Text-based logo placeholders are acceptable for the
    prototype.

## Responsive behavior

-   Desktop: horizontal header, two-column listings.
-   Tablet: compact navigation and narrower filters.
-   Mobile: menu toggle, stacked search form, single-column cards,
    filter drawer or collapsible filter section.
-   Buttons and form controls should be comfortable to tap.

## Tone and content

Use concise, helpful Vietnamese labels. Examples: - "Tìm chuyến bay" -
"Điểm đi" - "Điểm đến" - "Ngày khởi hành" - "Ngày về" - "Chọn hạng vé" -
"Thêm vào giỏ hàng" - "Tiếp tục" - "Hoàn tất đặt dịch vụ"

Avoid unsupported urgency claims such as "chỉ còn 1 vé" unless real
inventory data is connected.
