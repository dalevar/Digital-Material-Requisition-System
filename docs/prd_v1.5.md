# PRD — Digital Material Requisition System (DMRS)

**Project Name:** Digital Material Requisition System (DMRS)  
**Company:** PT. Guthrie International Pulau Laut Refinery  
**Version:** 1.0  
**Platform:** Web Application

## 1. Overview

DMRS adalah aplikasi web untuk mendigitalisasi proses Material Requisition Form (MRF), mulai dari pengelolaan master barang dan stok, pembuatan request, approval, histori, reporting, sampai audit trail.

## 2. Objectives

- Mendigitalisasi Material Requisition.
- Mempercepat request dan approval.
- Menyediakan database stok barang.
- Memudahkan tracking dan histori.
- Mengurangi penggunaan dokumen kertas.
- Menyediakan audit trail dan reporting.
- Menerapkan role-based access control.

## 3. Roles

### Admin

Admin dapat mengelola user, master material, stok, seluruh request, report, dan audit trail.

### User / Requester

User dapat membuat request, menyimpan draft, submit request, dan melihat status serta histori request miliknya.

### Executive / HoD / Approver

Executive / HoD dapat melihat request dalam scope approval, approve, reject, dan melihat histori approval.

## 4. Role-Based Access

| Feature | Admin | User | Executive / HoD |
|---|---:|---:|---:|
| Login | ✓ | ✓ | ✓ |
| Dashboard | ✓ | ✓ | ✓ |
| User Management | ✓ | - | - |
| Master Material | ✓ | View | View |
| Stock Management | ✓ | View | View |
| Create Request | ✓ | ✓ | - |
| Submit Request | ✓ | ✓ | - |
| View Own History | ✓ | ✓ | ✓ |
| View All Requests | ✓ | - | Assigned |
| Approve Request | - | - | ✓ |
| Reject Request | - | - | ✓ |
| Edit Approved Request | ✓ | - | - |
| Export Excel | ✓ | Optional | Optional |
| Download PDF | ✓ | Own | Assigned |
| Audit Trail | ✓ | - | - |

## 5. Workflow

```text
USER
  |
  v
CREATE REQUEST
  |
  v
DRAFT
  |
  v
SUBMIT
  |
  v
PENDING APPROVAL
  |
  +-------------------+
  |                   |
  v                   v
APPROVED           REJECTED
  |                   |
  v                   v
PROCESSING          END
  |
  v
COMPLETED
```

Statuses:

- DRAFT
- SUBMITTED
- PENDING_APPROVAL
- APPROVED
- REJECTED
- PROCESSING
- COMPLETED
- CANCELLED

## 6. Authentication

- Login/logout.
- Password hashing.
- Session management.
- Password reset.
- Role-based authorization.
- Session timeout.
- Optional Active Directory / LDAP integration.

Routing setelah login:

```text
ADMIN    -> Admin Dashboard
USER     -> User Dashboard
APPROVER -> Approval Dashboard
```

## 7. User Management

Admin dapat:

- Create user.
- Edit user.
- Enable/disable user.
- Reset password.
- Assign role.
- Assign department.
- Assign plant.
- Assign approver.
- View user history.

Fields:

```text
Employee ID
Username
Full Name
Email
Department
Position
Plant
Role
Approver
Status
```

## 8. Master Data

### Material Master

Admin dapat add, edit, deactivate, search, filter, dan export material.

Fields:

```text
Material Number
Description
Category
UoM
Minimum Stock
Maximum Stock
Storage Location
Plant
QR Code
Status
```

Gunakan deactivate/inactive daripada hard delete agar histori transaksi tetap aman.

### Department, Plant, Category

Admin dapat membuat, mengubah, mengaktifkan/menonaktifkan, dan mencari data master.

## 9. Stock Management

### Stock In

```text
Material
Quantity
Date
Reference
Supplier
Storage Location
Note
```

### Stock Adjustment

```text
Material
Current Stock
Adjustment Quantity
Final Stock
Reason
Date
```

### Stock Out

Stock dapat berkurang ketika material dari request approved diproses sesuai business process.

## 10. Stock Calculation

```text
Balance = SOH - Requested Quantity
```

SOH berasal dari database dan tidak dapat diubah oleh User.

Status stok:

```text
SOH > Minimum Stock -> NORMAL
SOH <= Minimum Stock -> LOW STOCK
SOH = 0 -> OUT OF STOCK
```

## 11. Material Request

### Header

```text
Request Number
Request Date
Department
Plant
G/L Account
PWO No.
Pur Org
Pur Group
Cost Center
Reason
Requester
```

Request number otomatis dengan format:

```text
MR-YYYY-NNNNNN
```

Contoh: `MR-2026-000001`

### Material Detail

User dapat menambahkan banyak material.

```text
No
Material Number
Description
Quantity
UoM
SOH
Balance
Note
```

SOH dan Balance dihitung otomatis.

## 12. Draft Request

User dapat menyimpan request sebagai DRAFT, menambah/mengubah/menghapus item, mengubah header, dan melanjutkan editing sebelum submit.

## 13. Submit Request

Saat SUBMIT:

1. Validate required fields.
2. Validate material.
3. Validate quantity.
4. Generate/update request number.
5. Set status `PENDING_APPROVAL`.
6. Tentukan approver berdasarkan konfigurasi user/department.
7. Buat approval record.
8. Buat audit log.
9. Kirim notification ke approver.

## 14. Approval

Approver memiliki Approval Inbox berisi:

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

Action:

```text
APPROVE
REJECT
```

## 15. Approve

Saat approve:

1. Validasi status masih pending.
2. Simpan approver.
3. Simpan approval date.
4. Set status `APPROVED`.
5. Simpan approval history.
6. Simpan audit trail.
7. Kirim notification ke requester.
8. Request siap diproses oleh stock control/admin.

## 16. Reject

Reject wajib mengisi:

```text
Rejection Reason *
```

Sistem menyimpan reason, approver, tanggal, approval history, audit trail, dan notification ke requester.

## 17. User History

User hanya dapat melihat request miliknya sendiri.

Filter:

```text
Request Number
Date From
Date To
Status
Material
```

Untuk rejected request, alasan rejection harus ditampilkan.

## 18. Admin Request Management

Admin dapat:

- View.
- Search.
- Filter.
- Edit.
- Cancel.
- Download PDF.
- Export Excel.
- View approval history.
- View audit trail.

Filter:

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

## 19. Editing Approved Request

Admin dapat mengubah atau melengkapi isi Material Requisition Form (MRF) milik User yang **sudah di-approve oleh Executive / HoD**.

Field MRF yang dapat diubah/dilengkapi oleh Admin setelah approval:

```text
Plant
G/L Account
PWO No.
Pur Org
Pur Group
Cost Center
```

Perubahan ini tidak mengubah fakta bahwa request telah mendapatkan approval dari Executive / HoD. Sistem harus menyimpan approval history dan audit trail secara terpisah.

Setiap perubahan wajib:

1. Memerlukan alasan perubahan.
2. Mencatat nilai sebelum perubahan.
3. Mencatat nilai sesudah perubahan.
4. Mencatat Admin yang melakukan perubahan.
5. Mencatat timestamp.
6. Mencatat audit trail.

### 19.1 Admin Reject / Cancel After Executive / HoD Approval

Admin memiliki tombol **Reject / Cancel Request** untuk membatalkan request User yang sebelumnya sudah di-approve oleh Executive / HoD, apabila User menyatakan batal mengambil barang.

Contoh alasan:

```text
User batal mengambil barang
Material tidak jadi digunakan
Request dibatalkan oleh User
Other / alasan lainnya
```

Ketentuan:

1. Tombol Reject / Cancel hanya tersedia untuk request yang sudah `APPROVED` dan belum selesai diproses/diambil.
2. Admin wajib mengisi **Cancellation / Rejection Reason**.
3. Status request berubah menjadi `REJECTED` atau `CANCELLED` sesuai konfigurasi status sistem. Untuk pembatalan setelah approval, disarankan menggunakan status `CANCELLED_AFTER_APPROVAL` agar berbeda dengan rejection oleh Executive / HoD.
4. Request yang dibatalkan **tidak boleh mengurangi stock**.
5. Sistem tidak boleh membuat transaksi `STOCK_OUT` untuk request yang dibatalkan sebelum pengambilan barang.
6. Jika `STOCK_OUT` sudah terlanjur dibuat sebelum request dibatalkan, sistem wajib membuat transaksi `REVERSAL` dengan jumlah yang sesuai dan mengembalikan stock secara otomatis.
7. Approval history dari Executive / HoD tetap disimpan dan tidak dihapus.
8. Cancellation/rejection reason, Admin, timestamp, dan perubahan status wajib dicatat pada audit trail.
9. User menerima notifikasi bahwa request dibatalkan beserta alasannya.

### 19.2 Admin Approved Request Processing

Setelah Executive / HoD melakukan approval, Admin/Stock Control dapat:

- Melengkapi field Plant, G/L Account, PWO No., Pur Org, Pur Group, dan Cost Center.
- Melakukan proses pengeluaran barang sesuai MRF.
- Membuat transaksi `STOCK_OUT` hanya ketika barang benar-benar dikeluarkan.
- Membatalkan request menggunakan tombol Reject / Cancel apabila User batal mengambil barang sebelum barang dikeluarkan.

Dengan aturan ini, **approval tidak otomatis mengurangi stock**. Stock hanya berkurang ketika transaksi `STOCK_OUT` benar-benar diproses.

## 20. Stock Transaction

Transaction types:

```text
STOCK_IN
STOCK_OUT
ADJUSTMENT
REVERSAL
```

Stock history:

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

## 21. Dashboard

### Admin

- Total Materials.
- Total Stock.
- Low Stock.
- Out of Stock.
- Pending Requests.
- Approved Requests.
- Rejected Requests.
- Completed Requests.
- Recent activity.

### User

- My Requests.
- Pending.
- Approved.
- Rejected.
- Completed.
- Recent requests.

### Approver

- Pending Approval.
- Approved.
- Rejected.
- Approval inbox.

## 22. Reporting

### Material Request Report

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

### Stock Report

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

### Approval Report

```text
Request Number
Requester
Approver
Submitted Date
Approval Date
Status
Rejection Reason
```

## 23. Export & Download

- Excel.
- CSV.
- PDF.

PDF harus menyerupai format Material Requisition Form existing.

## 24. Notification

Minimum notification:

- New request waiting for approval.
- Request approved.
- Request rejected beserta alasan.

Future notification channel:

- In-app.
- Email.
- WhatsApp/other messaging integration.

## 25. Audit Trail

Fields:

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

Audit log tidak boleh dihapus oleh User atau Approver.

## 26. Database

Minimum tables:

```text
users
roles
departments
plants
material_categories
materials
stock_balances
stock_transactions
material_requests
material_request_items
approval_histories
notifications
audit_logs
```

### users

```text
id
employee_id
username
name
email
password
department_id
plant_id
role_id
approver_id
status
last_login_at
created_at
updated_at
```

### materials

```text
id
material_number
description
category_id
uom
minimum_stock
maximum_stock
storage_location
plant_id
qr_code
status
created_at
updated_at
```

### material_requests

```text
id
request_no
no_doc
request_date
requester_id
department_id
plant_id
gl_account
pwo_no
pur_org
pur_group
cost_center
reason
status
approver_id
approved_at
rejected_at
rejection_reason
created_at
updated

**Keterangan `material_requests`:**
- `request_no` = Nomor Request yang otomatis dibuat oleh sistem.
- `no_doc` = Nomor Document yang diinput manual oleh Admin untuk arsip/referensi.
- Keduanya merupakan field yang berbeda.
_at
```

### material_request_items

```text
id
request_id
material_id
description
qty
uom
soh
balance
note
created_at
updated_at
```

### approval_histories

```text
id
request_id
approver_id
action
reason
action_at
created_at
```

### stock_transactions

```text
id
material_id
transaction_type
reference_type
reference_id
qty_in
qty_out
balance_after
transaction_date
user_id
note
created_at
```

## 27. Security Requirements

- Password hashing.
- HTTPS.
- Role-based access control.
- Server-side authorization.
- Input validation.
- SQL injection protection.
- CSRF protection.
- XSS protection.
- Session timeout.
- Secure password reset.
- Audit logging.
- Database backup.

## 28. Backup

Minimum recommended:

```text
Daily Backup
Weekly Retention
Monthly Retention
```

Mengikuti IT policy perusahaan.

## 29. Non-Functional Requirements

### Performance

- Normal page load target < 3 seconds.
- Search target < 2 seconds pada jaringan normal.
- Export mampu menangani data transaksi besar.

### Availability

Mendukung deployment pada internal company network, local server, atau cloud jika diizinkan policy perusahaan.

### Responsive

Mendukung desktop, laptop, tablet, dan mobile.

## 30. Recommended Technology Stack

### Backend

```text
PHP
Laravel
```

### Frontend

```text
Blade
Bootstrap atau Tailwind CSS
JavaScript
```

### Database

```text
MySQL / MariaDB
```

### Future Authentication

```text
Active Directory / LDAP
SSO
```

## 31. Architecture

```text
WEB BROWSER
     |
     v
FRONTEND
Blade + CSS + JavaScript
     |
     v
LARAVEL BACKEND
     |
     +----------+----------+
     |          |          |
     v          v          v
  MySQL      Storage   Notification
```

## 32. UI/UX Requirements

- Simple.
- Professional.
- Responsive.
- Easy to use.
- Sidebar navigation.
- Status badges.
- Search dan filter.
- Confirmation dialog untuk tindakan penting.
- Validation error yang jelas.

## 33. Admin Navigation

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

## 34. User Navigation

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

## 35. Approver Navigation

```text
Dashboard

APPROVAL
├── Pending Approval
├── Approved
├── Rejected
└── History

PROFILE
```

## 36. Business Rules

### BR-001 — Request Number

Format: `MR-YYYY-NNNNNN`.

### BR-002 — SOH

SOH berasal dari stock balance dan tidak dapat diubah oleh User.

### BR-003 — Balance

`Balance = SOH - Requested Quantity`.

### BR-004 — Required Fields

Request tidak dapat disubmit jika mandatory fields belum lengkap.

### BR-005 — Reject

Reject wajib memiliki reason.

### BR-006 — Approved Request

User tidak dapat mengubah approved request. Admin dapat mengubah/melengkapi field `Plant`, `G/L Account`, `PWO No.`, `Pur Org`, `Pur Group`, dan `Cost Center` dengan audit trail dan alasan perubahan.

Approval oleh Executive / HoD tidak otomatis mengurangi stock. Stock hanya berkurang saat `STOCK_OUT` benar-benar diproses.

### BR-006A — Admin Cancel After Approval

Admin dapat membatalkan request yang sudah di-approve Executive / HoD apabila User batal mengambil barang. Pembatalan wajib memiliki alasan, tercatat pada audit trail, dan tidak boleh mengurangi stock. Jika `STOCK_OUT` sudah tercatat sebelumnya, sistem wajib membuat `REVERSAL` untuk mengembalikan stock.

### BR-007 — Delete Transaction

Transaction request tidak boleh di-hard-delete. Gunakan `CANCELLED`.

### BR-008 — Audit Trail

Semua perubahan transaksi penting wajib tercatat.

### BR-009 — Approval

Hanya approver yang ditentukan sistem yang dapat approve/reject request.

### BR-010 — Authorization

User hanya melihat request miliknya. Approver melihat request dalam scope approval. Admin melihat seluruh request.

## 37. Acceptance Criteria

### Admin

- [ ] Login.
- [ ] Create/edit/disable user.
- [ ] Create/edit/deactivate material.
- [ ] Manage stock.
- [ ] View all requests.
- [ ] Edit/lengkapi field Plant, G/L Account, PWO No., Pur Org, Pur Group, dan Cost Center pada approved request.
- [ ] Audit trail perubahan approved request.
- [ ] Reject/Cancel approved request jika User batal mengambil barang.
- [ ] Reject/Cancel approved request tidak mengurangi stock.
- [ ] Jika stock sudah keluar, cancellation membuat transaksi REVERSAL.
- [ ] Export Excel.
- [ ] Download PDF.
- [ ] View history.
- [ ] View audit trail.

### User

- [ ] Login.
- [ ] Create request.
- [ ] Save draft.
- [ ] Add multiple materials.
- [ ] SOH otomatis tampil.
- [ ] Balance otomatis dihitung.
- [ ] Submit request.
- [ ] View status.
- [ ] View history.
- [ ] View rejection reason.
- [ ] Tidak dapat approve/reject.

### Approver

- [ ] Login.
- [ ] View pending approval.
- [ ] View request detail.
- [ ] Approve.
- [ ] Reject.
- [ ] Reject membutuhkan reason.
- [ ] View approval history.
- [ ] Tidak dapat mengubah master stock/material.

## 38. Development Phases

### Phase 1 — Authentication & User Management

- Login.
- Logout.
- Roles.
- User management.
- Authorization.

### Phase 2 — Master Data

- Material.
- Category.
- Department.
- Plant.

### Phase 3 — Inventory

- Stock.
- Stock In.
- Stock Adjustment.
- Stock History.

### Phase 4 — Material Request

- New request.
- Draft.
- Multiple items.
- Submit.
- Request history.

### Phase 5 — Approval

- Approval inbox.
- Approve.
- Reject.
- Rejection reason.
- Approval history.

### Phase 6 — Reporting

- PDF.
- Excel.
- CSV.
- Filtering.
- Search.

### Phase 7 — Audit & Notification

- Audit trail.
- In-app notification.
- Email notification.

## 39. Future Enhancements

- Active Directory / LDAP.
- SSO.
- SAP integration.
- ERP integration.
- Power BI dashboard.
- QR Code material.
- Barcode scanner.
- Mobile application.
- Email notification.
- WhatsApp notification.
- Multi-level approval.
- Budget checking.
- Automatic reorder point.
- Low-stock notification.
- API integration.
- Digital signature.

## 40. MVP Scope

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

## 41. Recommended AI/Vibe Coding Development Approach

Jangan langsung meminta AI membuat seluruh aplikasi sekaligus. Gunakan tahapan:

```text
PRD
 |
 v
Database ERD
 |
 v
Database Migration
 |
 v
Authentication & Roles
 |
 v
Master Data
 |
 v
Inventory
 |
 v
Material Request
 |
 v
Approval Workflow
 |
 v
History
 |
 v
Report & Export
 |
 v
Audit Trail
 |
 v
Testing
 |
 v
Deployment
```

Setiap phase harus diuji sebelum phase berikutnya.

## 42. Definition of Done

Project dianggap selesai apabila:

1. Semua role dapat login.
2. Hak akses berjalan sesuai requirement.
3. User dapat membuat Material Request.
4. Request dapat disubmit.
5. Approver dapat approve/reject.
6. Rejection reason tersimpan.
7. User dapat melihat status dan history.
8. Admin dapat mengelola material dan stock.
9. Approved request dapat diproses sesuai workflow.
10. Admin dapat mengedit/melengkapi Plant, G/L Account, PWO No., Pur Org, Pur Group, dan Cost Center pada approved request dengan audit trail.
11. Admin dapat Reject/Cancel approved request apabila User batal mengambil barang.
12. Request yang dibatalkan tidak mengurangi stock; jika stock sudah keluar, sistem membuat REVERSAL.
11. Data dapat diexport ke Excel.
12. Request dapat didownload sebagai PDF.
13. Audit trail berjalan.
14. Validation berjalan.
15. Backup database tersedia.
16. Sistem dapat digunakan melalui browser desktop dan mobile.

## 43. Expected Result

```text
DIGITAL MRF
     |
     v
USER LOGIN
     |
     v
CREATE REQUEST
     |
     v
CHECK MATERIAL/STOCK
     |
     v
SUBMIT
     |
     v
APPROVER
     |
 +---+---+
 |       |
 v       v
APPROVE REJECT
 |       |
 v       v
STOCK   END
PROCESS
 |
 v
COMPLETED
 |
 v
HISTORY
```

---

**End of PRD**

## Default Admin Login (Development)

Untuk kebutuhan development/testing awal, gunakan akun Admin berikut:

- **Username:** `admin`
- **Password:** `admin`
- **Role:** `Admin`

> **Security Note:** Akun dan password di atas hanya untuk development/testing. Pada production, password wajib diganti dan disimpan menggunakan password hashing (bcrypt/Argon2). Jangan menyimpan password plaintext di database atau source code.


### Additional Acceptance Criteria — Request & Document Number
- Saat User membuat request, sistem otomatis menghasilkan **Nomor Request** yang unik.
- Admin dapat mengisi **Nomor Document** secara manual untuk kebutuhan arsip.
- Sistem menyimpan Nomor Request dan Nomor Document sebagai dua field terpisah.
- User tidak dapat mengubah Nomor Request maupun Nomor Document.
- Executive / HoD tidak dapat mengubah Nomor Request maupun Nomor Document.
- Admin dapat mengubah Nomor Document dan setiap perubahan tercatat pada Audit Trail.
