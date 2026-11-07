# 01 --- Project Requirements

## 1. Product overview

**Website name:** Vietjet\
**Domain:** Travel discovery and booking prototype\
**Primary language:** Vietnamese\
**Optional secondary language:** English-ready structure\
**Primary brand color:** `#EE1D23`\
**Background:** White / light neutral\
**Frontend:** HTML, CSS, vanilla JavaScript\
**Data:** SQLite in browser (SQLite WASM) with IndexedDB persistence\
**Backend:** None

## 2. Target experience

Visitors can: 1. Search for one-way or round-trip flights. 2. Browse
featured travel tours. 3. Browse airline brands and open flight results.
4. Filter and sort flight results. 5. Inspect flight details and select
a fare class. 6. Browse and filter tours. 7. Inspect tour details and
itinerary. 8. Add flights and tours to a cart. 9. Review and remove cart
items or clear the cart. 10. Enter customer details and complete a demo
booking. 11. See a clear booking-completed confirmation.

## 3. Global layout

-   Header: logo/wordmark, navigation links, cart icon with item count.
-   Main content: page-specific content.
-   Footer: contact placeholder, useful links, terms/privacy
    placeholders, demo disclaimer.
-   Responsive navigation on narrow screens.
-   Persistent cart state across page navigation and refresh.

## 4. Homepage

### Flight search panel

Fields: - Trip type: round trip / one way. - Origin. - Destination. -
Departure date. - Return date (visible and required only for round
trip). - Passenger count (sensible default: 1 adult). - Cabin preference
(economy/business, optional). - Search button.

Validation: - Origin and destination must differ. - Departure date is
required and cannot be in the past. - Return date is required for round
trip and cannot be earlier than departure. - Search navigates to
`flights.html` with search criteria encoded in URL query parameters.

### Featured tours

-   Display exactly 8 featured tour cards from sample data.
-   Each card includes a 600×400 thumbnail, tour name, tour operator,
    duration in days/nights, starting price, and a detail link.
-   Use local placeholder assets or properly licensed images. Do not
    hotlink random images.
-   Clicking a card opens `tour-detail.html?id=...`.

### Airline brands

-   Display airline logo cards for VietJet Air, Vietnam Airlines,
    Singapore Airlines, and other sample airlines.
-   Use official logos only when permitted; otherwise use text-based
    logo placeholders.
-   Clicking a logo opens `flights.html?airline=...`.

## 5. Flights listing

Desktop layout: - Left sidebar: filters. - Right content area: flight
result cards.

Filters: - Sort by price: ascending / descending. - Trip type: round
trip / one way. - Route type: direct / multi-city. - Airlines:
multi-select. - Departure time range. - Cabin class: economy / business.

Result card: - Airline name/logo placeholder. - Origin and destination
airports/cities. - Departure and arrival times. - Departure date. -
Flight duration. - Stop count / direct label. - Cabin/service summary. -
Price and currency. - Select/view details action.

Filtering and sorting must operate on the local sample dataset. If no
results match, show an empty state with a reset-filters action.

## 6. Flight detail

Display: - Route, airports, date, departure and arrival times. - Airline
and flight number. - Flight duration and stop information. - Aircraft
type (sample values such as Airbus A320, Airbus A321, Boeing 787). -
Fare choices: Economy and Business. - Fare benefits and restrictions,
clearly marked as sample information. - Price for each fare class. - Add
to cart action.

Selecting a fare and adding it to cart must store the chosen flight and
fare class. Do not imply a real reservation or ticket issuance.

## 7. Tour listing

Desktop layout: - Left filter sidebar. - Right tour cards.

Filters: - Sort by price ascending / descending. - Tour operator /
airline (only if the sample record actually has this field). - Departure
date or time window, where supported by sample data. - Duration,
optional.

Tour result card: - Thumbnail. - Tour name and destination. -
Operator. - Associated airline, if applicable. - Departure date. -
Duration. - Price. - Included services summary. - Detail action.

Do not label a tour as an airline-operated product unless the sample
data supports that claim.

## 8. Tour detail

Display: - Tour title, images, destination, departure location. -
Departure date and duration. - Associated airline and flight information
only when available. - Aircraft type only when flight data exists. -
Tour operator. - Price and included services. - Day-by-day itinerary. -
Exclusions, notes, and cancellation-policy placeholder. - Add to cart
action.

## 9. Cart

-   Show selected flights and tours.
-   Show selected fare class for flights.
-   Show item details, quantity where applicable, and line price.
-   Remove individual items.
-   Clear cart after confirmation.
-   Calculate subtotal and total from local sample prices.
-   Persist cart across refresh using local storage or IndexedDB.
-   Do not collect payment details or claim payment has been processed.

## 10. Customer details and completion

Collect only necessary demo information: - Full name. - Email. - Phone
number. - Optional notes. - Required consent checkbox for demo
terms/privacy notice.

Validate required fields and email format. On submit: - Generate a
unique demo booking reference. - Save the booking record locally. - Show
booking-completed confirmation with booking reference and order
summary. - Clearly state that this is a demo and no ticket or tour
reservation has been issued.

## 11. Email behavior

Requested sender address: `nvhai061993@gmail.com`.

A browser-only website cannot safely authenticate as this Gmail account
or send email directly. Implement an email adapter with: - A default
safe demo mode that displays confirmation and optionally creates a
`mailto:` link. - An optional EmailJS integration placeholder, activated
only after the owner provides the required public configuration and
verifies the sender/domain setup. - No Gmail password, app password,
OAuth client secret, or private API key in source code. - Do not claim
that an email was sent unless the email provider returns success.

## 12. Quality requirements

-   Responsive design.
-   Accessible labels, keyboard focus, and semantic HTML.
-   Vietnamese text and correct currency formatting (VND).
-   Consistent spacing, typography, buttons, cards, and form validation.
-   No dead buttons or fake live-data claims.
-   Use realistic but explicitly fictional/sample inventory.
