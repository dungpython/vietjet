# 03 --- Pages, Navigation, and User Flows

## Required pages

Use separate HTML pages for a simple static multi-page structure:

  -----------------------------------------------------------------------
  Page                    File                    Purpose
  ----------------------- ----------------------- -----------------------
  Home                    `index.html`            Flight search, 8
                                                  featured tours, airline
                                                  brands

  Flights                 `flights.html`          Flight results and
                                                  filters

  Flight detail           `flight-detail.html`    Flight information and
                                                  fare selection

  Tours                   `tours.html`            Tour results and
                                                  filters

  Tour detail             `tour-detail.html`      Tour information and
                                                  itinerary

  Cart                    `cart.html`             Selected flights/tours
                                                  and customer form

  Confirmation            `confirmation.html`     Demo booking completion
  -----------------------------------------------------------------------

## Navigation

-   Logo/brand → `index.html`.
-   "Chuyến bay" → `flights.html`.
-   "Tour du lịch" → `tours.html`.
-   Cart icon → `cart.html`.
-   Airline logo → `flights.html?airline=airline-slug`.
-   Flight search → `flights.html` with URL query parameters.
-   Featured tour → `tour-detail.html?id=tour-id`.

## Flight search URL

Example:

``` text
flights.html?tripType=roundtrip&from=SGN&to=HAN&depart=2026-12-10&return=2026-12-15&passengers=1
```

Use URLSearchParams to read and validate query values. Never trust query
parameters as authoritative inventory.

## Flight selection flow

1.  Visitor searches from homepage or opens Flights.
2.  Flights page reads search criteria.
3.  Visitor sorts and filters sample results.
4.  Visitor opens a flight detail page.
5.  Visitor selects Economy or Business fare.
6.  Visitor clicks "Thêm vào giỏ hàng".
7.  Save selected flight and fare to persistent cart state.
8.  Show a success toast and a link to the cart.

## Tour selection flow

1.  Visitor opens Tours or clicks a featured tour.
2.  Visitor filters/sorts tour results.
3.  Visitor opens tour detail.
4.  Visitor reviews itinerary and included services.
5.  Visitor clicks "Thêm vào giỏ hàng".
6.  Save tour to persistent cart state.
7.  Show a success toast and a link to the cart.

## Cart and checkout flow

1.  Cart page renders all stored cart items.
2.  Visitor may remove an item or clear the cart.
3.  Visitor reviews subtotal and total.
4.  Visitor enters full name, email, phone, and optional note.
5.  Visitor accepts the demo terms/privacy checkbox.
6.  Validate all required fields.
7.  Save a demo booking locally and generate a booking reference.
8.  Navigate to `confirmation.html?booking=...`.
9.  Confirmation page shows reference, customer details, and selected
    items.
10. Show email status accurately: "Chưa gửi email --- bản demo" unless a
    configured provider confirms delivery.

## Empty and error states

-   No flight results: explain that no sample flights match and offer
    reset filters.
-   No tours: explain and offer reset filters.
-   Empty cart: show a link back to flights and tours.
-   Invalid detail ID: show a not-found message and navigation back.
-   Invalid form: show field-level errors.
-   Storage/database failure: show a clear error and safe fallback
    behavior.

## Browser refresh and navigation

-   Cart must survive refresh.
-   Search criteria should survive navigation through URL parameters.
-   Selected detail ID should be in the URL.
-   Avoid storing unnecessary personal information beyond the local demo
    booking record.
