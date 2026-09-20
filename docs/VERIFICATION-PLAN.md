# DMRS — Fullstack Verification Plan & Quality Assurance Strategy

**Project Name:** Digital Material Requisition System (DMRS)  
**Company:** PT. Guthrie International Pulau Laut Refinery  
**Document Version:** 1.0  
**Target Quality Standard:** Senior QA + Senior Fullstack Verification Guidelines  

---

## 1. Overview & Verification Objective

This document outlines the systematic verification strategy for the DMRS application. The goal is to ensure end-to-end functionality across all layers:

$$\text{User / Browser} \longrightarrow \text{React UI} \longrightarrow \text{Inertia / Route} \longrightarrow \text{Controller / Policy} \longrightarrow \text{Domain Service} \longrightarrow \text{Database} \longrightarrow \text{Audit / Notification}$$

Zero features will be marked `VERIFIED` based on code inspection alone. Every feature must pass automated unit/feature tests, manual workflow execution, and database state assertions.

---

## 2. Automated Test Execution Plan

### 2.1 Full Test Suite Execution Command
To run the complete automated regression test suite:
```bash
php artisan test
```

### 2.2 Feature-Specific Test Commands

#### Authentication & Authorization Suite
```bash
php artisan test --filter=AuthenticationTest
```
- Tests valid user login & role redirection.
- Tests invalid credential rejection.
- Tests inactive account blocking (`status = INACTIVE`).
- Tests session logout and session revocation.
- Tests password reset link generation and token update.

#### Material Request & Approval Workflow Suite
```bash
php artisan test --filter=MaterialRequestTest
```
- Tests draft request creation with auto-generated request numbers (`MR-YYYY-NNNNNN`).
- Tests submission transition (`DRAFT -> PENDING_APPROVAL`).
- Tests self-approval block enforcement.
- Tests Executive / HoD Approval (`PENDING_APPROVAL -> APPROVED`).
- Tests Executive / HoD Rejection with mandatory reason (`PENDING_APPROVAL -> REJECTED`).
- Tests Admin supplementary edits on approved MRF fields.
- Tests Admin cancellation of approved request.

#### Inventory & Stock Reversal Suite
```bash
php artisan test --filter=StockTest
```
- Tests Stock-In entry and SOH calculation.
- Tests Stock Adjustment entry.
- Tests Stock-Out issue for approved request.
- Tests pessimistic locking concurrency (`lockForUpdate()`).
- Tests automatic `REVERSAL` transaction creation upon cancellation of a request that has already issued stock.

#### Reports & Excel Export Suite
```bash
php artisan test --filter=ApprovalReportTest
```
- Tests material request report filtering.
- Tests approval report statistics computation.
- Tests streamed `.xlsx` spreadsheet generation for requests and approvals.

---

## 3. Critical End-to-End (E2E) Workflow Verification Procedures

### E2E Flow 1: Complete Material Requisition & Issue Lifecycle

1. **User Request Creation:**
   - Log in as `user` (Requester).
   - Navigate to `/requests/create`.
   - Select material items (e.g., `MAT-1001`), enter quantity, verify estimated balance calculation (`Balance = SOH - Requested Quantity`).
   - Click "Save as Draft" -> Verify status is `DRAFT` and `MR-2026-XXXXXX` generated.
   - Click "Submit Requisition" -> Verify status changes to `PENDING_APPROVAL`.

2. **Approver Execution:**
   - Log in as `approver` (Executive / HoD).
   - Navigate to `/approvals/inbox`.
   - Open pending request -> Click "Approve Request".
   - **DB Check:** Assert `material_requests.status = 'APPROVED'`, `approval_histories` entry created, `notifications` entry created.
   - **Critical Rule Check:** Verify `stock_balances.quantity` remains UNCHANGED (Approval does NOT reduce stock).

3. **Admin Stock Processing:**
   - Log in as `admin` (Admin / Stock Control).
   - Navigate to `/requests/{id}`.
   - Click "Edit Approved MRF" -> Fill G/L Account, PWO No, Cost Center, enter reason -> Save.
   - Click "Process Stock Out".
   - **DB Check:** Assert `material_requests.status = 'COMPLETED'`, `stock_balances.quantity` decreased by requested qty, `stock_transactions` entry with type `STOCK_OUT` created, `audit_logs` record created.

---

### E2E Flow 2: Cancellation After Stock Issue (Automatic Reversal Verification)

1. **Setup:** Have an `APPROVED` request that has already executed "Process Stock Out" (`STOCK_OUT` transaction exists).
2. **Action:** Log in as `admin`, open request detail, click "Cancel Request", enter cancellation reason.
3. **Verification Steps:**
   - Assert `material_requests.status = 'CANCELLED_AFTER_APPROVAL'`.
   - Assert original `STOCK_OUT` transaction is PRESERVED in `stock_transactions`.
   - Assert a new `REVERSAL` transaction is inserted into `stock_transactions` with positive `qty_in`.
   - Assert `stock_balances.quantity` is restored to pre-stock-out balance.
   - Assert `audit_logs` record created with old & new states.

---

## 4. Remediation Plan for Partially Implemented & Missing Features

### Step 1: Sidebar Inbox Badge Fix
- **Target File:** `app/Http/Middleware/HandleInertiaRequests.php`
- **Action:** Share `pendingApprovalsCount` in Inertia props for users with role `APPROVER` or `ADMIN`.
- **Verification:** Log in as approver with pending requests, verify badge count appears on "Approval Inbox" link in sidebar.

### Step 2: Notification UI Component Implementation
- **Target Files:** `resources/js/Layouts/AppShell.jsx`, `routes/web.php`, `app/Http/Controllers/NotificationController.php`
- **Action:**
  1. Add topbar notification bell icon with unread count badge.
  2. Create slide-over dropdown showing user notifications with title, message, timestamp, and read status.
  3. Add route `POST /notifications/{notification}/read` to mark as read.
- **Verification:** Submit a request as `user` -> Log in as designated `approver` -> Verify notification bell shows unread count -> Click notification -> Verify notification opens request and marks as read.

### Step 3: Master Data CRUD Implementation (Departments, Plants, Categories)
- **Target Files:**
  - `routes/web.php`
  - `app/Http/Controllers/DepartmentController.php`
  - `app/Http/Controllers/PlantController.php`
  - `app/Http/Controllers/MaterialCategoryController.php`
  - `resources/js/Pages/Admin/Departments.jsx`
  - `resources/js/Pages/Admin/Plants.jsx`
  - `resources/js/Pages/Admin/Categories.jsx`
- **Action:** Implement index, store, update, and toggle status actions for Departments, Plants, and Material Categories.
- **Verification:** Admin can create, edit, and activate/deactivate departments, plants, and categories. Audit log records all mutations.

---

## 5. Final Acceptance Verification Checklist

- [ ] All automated tests pass (`php artisan test`).
- [ ] No syntax or linting errors (`vendor/bin/pint --dirty --format agent`).
- [ ] Role authorization verified for ADMIN, APPROVER, and USER roles.
- [ ] Self-approval restriction verified.
- [ ] Approval does NOT reduce stock rule verified.
- [ ] Stock Out creates transactional `STOCK_OUT` with `lockForUpdate` verified.
- [ ] Post-approval cancellation with stock reversal verified.
- [ ] Mandatory rejection & cancellation reasons enforced.
- [ ] Official DomPDF MRF printout verified.
- [ ] Excel reports generated without corruption.
- [ ] Responsive UI verified on Desktop, Tablet, and Mobile.

---
*End of Verification Plan Document*
