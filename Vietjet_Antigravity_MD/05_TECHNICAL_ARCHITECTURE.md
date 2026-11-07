# 05 --- Technical Architecture

## Suggested folder structure

``` text
vietjet-travel/
├── index.html
├── flights.html
├── flight-detail.html
├── tours.html
├── tour-detail.html
├── cart.html
├── confirmation.html
├── assets/
│   ├── images/
│   │   ├── tours/
│   │   └── airlines/
│   └── icons/
├── css/
│   ├── reset.css
│   ├── styles.css
│   ├── components.css
│   └── responsive.css
├── js/
│   ├── app.js
│   ├── router-utils.js
│   ├── database.js
│   ├── data-service.js
│   ├── cart-service.js
│   ├── email-service.js
│   ├── components.js
│   └── pages/
│       ├── home.js
│       ├── flights.js
│       ├── flight-detail.js
│       ├── tours.js
│       ├── tour-detail.js
│       ├── cart.js
│       └── confirmation.js
├── docs/
│   └── (project notes if needed)
└── README.md
```

## Architecture principles

-   Multi-page static site; no client-side framework.
-   ES modules where supported by the local development server.
-   Shared header/footer and reusable UI functions.
-   Keep page-specific code in `js/pages/`.
-   Keep database initialization and persistence separate from UI
    rendering.
-   Keep cart operations separate from page code.
-   Keep email integration separate from booking creation.
-   Use URL query parameters for search criteria and detail IDs.

## Database implementation

Preferred: - SQL.js / SQLite WASM. - IndexedDB stores the exported
SQLite database bytes. - Initialize schema and sample data on first
launch. - Save the updated database after cart or booking mutations.

Fallback: - If SQL.js cannot be loaded in the chosen offline setup, use
a clearly labelled temporary JSON adapter. - Do not claim SQLite is
active until SQL.js is integrated and verified.

## Email adapter

Create `js/email-service.js` with a provider-neutral interface:

``` js
async function sendBookingConfirmation(booking) {
  // Return { success: false, status: "not_configured" } by default.
}
```

Default behavior must not claim an email was sent. If EmailJS is later
configured: - Read only public client-side configuration from a local
config file excluded from version control where appropriate. - Never
include Gmail credentials or private secrets. - Handle provider
success/failure. - Store the resulting email status with the booking. -
Make it clear that EmailJS sends through its configured
provider/template; it does not mean the browser is logging into Gmail as
the requested sender.

## Security and privacy

-   No passwords or payment card collection.
-   No secrets in frontend source.
-   Validate inputs on the client for usability, but explain that
    client-side validation is not a security boundary.
-   Render untrusted values with `textContent`.
-   Avoid unsafe HTML injection.
-   Include a short demo privacy notice.
-   Use sample data only; do not scrape airline inventory.

## Development and testing

-   Run with VS Code Live Server or another static HTTP server.
-   ES modules and WASM assets may not work reliably when opening HTML
    via `file://`.
-   Test at desktop, tablet, and mobile widths.
-   Test refresh persistence, empty states, invalid form inputs, missing
    IDs, and storage failures.
