# DMRS — Design System
## Digital Material Requisition System

> **Project:** Digital Material Requisition System (DMRS)  
> **Company:** PT. Guthrie International Pulau Laut Refinery  
> **Platform:** Web Application  
> **Design System Version:** 1.0  
> **Source:** PRD DMRS v1.5 supplied for development  
> **Frontend target:** Laravel Blade + Tailwind CSS/Bootstrap-compatible utilities + JavaScript

---

## 0. Purpose

Dokumen ini adalah **single source of truth untuk UI/UX** DMRS. Design system menerjemahkan requirement PRD menjadi aturan visual, komponen, pola halaman, interaction pattern, responsive behavior, accessibility, dan aturan implementasi yang konsisten.

Design system ini mencakup:

- Design principles
- Brand direction
- Color tokens
- Typography
- Spacing
- Grid dan layout
- Border radius
- Elevation/shadow
- Iconography
- Navigation
- Buttons
- Forms
- Inputs
- Select/search
- Date/time controls
- Tables
- Status badges
- Cards
- Modal/dialog
- Drawer
- Toast/notification
- Alert
- Empty/loading/error states
- Pagination
- File/export controls
- Approval components
- Stock components
- Material Request components
- Audit trail components
- Dashboard patterns
- Page specifications
- Responsive rules
- Accessibility
- UX writing
- Validation/error rules
- Interaction states
- Role-based UI visibility
- Design tokens untuk implementasi
- Component naming
- Frontend folder structure
- QA checklist

---

# 1. Product Context

DMRS mendigitalisasi proses Material Requisition Form (MRF):

```text
LOGIN
  ↓
DASHBOARD
  ↓
CREATE REQUEST
  ↓
DRAFT
  ↓
SUBMIT
  ↓
PENDING APPROVAL
  ├── APPROVED
  │     ↓
  │   PROCESSING
  │     ↓
  │   COMPLETED
  │
  └── REJECTED
```

Status yang harus didukung UI:

```text
DRAFT
SUBMITTED
PENDING_APPROVAL
APPROVED
REJECTED
PROCESSING
COMPLETED
CANCELLED
```

Untuk cancellation setelah approval, PRD merekomendasikan status yang lebih spesifik:

```text
CANCELLED_AFTER_APPROVAL
```

UI harus membedakan rejection oleh Executive/HoD dari cancellation oleh Admin setelah approval.

---

# 2. Design Principles

## 2.1 Professional

DMRS adalah aplikasi internal perusahaan. Visual harus terasa:

- Corporate
- Reliable
- Structured
- Clean
- Operational
- Data-oriented

Hindari visual yang terlalu playful, gaming-like, atau dekoratif.

## 2.2 Clarity First

Prioritas desain:

```text
Clarity
  >
Accuracy
  >
Speed
  >
Visual decoration
```

Informasi request, stock, approval, dan audit harus mudah dipindai.

## 2.3 Operational Efficiency

User melakukan pekerjaan administratif berulang. UI harus:

- meminimalkan klik,
- mempertahankan context,
- menggunakan filter,
- menyediakan search,
- memberikan feedback langsung,
- menggunakan keyboard-friendly controls,
- dan menghindari form yang tidak perlu.

## 2.4 Data Integrity

Data penting harus terlihat jelas dan tidak mudah salah diubah.

Contoh:

- SOH diberi label jelas.
- Request Number read-only.
- Approved request memiliki visual state berbeda.
- Cancellation membutuhkan reason.
- Rejection membutuhkan reason.
- Perubahan Admin setelah approval menampilkan audit information.

## 2.5 Role Awareness

UI mengikuti role:

```text
ADMIN
USER / REQUESTER
EXECUTIVE / HoD / APPROVER
```

Jangan hanya menyembunyikan tombol di frontend. Authorization tetap dilakukan di backend.

## 2.6 Progressive Disclosure

Informasi utama ditampilkan terlebih dahulu.

Detail tambahan dapat dibuka melalui:

- expandable row,
- drawer,
- modal,
- tabs,
- detail page.

---

# 3. Visual Direction

## 3.1 Overall Style

Gunakan visual direction:

```text
Modern Corporate
+
Enterprise Dashboard
+
Industrial Operations
+
Minimal Data UI
```

Karakter:

- clean white surfaces,
- neutral gray background,
- strong primary blue,
- semantic green/yellow/red,
- compact data tables,
- medium-density information,
- subtle shadows,
- restrained border radius.

## 3.2 Visual Hierarchy

Prioritas:

1. Page title
2. Primary action
3. Status / critical information
4. Main data
5. Supporting metadata
6. Secondary actions

---

# 4. Design Tokens

Semua nilai visual harus berasal dari token.

Jangan menulis nilai warna/spacing secara acak pada component.

Contoh:

```text
BAD
text-[#1456A0]

GOOD
text-primary-600
```

---

# 5. Color System

## 5.1 Primary

Primary digunakan untuk:

- primary CTA,
- active navigation,
- links,
- focus indicator,
- selected state,
- important interactive elements.

```text
Primary 50   #EFF6FF
Primary 100  #DBEAFE
Primary 200  #BFDBFE
Primary 300  #93C5FD
Primary 400  #60A5FA
Primary 500  #3B82F6
Primary 600  #2563EB
Primary 700  #1D4ED8
Primary 800  #1E40AF
Primary 900  #1E3A8A
```

Default primary:

```text
primary-600
```

## 5.2 Neutral

```text
Neutral 0    #FFFFFF
Neutral 50   #F8FAFC
Neutral 100  #F1F5F9
Neutral 200  #E2E8F0
Neutral 300  #CBD5E1
Neutral 400  #94A3B8
Neutral 500  #64748B
Neutral 600  #475569
Neutral 700  #334155
Neutral 800  #1E293B
Neutral 900  #0F172A
```

Usage:

```text
Background       neutral-50
Surface          neutral-0
Border           neutral-200
Muted text       neutral-500
Body text        neutral-700
Heading          neutral-900
```

## 5.3 Semantic Colors

### Success

```text
Success 50   #F0FDF4
Success 100  #DCFCE7
Success 500  #22C55E
Success 600  #16A34A
Success 700  #15803D
```

Used for:

- APPROVED
- COMPLETED
- successful save
- successful stock operation

### Warning

```text
Warning 50   #FFFBEB
Warning 100  #FEF3C7
Warning 500  #F59E0B
Warning 600  #D97706
Warning 700  #B45309
```

Used for:

- LOW STOCK
- pending attention
- incomplete configuration

### Danger

```text
Danger 50   #FEF2F2
Danger 100  #FEE2E2
Danger 500  #EF4444
Danger 600  #DC2626
Danger 700  #B91C1C
```

Used for:

- REJECTED
- destructive actions
- validation errors
- OUT OF STOCK

### Info

```text
Info 50   #EFF6FF
Info 100  #DBEAFE
Info 500  #3B82F6
Info 600  #2563EB
Info 700  #1D4ED8
```

---

# 6. Status Color Mapping

Status must be semantically consistent across dashboard, table, detail page, PDF preview, and history.

| Status | UI color | Recommended visual |
|---|---|---|
| DRAFT | Neutral | Gray badge |
| SUBMITTED | Info | Blue badge |
| PENDING_APPROVAL | Warning | Amber badge |
| APPROVED | Success | Green badge |
| REJECTED | Danger | Red badge |
| PROCESSING | Primary | Blue badge |
| COMPLETED | Success | Green badge |
| CANCELLED | Neutral/Danger | Gray or red outline |
| CANCELLED_AFTER_APPROVAL | Danger | Red outline badge |
| LOW STOCK | Warning | Amber badge |
| OUT OF STOCK | Danger | Red badge |
| NORMAL | Success | Green badge |

Never communicate status by color alone. Always include text.

---

# 7. Typography

## 7.1 Font

Recommended:

```text
Inter
```

Fallback:

```text
ui-sans-serif
system-ui
sans-serif
```

## 7.2 Type Scale

```text
Display      32px / 40px / 700
H1           28px / 36px / 700
H2           24px / 32px / 700
H3           20px / 28px / 600
H4           18px / 26px / 600

Body Large   16px / 24px / 400
Body         14px / 22px / 400
Body Small   13px / 20px / 400

Label        13px / 18px / 500
Caption      12px / 18px / 400
```

## 7.3 Typography Rules

- Heading menggunakan neutral-900.
- Body menggunakan neutral-700.
- Secondary text menggunakan neutral-500.
- Link menggunakan primary-600.
- Jangan menggunakan lebih dari 3 font weights dalam satu component.
- Angka penting boleh menggunakan font-weight 600/700.

---

# 8. Spacing System

Gunakan kelipatan 4px.

```text
space-0   = 0px
space-1   = 4px
space-2   = 8px
space-3   = 12px
space-4   = 16px
space-5   = 20px
space-6   = 24px
space-8   = 32px
space-10  = 40px
space-12  = 48px
space-16  = 64px
space-20  = 80px
space-24  = 96px
```

Default:

```text
Component internal gap: 8–16px
Form field gap: 16px
Section gap: 24–32px
Page section gap: 32px
```

---

# 9. Border Radius

DMRS menggunakan moderate radius.

```text
radius-sm   = 4px
radius-md   = 6px
radius-lg   = 8px
radius-xl   = 12px
radius-2xl  = 16px
radius-full = 9999px
```

Recommended:

```text
Input       radius-md
Button      radius-md
Card        radius-lg
Modal       radius-xl
Badge       radius-full
Avatar      radius-full
```

---

# 10. Border

Default:

```text
1px solid neutral-200
```

Focus:

```text
1px solid primary-500
```

Error:

```text
1px solid danger-500
```

Disabled:

```text
neutral-200
```

---

# 11. Elevation

Gunakan shadow secara restrained.

```text
shadow-sm
```

Untuk card dan input group.

```text
shadow-md
```

Untuk dropdown, popover, modal ringan.

```text
shadow-lg
```

Untuk modal/dialog.

Jangan menggunakan shadow berat pada semua card.

---

# 12. Layout System

## 12.1 Application Shell

Desktop:

```text
┌─────────────────────────────────────────────────────────┐
│ Top Bar                                                 │
├──────────────┬──────────────────────────────────────────┤
│ Sidebar      │ Main Content                             │
│              │                                          │
│ Navigation   │ Page Header                              │
│              │                                          │
│              │ Content                                  │
│              │                                          │
└──────────────┴──────────────────────────────────────────┘
```

Recommended dimensions:

```text
Sidebar width: 240px
Collapsed sidebar: 72px
Topbar height: 64px
Main content max-width: 1440px
Page horizontal padding: 24px
```

## 12.2 Desktop

```text
>= 1280px
```

Use:

- full sidebar,
- multi-column dashboard,
- data tables,
- right-side action groups.

## 12.3 Tablet

```text
768px – 1279px
```

Use:

- collapsible sidebar,
- 2-column grids,
- horizontally scrollable tables,
- stacked form groups when needed.

## 12.4 Mobile

```text
< 768px
```

Use:

- drawer navigation,
- single-column layout,
- full-width primary actions,
- card/list alternative for complex tables,
- horizontal scrolling only when table structure must remain tabular.

---

# 13. Page Container

Standard:

```html
<main class="mx-auto w-full max-w-[1440px] px-4 md:px-6 lg:px-8">
```

Page structure:

```text
Page
├── Breadcrumb
├── Page Header
│   ├── Title
│   ├── Description
│   └── Actions
├── Filter / Toolbar
├── Main Content
└── Secondary Content
```

---

# 14. Grid

## Dashboard

```text
4 columns desktop
2 columns tablet
1 column mobile
```

## Form

```text
12-column grid
```

Common patterns:

```text
1/2 + 1/2
1/3 + 2/3
1/4 + 3/4
Full width
```

---

# 15. Iconography

Recommended icon library:

```text
Lucide Icons
```

Rules:

- stroke-based,
- consistent 1.5–2px visual weight,
- no decorative icon without purpose,
- icon + label for important actions,
- icon-only button requires tooltip and accessible label.

Standard sizes:

```text
xs = 14px
sm = 16px
md = 20px
lg = 24px
xl = 32px
```

Common icons:

| Function | Icon |
|---|---|
| Dashboard | LayoutDashboard |
| User | User |
| Users | Users |
| Material | Package |
| Stock | Boxes |
| Request | FileText |
| Approval | ClipboardCheck |
| History | History |
| Report | FileBarChart |
| Audit | ShieldCheck |
| Search | Search |
| Filter | SlidersHorizontal |
| Add | Plus |
| Edit | Pencil |
| Delete/Deactivate | Trash2 / Ban |
| Approve | Check |
| Reject | X |
| Download | Download |
| Export | FileSpreadsheet |
| Notification | Bell |
| Settings | Settings |
| More | MoreHorizontal |

---

# 16. Navigation

## 16.1 Admin

```text
Dashboard

MASTER DATA
├── Users
├── Departments
├── Plants
├── Materials
└── Categories

INVENTORY
├── Stock
├── Stock In
├── Stock Adjustment
└── Stock History

REQUEST
├── All Requests
├── Pending
├── Approved
├── Rejected
└── Completed

REPORT
├── Request Report
├── Stock Report
└── Approval Report

AUDIT
└── Audit Trail

SYSTEM
└── Settings
```

## 16.2 User

```text
Dashboard

MATERIAL REQUEST
├── New Request
├── Draft
├── Pending
├── Approved
├── Rejected
└── History

PROFILE
```

## 16.3 Approver

```text
Dashboard

APPROVAL
├── Pending Approval
├── Approved
├── Rejected
└── History

PROFILE
```

## 16.4 Sidebar Rules

Active item:

```text
background: primary-50
text: primary-700
icon: primary-600
```

Inactive:

```text
text: neutral-600
```

Hover:

```text
background: neutral-100
```

---

# 17. Topbar

Topbar elements:

```text
[Menu] [Breadcrumb / Context]                 [Notification] [User]
```

User menu:

```text
Profile
Role
Settings
Logout
```

Do not place destructive actions directly in topbar.

---

# 18. Buttons

## 18.1 Variants

### Primary

Use for main page action.

```text
Create Request
Submit Request
Approve
Save
Export
```

### Secondary

Use for supporting action.

```text
Cancel
Back
Filter
Reset
```

### Outline

Use for secondary emphasis.

### Ghost

Use for low-emphasis actions.

### Danger

Use for:

```text
Reject
Cancel Request
Deactivate
Delete
```

## 18.2 Sizes

```text
sm: 32px
md: 40px
lg: 44px
```

Default:

```text
40px
```

## 18.3 Button Anatomy

```text
[Icon] Label
```

Spacing:

```text
8px
```

## 18.4 Loading

Button saat submit:

```text
[Spinner] Saving...
```

Button tidak boleh menerima klik kedua saat loading.

---

# 19. Inputs

Default input:

```text
height: 40px
padding-x: 12px
border: neutral-200
radius: md
```

States:

```text
default
hover
focus
disabled
readonly
error
success
```

## Readonly

Digunakan untuk:

- Request Number
- SOH
- calculated Balance
- generated values

Readonly bukan disabled jika user masih perlu membaca atau menyalin data.

---

# 20. Labels

Format:

```text
Label *
```

Required field:

```text
Material *
```

Helper text:

```text
Pilih material dari master material aktif.
```

Error:

```text
Material wajib dipilih.
```

---

# 21. Form Pattern

```text
Card
├── Section Header
├── Form Grid
│   ├── Label
│   ├── Input
│   └── Helper/Error
└── Actions
```

Recommended field order mengikuti proses bisnis.

---

# 22. Material Request Form

## Header

```text
Request Number     [AUTO / READONLY]
Document Number    [ADMIN ONLY]
Request Date       [DATE]
Requester          [READONLY]
Department         [SELECT]
Plant              [SELECT]
G/L Account        [INPUT]
PWO No.             [INPUT]
Pur Org             [INPUT]
Pur Group           [INPUT]
Cost Center         [INPUT]
Reason              [TEXTAREA]
```

## Material Items

Table:

```text
┌────┬──────────┬────────────┬─────┬─────┬─────┬────────┬───────┐
│ No │ Material │ Description│ Qty │ UoM │ SOH │ Balance│ Action│
├────┼──────────┼────────────┼─────┼─────┼─────┼────────┼───────┤
│ 1  │ MAT-001  │ Bearing    │  2  │ PCS │  20  │ 18    │ ...   │
└────┴──────────┴────────────┴─────┴─────┴─────┴────────┴───────┘
```

Balance:

```text
Balance = SOH - Requested Quantity
```

SOH berasal dari database.

---

# 23. Material Selector

Material selector harus mendukung:

- search by material number,
- search by description,
- category filter,
- plant filter jika relevan,
- stock visibility,
- inactive material exclusion.

Dropdown result:

```text
Material Number
Description
UoM
SOH
Stock Status
```

Contoh:

```text
MAT-001
Bearing 6205
PCS · SOH 25
NORMAL
```

---

# 24. Stock UI

## Stock Status

### NORMAL

```text
[● NORMAL]
SOH > Minimum Stock
```

### LOW STOCK

```text
[● LOW STOCK]
SOH <= Minimum Stock
```

### OUT OF STOCK

```text
[● OUT OF STOCK]
SOH = 0
```

## Stock Detail

```text
Material
Description
UoM
Current Stock
Minimum Stock
Maximum Stock
Storage Location
Plant
Status
```

---

# 25. Stock Transaction UI

Transaction types:

```text
STOCK_IN
STOCK_OUT
ADJUSTMENT
REVERSAL
```

Visual differentiation:

| Type | Visual |
|---|---|
| STOCK_IN | Success |
| STOCK_OUT | Primary |
| ADJUSTMENT | Warning |
| REVERSAL | Danger/neutral |

History columns:

```text
Date
Material
Transaction Type
Reference
Qty In
Qty Out
Balance
User
Note
```

---

# 26. Approval Inbox

Primary table:

```text
Request Number
Date
Requester
Department
Plant
Total Items
Status
Action
```

Actions:

```text
View
Approve
Reject
```

For safety, Approve/Reject should require viewing request detail before final action.

---

# 27. Approval Detail

Recommended structure:

```text
Request Header
    ↓
Requester Information
    ↓
Material Items
    ↓
Stock Information
    ↓
Request Reason
    ↓
Approval History
    ↓
Audit / Activity
    ↓
Action Bar
```

Action bar:

```text
[Reject] [Approve]
```

Approve:

```text
Confirmation dialog
```

Reject:

```text
Reason textarea *
```

---

# 28. Approved Request

Approved request should show:

```text
[APPROVED]
Approved by: Executive / HoD
Approved at: <timestamp>
```

Admin-only editable fields:

```text
Plant
G/L Account
PWO No.
Pur Org
Pur Group
Cost Center
```

Every edit requires:

```text
Change Reason *
```

---

# 29. Admin Edit After Approval

Use a warning/info banner:

```text
Approved Request

This request has already been approved by Executive / HoD.
Changes made here do not modify the original approval history.
All changes are recorded in the audit trail.
```

Changed field visual:

```text
Original: CC-001
Current:  CC-002
```

Optional diff:

```text
BEFORE     AFTER
CC-001  →  CC-002
```

---

# 30. Cancel After Approval

Button:

```text
Reject / Cancel Request
```

Only visible when:

```text
status = APPROVED
AND request has not been completed
```

Confirmation dialog:

```text
Cancel approved request?

This action will cancel the request and will not reduce stock.
If stock has already been issued, the system will create a REVERSAL transaction.

Reason *
```

Reason examples:

```text
User batal mengambil barang
Material tidak jadi digunakan
Request dibatalkan oleh User
Other
```

---

# 31. Stock-Out Processing

Approval does NOT automatically create STOCK_OUT.

UI must clearly distinguish:

```text
APPROVED
```

from:

```text
STOCK OUT PROCESSED
```

Stock-Out action only appears when business process permits actual issue.

Confirmation:

```text
Process Stock Out?

Material will be deducted from stock.
```

After successful processing:

```text
Transaction: STOCK_OUT
Reference: MR-2026-000001
Processed by: Admin
Processed at: <timestamp>
```

---

# 32. Cancellation + Reversal

If stock has already been issued and request is cancelled:

```text
CANCEL
  ↓
CHECK STOCK_OUT
  ↓
YES
  ↓
CREATE REVERSAL
  ↓
RESTORE STOCK
```

UI activity timeline:

```text
Approved
   ↓
Stock Out
   ↓
Cancelled
   ↓
Reversal
```

Never delete the original STOCK_OUT transaction.

---

# 33. Tables

Tables are a core DMRS component.

## Table Rules

- compact but readable,
- sticky header for long tables,
- sortable columns where useful,
- filterable,
- pagination,
- row hover,
- clear numeric alignment,
- status badge,
- action menu.

## Numeric Alignment

Numbers:

```text
right aligned
```

Text:

```text
left aligned
```

Status:

```text
center/left depending on table density
```

---

# 34. Table Toolbar

Standard:

```text
[Search........................] [Filter] [Export] [Columns]
```

Optional:

```text
[Date Range]
[Status]
[Department]
[Plant]
[Approver]
```

On mobile:

```text
Search
Filter button
More actions
```

---

# 35. Filters

Filters should support the PRD-defined fields.

## Request Filters

```text
Request Number
Requester
Department
Plant
Material
Status
Date From
Date To
Approver
```

## User History

```text
Request Number
Date From
Date To
Status
Material
```

## Filter Behavior

Buttons:

```text
Apply
Reset
```

Show active filter count:

```text
Filter (3)
```

---

# 36. Pagination

Default:

```text
10 / 25 / 50 / 100 rows
```

Display:

```text
Showing 1–25 of 248
```

Controls:

```text
Previous
1
2
3
...
Next
```

---

# 37. Cards

Card anatomy:

```text
┌───────────────────────────────┐
│ Title                 Action  │
│                               │
│ Main Value                    │
│ Supporting information        │
└───────────────────────────────┘
```

Use for:

- dashboard metrics,
- summary,
- stock overview,
- request summary.

Do not use cards around every table row.

---

# 38. Dashboard KPI Cards

## Admin

Required metrics:

```text
Total Materials
Total Stock
Low Stock
Out of Stock
Pending Requests
Approved Requests
Rejected Requests
Completed Requests
```

## User

```text
My Requests
Pending
Approved
Rejected
Completed
```

## Approver

```text
Pending Approval
Approved
Rejected
```

KPI card anatomy:

```text
[Icon]

Label
32

Supporting text
```

Critical values may include trend/context only if real data exists.

Do not fabricate percentage trends.

---

# 39. Dashboard Sections

Admin:

```text
KPI Grid
    ↓
Request Overview
    ↓
Stock Alerts
    ↓
Recent Requests
    ↓
Recent Activity
```

User:

```text
KPI Grid
    ↓
My Recent Requests
    ↓
Request Status Overview
```

Approver:

```text
Pending Approval KPI
    ↓
Approval Inbox
    ↓
Recent Approval History
```

---

# 40. Empty States

Empty state must explain:

1. What is empty.
2. Why it may be empty.
3. What user can do next.

Example:

```text
No requests yet

You have not created any material request.

[Create Request]
```

Do not use generic:

```text
No data.
```

when a useful action exists.

---

# 41. Loading States

Use skeletons for page-level data.

Example:

```text
████████████
████████
████████████████
```

Use spinner for:

- button action,
- small inline operation,
- short async operation.

Avoid blocking entire page for small operations.

---

# 42. Error States

## Page Error

```text
Unable to load requests

Something went wrong while loading the request data.

[Try Again]
```

## Form Error

Show:

```text
Please correct the highlighted fields.
```

Errors must appear near the relevant field.

---

# 43. Toast Notifications

Use for completed actions.

Success:

```text
Request submitted successfully.
```

Approval:

```text
Request MR-2026-000001 has been approved.
```

Rejection:

```text
Request rejected. The requester has been notified.
```

Error:

```text
Unable to save changes. Please try again.
```

Toast duration:

```text
Success: 3–5 sec
Warning: 5–7 sec
Error: until dismissed or 7 sec minimum
```

Important errors should remain visible.

---

# 44. Alert / Banner

Use banner for persistent contextual information.

Examples:

```text
Approved Request

This request has been approved. Admin can complete the required procurement fields.
```

```text
Low Stock

5 materials are currently below their minimum stock level.
```

---

# 45. Modal / Dialog

Use for:

- confirmation,
- reject reason,
- cancellation,
- destructive action,
- short focused forms.

Do not use modal for large complex request forms.

Recommended widths:

```text
sm: 400px
md: 520px
lg: 720px
xl: 960px
```

---

# 46. Confirmation Dialog

Structure:

```text
Title
Description
Optional consequence
Actions
```

Example:

```text
Approve request?

This will approve the material request and notify the requester.

[Cancel] [Approve]
```

Destructive:

```text
Cancel approved request?

This action cannot be undone from this screen.

[Keep Request] [Cancel Request]
```

---

# 47. Drawer

Use drawer for:

- table row detail,
- activity detail,
- quick preview,
- filter panel on mobile.

Drawer should not contain long workflows that need permanent context.

---

# 48. Notification Center

Topbar bell opens notification panel.

Notification anatomy:

```text
[Icon]
Title
Description
Timestamp
Read/Unread state
```

Examples:

```text
New approval request
MR-2026-000001 requires your approval.

2 minutes ago
```

```text
Request approved
Your request MR-2026-000001 has been approved.

10 minutes ago
```

```text
Request rejected
Reason: Material quantity needs clarification.

1 hour ago
```

---

# 49. Audit Trail UI

Audit table:

```text
Timestamp
User
Role
Action
Module
Record ID
Old Value
New Value
IP Address
User Agent
Description
```

For readability, show important fields first.

Recommended table:

```text
Timestamp
User
Action
Module
Record
Description
```

Expandable detail:

```text
Old Value
New Value
IP Address
User Agent
```

---

# 50. Activity Timeline

Useful for request detail.

Example:

```text
● Request Created
  User
  19 Sep 2026 · 09:10

│

● Submitted
  User
  19 Sep 2026 · 09:15

│

● Approved
  Executive / HoD
  19 Sep 2026 · 10:02

│

● Stock Out
  Admin
  19 Sep 2026 · 11:20
```

Cancellation:

```text
● Cancelled After Approval
  Admin
  Reason: User batal mengambil barang
```

---

# 51. Request Detail Page

Recommended information architecture:

```text
Breadcrumb
    ↓
Request Header
    ├── Request Number
    ├── Status
    ├── Date
    └── Actions

Requester Information
    ↓
Request Information
    ↓
Material Items
    ↓
Stock / Processing Information
    ↓
Approval History
    ↓
Activity / Audit
```

---

# 52. Request Header

Example:

```text
Material Request

MR-2026-000001
[APPROVED]

Created 19 Sep 2026
Requester: John Doe
Department: Maintenance
Plant: Pulau Laut

[Download PDF]
[More]
```

Admin may see:

```text
[Edit]
[Reject / Cancel]
[Process Stock Out]
```

based on status.

---

# 53. Request Status Stepper

For active request:

```text
Draft
  ●
Submitted
  ●
Pending Approval
  ●
Approved
  ●
Processing
  ●
Completed
```

Rejected:

```text
Draft
  ●
Submitted
  ●
Pending Approval
  ●
Rejected ✕
```

Cancelled:

```text
Approved
  ●
Processing
  ●
Cancelled
```

Do not show impossible future steps as completed.

---

# 54. PDF Preview UI

PDF must resemble the existing Material Requisition Form.

Preview page:

```text
PDF Preview
├── Document Header
├── Company / Form Identity
├── Request Information
├── Material Table
├── Approval Section
├── Signature / Authorization area if required
└── Footer
```

Actions:

```text
Download PDF
Print
Close
```

---

# 55. Export UI

Export dropdown:

```text
Export
├── Excel
├── CSV
└── PDF
```

For large exports:

```text
Preparing export...
```

Do not freeze the interface unnecessarily.

---

# 56. User Management

Table:

```text
Employee ID
Name
Username
Department
Position
Plant
Role
Approver
Status
Actions
```

Actions:

```text
View
Edit
Enable / Disable
Reset Password
```

User status:

```text
ACTIVE
INACTIVE
```

---

# 57. Material Master

Table:

```text
Material Number
Description
Category
UoM
Minimum Stock
Maximum Stock
Storage Location
Plant
Status
Actions
```

Actions:

```text
View
Edit
Deactivate
```

Never expose hard-delete as default UI because PRD requires deactivation to preserve transaction history.

---

# 58. Master Data Forms

Material:

```text
Material Number *
Description *
Category *
UoM *
Minimum Stock *
Maximum Stock
Storage Location *
Plant *
QR Code
Status
```

Department:

```text
Department Code *
Department Name *
Status
```

Plant:

```text
Plant Code *
Plant Name *
Location
Status
```

Category:

```text
Category Code *
Category Name *
Status
```

---

# 59. Login Page

Structure:

```text
┌───────────────────────────────────────────────┐
│                                               │
│              DMRS                            │
│      Digital Material Requisition System     │
│                                               │
│      Username                                │
│      [________________________]              │
│                                               │
│      Password                                │
│      [________________________]              │
│                                               │
│      [        Sign In        ]               │
│                                               │
│      Forgot password                         │
│                                               │
└───────────────────────────────────────────────┘
```

Tone:

- professional,
- minimal,
- trustworthy.

Do not display development credentials in production UI.

---

# 60. Profile

Show:

```text
Full Name
Employee ID
Username
Email
Department
Position
Plant
Role
Approver
Status
```

Actions:

```text
Change Password
```

---

# 61. Role-Based UI Matrix

| UI feature | Admin | User | Approver |
|---|---:|---:|---:|
| Dashboard | ✓ | ✓ | ✓ |
| User Management | ✓ | - | - |
| Material View | ✓ | ✓ | ✓ |
| Material Edit | ✓ | - | - |
| Stock View | ✓ | ✓ | ✓ |
| Stock In | ✓ | - | - |
| Stock Adjustment | ✓ | - | - |
| Create Request | ✓ | ✓ | - |
| Submit Request | ✓ | ✓ | - |
| Own History | ✓ | ✓ | ✓ |
| All Requests | ✓ | - | Assigned |
| Approve | - | - | ✓ |
| Reject | - | - | ✓ |
| Edit Approved Request | ✓ | - | - |
| Cancel After Approval | ✓ | - | - |
| Stock Out | ✓ | - | - |
| Export | ✓ | Optional | Optional |
| Audit Trail | ✓ | - | - |

---

# 62. Request Number vs Document Number

The UI must visually distinguish:

```text
Request Number
MR-2026-000001
[AUTO GENERATED]
```

from:

```text
Document Number
DOC-PLR-001
[ADMIN INPUT]
```

Rules:

- User cannot edit Request Number.
- User cannot edit Document Number.
- Approver cannot edit either.
- Admin can edit Document Number.
- Admin changes to Document Number must appear in audit trail.

---

# 63. Form Validation

## Required

```text
Required field
```

Error:

```text
This field is required.
```

## Quantity

Rules:

- must be numeric,
- must be greater than 0,
- cannot be negative.

Example:

```text
Quantity must be greater than 0.
```

## Material

```text
Material is inactive.
```

or:

```text
Material not found.
```

## Rejection

```text
Rejection reason is required.
```

## Cancellation

```text
Cancellation reason is required.
```

---

# 64. Unsaved Changes

If user edits a draft and tries to leave:

```text
Unsaved changes

You have unsaved changes in this request.

[Stay] [Leave]
```

---

# 65. Destructive Action Rules

Destructive actions:

```text
Reject
Cancel
Deactivate
Stock Adjustment
Reverse
```

Require:

1. clear action label,
2. consequence,
3. confirmation,
4. reason where PRD requires it,
5. audit trail.

---

# 66. Accessibility

Minimum requirements:

## Keyboard

All interactive controls must be keyboard accessible.

## Focus

Visible focus ring:

```text
2px primary-500
```

## Contrast

Target WCAG AA contrast.

## Labels

Every input must have an accessible label.

## Icon Buttons

Must include:

```text
aria-label
```

## Status

Do not rely on color alone.

Bad:

```text
green dot
```

Good:

```text
✓ APPROVED
```

## Modal

- focus moves into modal,
- escape closes when safe,
- focus returns to trigger,
- destructive action is clearly labeled.

---

# 67. Responsive Tables

Desktop:

```text
Full table
```

Tablet:

```text
Horizontal scroll
```

Mobile:

Prefer:

```text
Card/List representation
```

for request lists.

Example mobile request card:

```text
MR-2026-000001
[APPROVED]

19 Sep 2026
Maintenance
5 items

Requester: John Doe

[View Detail]
```

---

# 68. Responsive Form

Desktop:

```text
Request Date | Department | Plant
G/L Account  | PWO No.    | Cost Center
Pur Org      | Pur Group
Reason       | full width
```

Mobile:

```text
Request Date
Department
Plant
G/L Account
PWO No.
Cost Center
Pur Org
Pur Group
Reason
```

---

# 69. Mobile Navigation

Use drawer:

```text
☰
DMRS
```

Navigation opens from left.

Bottom navigation is not required because DMRS is an enterprise workflow application with multiple navigation groups.

---

# 70. Search

Global or module search should support:

```text
Request Number
Material Number
Material Description
Requester
```

Search should be:

- case-insensitive,
- debounced for live search,
- clearable.

Placeholder:

```text
Search request number, material, requester...
```

---

# 71. Date & Time

Display date consistently:

```text
19 Sep 2026
```

Date + time:

```text
19 Sep 2026 · 10:24
```

Use one timezone policy for the application and backend.

For audit records, always store exact timestamp server-side.

---

# 72. Number Formatting

Quantity:

```text
1,250
```

Currency/account values, if later introduced, must use the company's locale rules.

Do not add currency UI to the current MVP unless the product requirement requires it.

---

# 73. Data Density

DMRS is a business operations application.

Recommended density:

```text
Compact
```

Table row:

```text
48–56px
```

Form field:

```text
40px
```

Page section:

```text
24–32px
```

Avoid oversized cards that reduce visible data.

---

# 74. Page Specifications

## 74.1 Admin Dashboard

```text
Header
  ├── Dashboard
  └── Date/context if needed

KPI
  ├── Total Materials
  ├── Total Stock
  ├── Low Stock
  ├── Out of Stock
  ├── Pending Requests
  ├── Approved Requests
  ├── Rejected Requests
  └── Completed Requests

Content
  ├── Request Overview
  ├── Stock Alerts
  ├── Recent Requests
  └── Recent Activity
```

## 74.2 User Dashboard

```text
KPI
  ├── My Requests
  ├── Pending
  ├── Approved
  ├── Rejected
  └── Completed

Recent Requests
```

## 74.3 Approver Dashboard

```text
KPI
  ├── Pending Approval
  ├── Approved
  └── Rejected

Approval Inbox
```

---

# 75. Request List Page

Header:

```text
Requests
Manage and track material requisitions.
```

Actions:

```text
[+ New Request]
[Export]
```

Toolbar:

```text
Search
Filter
Date Range
Status
```

Table:

```text
Request Number
Date
Requester
Department
Plant
Items
Status
Approver
Actions
```

---

# 76. New Request Page

Header:

```text
New Material Request
```

Actions:

```text
Save Draft
Submit Request
Cancel
```

Sections:

```text
Request Information
Material Items
Reason
Summary
```

---

# 77. Draft Page

Show:

```text
[DRAFT]
Last saved: <timestamp>
```

Actions:

```text
Continue Editing
Submit
Delete Draft
```

Deleting a draft can be destructive and should be confirmed.

---

# 78. History Page

History should show:

```text
Request Number
Date
Status
Last Updated
```

Rejected request:

```text
[REJECTED]
Reason: <reason>
```

---

# 79. Reports

## Request Report

Columns:

```text
Request Number
Date
Requester
Department
Plant
Material
Description
Quantity
UoM
SOH
Status
Approver
Approval Date
```

## Stock Report

```text
Material
Description
UoM
Opening Stock
Stock In
Stock Out
Adjustment
Closing Stock
Minimum Stock
Status
```

## Approval Report

```text
Request Number
Requester
Approver
Submitted Date
Approval Date
Status
Rejection Reason
```

---

# 80. Settings

Possible settings:

```text
Company Profile
Workflow Configuration
Notification Settings
Approval Configuration
Status Configuration
System Preferences
```

Only implement settings supported by backend requirements.

---

# 81. UX Writing

Tone:

```text
Clear
Direct
Professional
Action-oriented
```

Use:

```text
Submit Request
Approve Request
Reject Request
Cancel Request
Save Draft
Process Stock Out
```

Avoid:

```text
Click Here
Do It
Yes
No
OK
```

Prefer precise actions.

---

# 82. Confirmation Copy

Approve:

```text
Approve this request?

The requester will be notified after approval.
```

Reject:

```text
Reject this request?

Please provide a reason. The requester will be notified.
```

Cancel:

```text
Cancel this approved request?

The request will no longer proceed. Stock will not be reduced unless a stock-out transaction has already occurred.
```

---

# 83. Component Naming Convention

Use semantic names.

```text
AppShell
Sidebar
Topbar
PageHeader
Breadcrumbs

Button
IconButton
Badge
Avatar

Input
Textarea
Select
SearchSelect
DatePicker
FormField

Card
StatCard
Alert
Toast
Modal
Drawer

DataTable
TableToolbar
Pagination
FilterPanel

RequestStatusBadge
RequestStepper
RequestTimeline
RequestItemTable

StockStatusBadge
StockSummary
StockTransactionTable

ApprovalCard
ApprovalActionBar
ApprovalHistory

AuditTimeline
AuditLogTable
```

---

# 84. Suggested Component Folder

Laravel Blade:

```text
resources/
└── views/
    └── components/
        ├── ui/
        │   ├── button.blade.php
        │   ├── input.blade.php
        │   ├── select.blade.php
        │   ├── badge.blade.php
        │   ├── card.blade.php
        │   ├── modal.blade.php
        │   ├── alert.blade.php
        │   └── table.blade.php
        │
        ├── layout/
        │   ├── app-shell.blade.php
        │   ├── sidebar.blade.php
        │   ├── topbar.blade.php
        │   └── page-header.blade.php
        │
        ├── request/
        │   ├── request-status-badge.blade.php
        │   ├── request-item-table.blade.php
        │   ├── request-timeline.blade.php
        │   └── request-summary.blade.php
        │
        ├── stock/
        │   ├── stock-status-badge.blade.php
        │   ├── stock-summary.blade.php
        │   └── stock-transaction-table.blade.php
        │
        ├── approval/
        │   ├── approval-action-bar.blade.php
        │   ├── approval-history.blade.php
        │   └── approval-stepper.blade.php
        │
        └── audit/
            ├── audit-timeline.blade.php
            └── audit-log-table.blade.php
```

---

# 85. Suggested CSS Architecture

```text
resources/
└── css/
    ├── app.css
    ├── tokens.css
    ├── components.css
    └── utilities.css
```

Prefer utility classes when using Tailwind.

Avoid writing component-specific CSS unless:

- complex table behavior,
- print/PDF styles,
- advanced animation,
- third-party integration.

---

# 86. Design Token Example

Example CSS:

```css
:root {
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;

  --color-neutral-0: #ffffff;
  --color-neutral-50: #f8fafc;
  --color-neutral-100: #f1f5f9;
  --color-neutral-200: #e2e8f0;
  --color-neutral-500: #64748b;
  --color-neutral-700: #334155;
  --color-neutral-900: #0f172a;

  --color-success-600: #16a34a;
  --color-warning-600: #d97706;
  --color-danger-600: #dc2626;

  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
}
```

---

# 87. Tailwind Mapping

Recommended semantic aliases:

```text
primary-50
primary-100
primary-500
primary-600
primary-700

neutral-50
neutral-100
neutral-200
neutral-500
neutral-700
neutral-900

success-50
success-600

warning-50
warning-600

danger-50
danger-600
```

Example:

```html
<button
  class="inline-flex h-10 items-center gap-2 rounded-md
         bg-primary-600 px-4 text-sm font-medium text-white
         hover:bg-primary-700
         focus:outline-none focus:ring-2 focus:ring-primary-500
         disabled:cursor-not-allowed disabled:opacity-50">
  <span>Submit Request</span>
</button>
```

---

# 88. Component State Matrix

Every interactive component should define:

```text
Default
Hover
Focus
Active
Disabled
Loading
Error
Success
Readonly
```

Example Button:

```text
Default  → primary-600
Hover    → primary-700
Active   → primary-800
Focus    → focus ring
Disabled → opacity + no pointer
Loading  → spinner
```

---

# 89. Status Badge Specification

Badge:

```text
height: 24px
padding-x: 8px
font-size: 12px
font-weight: 500
radius: full
```

Example:

```html
<span class="inline-flex items-center rounded-full bg-success-50 px-2 py-1 text-xs font-medium text-success-700">
  APPROVED
</span>
```

---

# 90. Data Formatting Rules

## Request Number

```text
MR-YYYY-NNNNNN
```

Example:

```text
MR-2026-000001
```

## Document Number

Manual Admin field.

Keep visually separate from Request Number.

## Quantity

Always display with UoM:

```text
25 PCS
```

not:

```text
25
```

when context could be ambiguous.

---

# 91. Security-Aware UI

Frontend should never expose:

- passwords,
- password hashes,
- secret keys,
- internal security configuration.

Do not display development default credentials in production.

Sensitive audit information should follow role permissions.

---

# 92. Permission-Aware Actions

UI action visibility is determined by:

```text
role
+
request status
+
ownership/scope
+
business rules
```

Example:

```text
if Admin
and status == APPROVED
and not completed
→ show Cancel / Edit Approved Fields
```

But backend authorization remains authoritative.

---

# 93. Approval Action Safety

Before approval:

```text
Review request
→ Approve
→ Confirmation
→ Success
```

Before rejection:

```text
Review request
→ Reject
→ Reason
→ Confirmation
→ Success
```

Avoid one-click destructive rejection from dense table rows.

---

# 94. Stock Safety

UI must clearly communicate:

```text
Approval ≠ Stock Out
```

Use an information banner in approved request detail:

```text
Approval completed.
Stock will only be reduced when STOCK_OUT is processed.
```

This is a critical business rule.

---

# 95. Request State UI Rules

| State | Editable by User | Approver Action | Admin Action |
|---|---:|---:|---:|
| DRAFT | Yes | No | Yes |
| SUBMITTED | Limited/No | No | Yes |
| PENDING_APPROVAL | No | Approve/Reject | View |
| APPROVED | No | View | Edit allowed fields / Process |
| REJECTED | New request flow | View | View |
| PROCESSING | No | View | Process |
| COMPLETED | No | View | View |
| CANCELLED | No | View | View |
| CANCELLED_AFTER_APPROVAL | No | View | View/Audit |

---

# 96. Dashboard Responsive Rules

Desktop:

```text
KPI: 4 columns
Main content: 2 columns where useful
```

Tablet:

```text
KPI: 2 columns
Main content: 1–2 columns
```

Mobile:

```text
KPI: 1 column
Main content: 1 column
```

---

# 97. Print/PDF Design

PDF should prioritize document fidelity over web styling.

Rules:

- A4-compatible layout.
- Clear document number.
- Clear request number.
- Company/form header.
- Structured material table.
- Approval information.
- Avoid web-only navigation.
- Hide application sidebar/topbar when printing.

Print CSS:

```css
@media print {
  .no-print {
    display: none !important;
  }

  .print-only {
    display: block !important;
  }

  body {
    background: #ffffff;
  }
}
```

---

# 98. Animation

Use subtle transitions:

```text
150–200ms
```

Recommended:

- hover,
- dropdown,
- modal,
- drawer,
- toast.

Avoid animation on:

- critical data,
- tables,
- large page transitions,
- approval actions.

Animation must never delay a business action.

---

# 99. Do / Don't

## Do

- Use consistent status colors.
- Use explicit action labels.
- Show validation close to the field.
- Preserve audit history.
- Show stock information clearly.
- Make primary action obvious.
- Use confirmation for destructive operations.

## Don't

- Hard delete transaction records.
- Hide important status information.
- Use color as the only status indicator.
- Put many unrelated actions in one button group.
- Auto-reduce stock on approval.
- Allow User to edit approved request.
- Use generic "OK" for destructive confirmations.

---

# 100. UX QA Checklist

## Visual

- [ ] Color tokens are consistent.
- [ ] Typography is consistent.
- [ ] Spacing uses token scale.
- [ ] Buttons have consistent height.
- [ ] Status badges use semantic mapping.
- [ ] Cards use consistent radius/shadow.

## Forms

- [ ] Required fields are marked.
- [ ] Error text is visible.
- [ ] Readonly values are visually distinct.
- [ ] Quantity validation works.
- [ ] Rejection requires reason.
- [ ] Cancellation requires reason.

## Request

- [ ] Request Number is generated automatically.
- [ ] Document Number is separate.
- [ ] SOH is read-only.
- [ ] Balance is calculated automatically.
- [ ] Multiple material items are supported.
- [ ] Draft state is clear.
- [ ] Submit action is clear.

## Approval

- [ ] Pending requests are easy to identify.
- [ ] Approver scope is respected.
- [ ] Approve confirmation exists.
- [ ] Reject reason is required.
- [ ] Approval history is visible.

## Inventory

- [ ] Normal stock is identifiable.
- [ ] Low stock is identifiable.
- [ ] Out of stock is identifiable.
- [ ] Approval does not automatically reduce stock.
- [ ] Stock-out has explicit processing action.
- [ ] Reversal is represented in history.

## Admin

- [ ] Approved request editable fields are limited.
- [ ] Change reason is required.
- [ ] Before/after values can be inspected.
- [ ] Cancel-after-approval is only available in valid state.
- [ ] Audit trail records changes.

## Responsive

- [ ] Desktop layout works.
- [ ] Tablet layout works.
- [ ] Mobile layout works.
- [ ] Tables have mobile strategy.
- [ ] Sidebar becomes drawer.
- [ ] Buttons remain accessible.

## Accessibility

- [ ] Keyboard navigation works.
- [ ] Focus states are visible.
- [ ] Labels are accessible.
- [ ] Icon buttons have labels.
- [ ] Status is not color-only.
- [ ] Modal focus is managed.
- [ ] Contrast meets WCAG AA target.

---

# 101. Development Acceptance Checklist

Before considering a UI component complete:

```text
[ ] Matches design token
[ ] Responsive
[ ] Keyboard accessible
[ ] Loading state
[ ] Empty state
[ ] Error state
[ ] Disabled state
[ ] Permission-aware
[ ] Backend authorization considered
[ ] Validation implemented
[ ] Audit requirements identified
```

---

# 102. Recommended Development Order

Implement the design system before building all feature pages.

```text
1. Tokens
   ↓
2. App Shell
   ↓
3. Typography
   ↓
4. Buttons
   ↓
5. Inputs / Forms
   ↓
6. Cards / Badges / Alerts
   ↓
7. Table / Filter / Pagination
   ↓
8. Modal / Drawer / Toast
   ↓
9. Request Components
   ↓
10. Stock Components
   ↓
11. Approval Components
   ↓
12. Audit Components
   ↓
13. Dashboard
   ↓
14. Feature Pages
```

---

# 103. Suggested Route-to-UI Mapping

```text
/login
    → Login Page

/dashboard
    → Role-based Dashboard

/users
    → User Management

/departments
    → Department Master

/plants
    → Plant Master

/materials
    → Material Master

/stock
    → Stock Overview

/stock/in
    → Stock In

/stock/adjustment
    → Stock Adjustment

/stock/history
    → Stock History

/requests
    → Request List

/requests/create
    → New Request

/requests/{id}
    → Request Detail

/requests/{id}/edit
    → Request Edit

/approvals
    → Approval Inbox

/approvals/{id}
    → Approval Detail

/reports/requests
    → Request Report

/reports/stock
    → Stock Report

/reports/approvals
    → Approval Report

/audit
    → Audit Trail

/profile
    → Profile
```

Actual route naming may be adjusted to Laravel conventions.

---

# 104. Design System Governance

Any new UI feature must answer:

```text
1. Which existing component can be reused?
2. Which design token is used?
3. Which role can access it?
4. Which states are required?
5. What happens on mobile?
6. What happens during loading?
7. What happens on error?
8. Does the action require audit logging?
9. Is the action destructive?
10. Does the UI accurately reflect the backend business rule?
```

Do not create a new component if an existing component can be extended safely.

---

# 105. Source-of-Truth Rules

When UI implementation conflicts with business logic:

```text
Backend authorization
        >
Business rules / PRD
        >
Design System
        >
Visual convenience
```

Visual design must never weaken authorization or business constraints.

For example:

```text
PRD:
Approval does not automatically reduce stock.

Therefore UI:
APPROVED ≠ STOCK_OUT
```

---

# 106. MVP UI Scope

The MVP must include:

```text
Authentication
+
User Management
+
Material Master
+
Stock Management
+
Material Request
+
Draft
+
Submit
+
Approval
+
Reject
+
History
+
PDF
+
Excel Export
+
Audit Trail
```

Required supporting UI:

```text
Dashboard
Sidebar
Topbar
Forms
Tables
Filters
Pagination
Status badges
Confirmation dialogs
Toast notifications
Empty/loading/error states
Responsive layout
```

---

# 107. Final Design System Principle

DMRS harus terasa seperti:

```text
Reliable
    +
Clear
    +
Fast
    +
Controlled
    +
Auditable
```

Bukan sekadar dashboard yang terlihat modern.

Setiap komponen harus membantu pengguna melakukan pekerjaan Material Requisition dengan **lebih cepat, lebih jelas, dan lebih aman**, sambil mempertahankan integritas data, approval history, stock transaction, dan audit trail.

---

# Appendix A — Quick Token Reference

```text
PRIMARY
#2563EB

SUCCESS
#16A34A

WARNING
#D97706

DANGER
#DC2626

TEXT
#0F172A

BODY
#334155

MUTED
#64748B

BORDER
#E2E8F0

SURFACE
#FFFFFF

BACKGROUND
#F8FAFC

RADIUS
6 / 8 / 12px

INPUT HEIGHT
40px

TOPBAR
64px

SIDEBAR
240px

PAGE MAX WIDTH
1440px
```

---

# Appendix B — Component Inventory

```text
FOUNDATION
├── Colors
├── Typography
├── Spacing
├── Radius
├── Shadows
└── Icons

LAYOUT
├── AppShell
├── Sidebar
├── Topbar
├── PageHeader
├── Breadcrumb
└── ResponsiveContainer

INPUT
├── Input
├── Textarea
├── Select
├── SearchSelect
├── DatePicker
├── Checkbox
├── Radio
└── FormField

FEEDBACK
├── Badge
├── Alert
├── Toast
├── Modal
├── Drawer
├── Skeleton
└── EmptyState

DATA
├── Card
├── StatCard
├── DataTable
├── TableToolbar
├── FilterPanel
└── Pagination

DMRS DOMAIN
├── RequestStatusBadge
├── RequestStepper
├── RequestItemTable
├── RequestSummary
├── RequestTimeline
├── StockStatusBadge
├── StockSummary
├── StockTransactionTable
├── ApprovalActionBar
├── ApprovalHistory
├── ApprovalStepper
├── AuditTimeline
└── AuditLogTable
```

---

# Appendix C — Implementation Rule

Untuk setiap halaman baru, gunakan pola:

```text
AppShell
  ↓
PageHeader
  ↓
Toolbar / Filters
  ↓
Primary Content
  ↓
Feedback / States
```

Untuk setiap action:

```text
Idle
 ↓
Validate
 ↓
Loading
 ↓
Success / Error
 ↓
Audit / Notification jika required
```

Untuk setiap status:

```text
Business Status
 ↓
Status Token
 ↓
Status Badge
 ↓
Status-specific Actions
 ↓
Audit / Notification
```

---

# End of Design System
