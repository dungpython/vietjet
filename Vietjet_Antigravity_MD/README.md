# Vietjet Travel Website --- Antigravity Project Pack

## Project purpose

Build a responsive travel-booking website prototype named **Vietjet**.
The interface supports flight discovery, tour discovery, detail pages, a
shopping cart, customer information, and a booking-completion state.

> **Prototype notice:** This is an independent demo specification. Do
> not represent the result as Vietjet Air's official website or imply an
> official partnership. Use placeholder/sample data unless licensed
> brand assets and live inventory are supplied.

## Technology constraints

-   HTML5, CSS3, and vanilla JavaScript only.
-   No frontend framework and no application backend.
-   SQLite-compatible local data using SQLite WASM (for example SQL.js)
    in the browser.
-   Persist the local database through IndexedDB; do not assume a
    browser can write a normal `.sqlite` file directly.
-   Use local sample data. Do not claim flight prices, schedules,
    availability, or tour inventory are live.
-   Make the UI responsive for desktop, tablet, and mobile.

## Read these files in order

1.  `01_PROJECT_REQUIREMENTS.md`
2.  `02_UI_UX_AND_DESIGN_SYSTEM.md`
3.  `03_PAGES_AND_USER_FLOWS.md`
4.  `04_DATA_MODEL_AND_SQLITE.md`
5.  `05_TECHNICAL_ARCHITECTURE.md`
6.  `06_IMPLEMENTATION_PLAN.md`
7.  `07_ANTIGRAVITY_MASTER_PROMPT.md`

## Important implementation constraints

A static frontend cannot securely send email from a Gmail account. For
the prototype, implement a clearly labelled email integration adapter: -
Default: show booking confirmation in the UI and create a `mailto:` link
for the customer-support/booking message, or - Optional: integrate
EmailJS only after the owner supplies the service ID, template ID, and
public key. Never put a Gmail password, app password, or private API key
in frontend code.

Do not invent a backend. If the owner later requires secure email
delivery, payment processing, authentication, or live airline inventory,
explain that a backend or trusted third-party API is required.

## Completion criteria

The site must have working navigation, search and filters over sample
data, flight and tour detail views, add/remove cart actions, customer
information validation, and a final confirmation screen. Every visible
control must have a meaningful action or be visibly disabled with an
explanation.
