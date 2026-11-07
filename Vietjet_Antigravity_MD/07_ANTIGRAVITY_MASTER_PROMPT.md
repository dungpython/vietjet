# 07 --- Antigravity Master Prompt

You are the senior frontend engineer implementing the project described
in this documentation folder.

## First task

1.  Read `README.md` and every numbered Markdown file in this folder.
2.  Summarize the requirements, technical constraints, page list, and
    key limitations.
3.  Inspect the current workspace before creating or overwriting files.
4.  Propose a short implementation sequence.
5.  Start with Phase 1 from `06_IMPLEMENTATION_PLAN.md` only. Do not
    build all phases at once.

## Non-negotiable constraints

-   Website name: Vietjet.
-   Build an independent travel-booking prototype; do not claim it is
    the official Vietjet Air website.
-   Use HTML, CSS, and vanilla JavaScript only.
-   No frontend frameworks.
-   No application backend.
-   Use SQLite WASM in the browser and IndexedDB persistence for the
    database bytes.
-   Use a bright, white visual theme with primary red `#EE1D23`.
-   Primary UI language: Vietnamese.
-   Build the pages and flows described in the project docs.
-   Use sample data and label it as demo data.
-   Do not claim real flight availability, live prices, actual
    reservations, ticket issuance, or payment processing.
-   Do not place Gmail passwords, app passwords, private API keys, or
    other secrets in frontend files.

## Design requirements

Create a polished travel website, not a generic admin dashboard.
Prioritize: - Clear flight search on the homepage. - Attractive featured
tour cards with 600×400 imagery. - Recognizable but legally safe airline
brand placeholders. - Easy-to-scan flight result cards. - Clear fare
comparison between Economy and Business. - Readable tour itineraries. -
A cart with transparent item pricing. - A straightforward customer form
and booking-completion state.

## Coding standards

-   Use semantic HTML.
-   Use CSS custom properties for design tokens.
-   Use reusable CSS classes and shared UI components.
-   Use ES modules where practical.
-   Keep data access separate from rendering.
-   Keep cart logic separate from page scripts.
-   Use `URLSearchParams` for navigation state.
-   Use `textContent` for untrusted text.
-   Include accessible labels and keyboard focus states.
-   Avoid unnecessary dependencies.

## Email requirement

The requested sender address is `nvhai061993@gmail.com`. A static
frontend cannot securely send mail as this Gmail account. Implement the
safe unconfigured email adapter first. The confirmation screen must say
the email has not been sent in demo mode. Do not simulate provider
success. If the owner later supplies EmailJS configuration, integrate it
transparently and report actual provider status.

## Working protocol

At the beginning of each phase: - State the phase objective. - List the
files to create or modify. - Identify any assumptions.

At the end of each phase: - List files changed. - Explain how to run the
site. - Report tests actually performed and their results. - List
incomplete items or blockers. - Wait for the owner to review before
proceeding to the next phase.

Do not silently skip requirements. If a requirement conflicts with the
no-backend constraint, explain the conflict and implement the safest
feasible prototype behavior.
