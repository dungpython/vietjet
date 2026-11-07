# 06 --- Implementation Plan and Acceptance Tests

## Build in controlled phases

Do not attempt to generate every page in one unreviewed step. Implement
a phase, run it, inspect it, then continue.

### Phase 1 --- Project foundation

-   Create the folder structure.
-   Create all HTML page shells.
-   Add CSS tokens, typography, container, header, footer, buttons,
    cards, and responsive navigation.
-   Confirm every page loads through Live Server.

**Acceptance:** All pages load, share consistent navigation and visual
styling, and have no console errors.

### Phase 2 --- Sample data and database

-   Implement SQL.js initialization.
-   Create schema and seed airlines, flights, 8 featured tours, and
    itineraries.
-   Persist database bytes through IndexedDB.
-   Implement the data-service API.

**Acceptance:** Database initializes on first load and records remain
after refresh. If SQLite is not operational, explicitly report the
blocker rather than claiming completion.

### Phase 3 --- Homepage

-   Build flight search panel.
-   Build exactly 8 featured tour cards.
-   Build airline brand section.
-   Add navigation and validation.

**Acceptance:** Flight search navigates with correct query parameters;
tour and airline cards navigate to correct result pages.

### Phase 4 --- Flights and flight detail

-   Build filters and sorting.
-   Render result cards.
-   Build flight detail page.
-   Implement Economy/Business fare selection.
-   Add selected fare to cart.

**Acceptance:** Filters and sorting change visible results correctly.
Detail page loads the selected flight by ID. Selected fare is retained
in cart.

### Phase 5 --- Tours and tour detail

-   Build tour filters and sorting.
-   Render tour cards.
-   Build itinerary detail page.
-   Add tour to cart.

**Acceptance:** Tour cards open the correct tour. Itinerary and price
match the selected sample record. Cart receives the correct tour.

### Phase 6 --- Cart, customer form, and confirmation

-   Render selected items.
-   Implement item removal and clear-cart confirmation.
-   Implement customer form validation.
-   Save a demo booking and generate reference.
-   Build confirmation page.
-   Add email adapter in safe unconfigured mode.

**Acceptance:** Cart actions work and persist. A valid form creates a
local demo booking and displays a confirmation. The UI never claims an
email was sent when no provider is configured.

### Phase 7 --- QA and polish

-   Responsive testing.
-   Keyboard navigation and focus states.
-   Empty/error states.
-   Broken image fallback.
-   Console and network checks.
-   Verify all links and buttons.

## Required test scenarios

1.  Search one-way flight with valid dates.
2.  Search round-trip flight and validate return date.
3.  Attempt same origin and destination.
4.  Filter by airline and cabin class.
5.  Sort flights low-to-high and high-to-low.
6.  Open a flight detail from a result.
7.  Add Economy fare to cart.
8.  Add Business fare to cart.
9.  Open a featured tour.
10. Add a tour to cart.
11. Refresh and verify cart persistence.
12. Remove one cart item.
13. Clear the cart.
14. Submit customer form with missing required fields.
15. Submit customer form with invalid email.
16. Submit valid demo booking.
17. Open confirmation page from generated booking reference.
18. Verify email status says not configured unless provider success is
    returned.
19. Test mobile navigation and listing layout.
20. Verify no control is visually interactive but functionally inert.

## Antigravity working rules

-   Read all project docs before coding.
-   Follow the requested stack exactly.
-   Do not introduce React, Vue, Angular, TypeScript, Node backend, PHP,
    or other frameworks unless the owner explicitly changes the
    requirements.
-   Do not replace SQLite with localStorage and claim the SQLite
    requirement is satisfied.
-   Do not invent live schedules, availability, prices, airline
    partnerships, or successful email delivery.
-   Before large refactors, explain the reason and list affected files.
-   After each phase, summarize files changed and tests performed.
