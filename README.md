# EXTREME FieldForce CRM — Personal Prototype V1

Responsive CRM prototype for the EXTREME Skin Technology range, developed as a **separate project from THE NEXUS**.

**Status:** Feature branch prototype. The public repository contains application source code and catalogue-derived general information, **no real customers, contacts, invoices, or credentials**. Do not enter confidential work data before a private, approved deployment and a reviewed access-control setup.

## What is implemented

- Premium navy, copper and silver EXTREME-inspired responsive UI.
- Customer Master List: manual creation/edit, classification, territory, and one-time Excel/CSV import from the website.
- Target selection and required call frequency.
- Visit planning, daily reporting, drafts, submissions, feedback, products, resources and follow-up date.
- Full date-searchable Reports Archive. Records are not limited to the most recent two days.
- Sales Channels, priorities and editable 90-day targets.
- Milestone / action-plan status.
- Sales and collections entry; account / SKU / channel attribution.
- Personal KPI dashboard with workload, calls, coverage, frequency and target achievement.
- Detailing Aid for **EX001–EX006**, including catalogue-derived ingredients, cosmetic messages, directions and precautions.
- Local JSON backup, CSV visit export, and optional Google Sheets OAuth sync.

## Brand and product source

**Primary source:** User-supplied `EXTREME_Skin_Technology_Product_Catalogue.pdf` (12 pages), especially pages 2–10. Brand references: [BIONYX EXTREME](https://www.bionyxhealth.com/brands/dermocosmetics/extreme-skin-technology).

**Six products:**
- EX001 Hydro & Barrier Cleanser — 200 mL
- EX002 Advanced Whitening Serum — 50 mL
- EX003 Advanced Hydrating Serum — 50 mL
- EX004 Advanced Purifying Serum — 50 mL
- EX005 Advanced Longevity Serum — 50 mL
- EX006 Advanced Exfoliating Serum — 50 mL

The version-one packaging graphics are **stylized illustrations**, not official high-resolution packshot photographs. Replace with reviewed high-res images only when rights and final assets are confirmed. The product detail text is extracted/condensed from the provided catalogue, and **is not a substitute for approved professional detailing material**. Do not expand cosmetic claims into medical treatment claims.

## 90-day target seed

Adapted from the user-supplied `EXTREME_Riyadh_90_Day_Sales_Plan_Focused_v3.pptx`.

| Channel | Priority | Units (target) |
|---|---:|---:|
| Dermatology / Aesthetic Clinics | 1 | 252 |
| Online Rx Platforms | 2 | 72 |
| Lemon Pharmacies | 2 | 120 |
| Other Retail Pharmacies | 3 | 36 |
| Private Hospitals | 4 | 0 |
| **Total** | | **480** |

The base forecast at SAR 100 per unit is SAR 48,000, **not actual revenue**. All KPIs start at zero until corresponding records exist.

## Architecture

- `index.html` — application shell
- `styles.css` — design system and responsive components
- `catalogue.js` — product reference and seeded channel plan
- `app.js` — CRM pages, local data model, actions and KPIs
- `sheets.js` — optional authenticated Google Sheets bridge

This is a static website. Google is contacted directly by the signed-in browser through user-authorized Sheets API calls. It does not embed service-account keys or passwords. Records are kept in `localStorage` until Google Sheets sync is explicitly configured and authorized; browser storage is **not** durable business-grade storage.

## Google Sheets workbook

Created at: [EXTREME CRM — Data V1](https://docs.google.com/spreadsheets/d/1NKl4ujMJlvpqR9GcvBhQedSn8BGP5dbUgsyK2pYfXQk/edit)

Eight matching tabs: `Customers`, `Visits`, `Sales`, `Collections`, `Activities`, `Channels`, `Milestones`, `Config`.

The app comes preconfigured with the spreadsheet ID; the remaining Google OAuth Client ID must be added by the user.

### Authorizing a personal Google account

1. In [Google Cloud Console](https://console.cloud.google.com/), create/select a project.
2. Enable **Google Sheets API**.
3. Configure **OAuth consent screen** (External in testing for a personal account) and add your Google account as a test user if required.
4. Create an **OAuth 2.0 Client ID** of type **Web application**.
5. In **Authorized JavaScript origins**, add the exact origin hosting the website, such as `https://moutaz-o.github.io` when GitHub Pages is enabled, or `http://localhost:8000` for local testing. Do not enter a GitHub repository URL as the origin.
6. In the CRM website, open **Settings & Sync**, enter the **Client ID**, and verify the spreadsheet ID.
7. Click **Authorize Google**, review the permissions, then click **Load from Sheets** or **Sync to Sheets**.

Google Drive connectivity **inside ChatGPT** does not automatically authorize a different browser website; this separate OAuth process is mandatory.

**Important sync behavior:** `Sync to Sheets` overwrites the CRM tabs with your browser's snapshot. `Load from Sheets` replaces the browser working copy (after confirmation when local customers exist). Once a load or manual sync has succeeded, a new local save schedules automatic sheet sync while the Google OAuth token remains valid. Before syncing from a second browser/device, first load the most recent Google Sheet data. This is a **single-user, last-writer-wins prototype**, not a concurrency-safe multi-user database. Always export a JSON backup before large imports or bulk edits. Do not change sheet column headers.

## KPI definitions in this prototype

- **Workload** = sum of required calls for selected target customers in a cycle.
- **Call Rate** = completed/draft/submitted visits in the current month ÷ configured working days. This is a simple monthly-plan denominator, not observed working days.
- **Call Coverage %** = unique target customers with visits this month ÷ selected targets.
- **Call Frequency** = target visits this month ÷ unique targets visited this month.
- **Sales Achievement %** = recorded net sales in the configured 90-day window ÷ configured trade unit price × sum of 90-day channel unit targets.
- **Outstanding** = recorded net sales minus recorded collections (simplified; invoice-level allocations are not yet implemented).

KPI policies must be reviewed before using the numbers for official performance management.

## Importing customers

Upload an Excel / CSV file from **Customer Master → Import Excel**. The importer reads the first worksheet and supports case-insensitive column names such as `Name`, `Type`, `Specialty`, `Account`, `Territory`, `Phone`. Records with identical normalized **name and linked account** are skipped. A true multi-sheet physician/account/purchaser mapping workflow is a future upgrade. Existing records and visits are retained.

## Deployment and privacy

For design review, preview static files locally using a simple local web server (`python -m http.server 8000`), then visit `http://localhost:8000`.

This repository is **PUBLIC**. Treat the app as a prototype only. GitHub Pages has restrictions on commercial/SaaS use, and a static, publicly deployed page is not by itself an access-controlled CRM. For use with genuine HCP/contact/financial records, first review privacy, company permission, authorized hosting, Google OAuth scopes and the implications of storing personal data in a browser.

## Next milestones

1. Review visual identity and get company-approved product imagery.
2. Complete OAuth setup and perform end-to-end live Google Sheets save/load test.
3. Verify Excel import on the real Master List structure using anonymized sample data.
4. Define full accounting reconciliation and target allocation rules.
5. Add server-enforced access permissions for the later multi-user edition.
