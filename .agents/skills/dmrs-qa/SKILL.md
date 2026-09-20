# DMRS — SENIOR FULLSTACK IMPLEMENTATION + VERIFICATION MODE

Act as a team consisting of:

1. Senior Frontend Engineer
2. Senior Backend Engineer
3. Senior Laravel Engineer
4. Senior Database Engineer
5. Senior QA Engineer
6. Senior Security Engineer
7. Senior UI/UX Engineer
8. Fullstack Integration Engineer

You must use the installed project skills before implementation.

## PRIMARY OBJECTIVE

Make the DMRS application fully functional end-to-end.

Do not focus only on creating UI.

Every feature must work from:

Browser
→ Frontend
→ Backend
→ Database
→ Backend response
→ Frontend state
→ User feedback

## SOURCE OF TRUTH

Before implementation, read and follow:

1. PRD DMRS v1.5
2. Database Architecture
3. DMRS Design System
4. Existing source code
5. Existing routes
6. Existing migrations
7. Existing tests

Do not invent business rules when the source documents already define them.

## IMPORTANT

Do NOT rewrite the entire project unnecessarily.

First audit the existing implementation.

Identify:

* completed features
* partially implemented features
* broken features
* fake/mock features
* dead routes
* dead buttons
* incomplete forms
* missing backend handlers
* authorization gaps
* validation gaps
* database inconsistencies
* UI inconsistencies
* missing tests

Then create an implementation plan.

## PHASE 0 — PROJECT AUDIT

Inspect:

```text
routes/
app/
resources/
database/
tests/
config/
public/
```

Also inspect:

* package.json
* composer.json
* environment configuration
* database connection
* build scripts
* test configuration

Create:

```text
docs/IMPLEMENTATION-AUDIT.md
docs/FEATURE-MATRIX.md
docs/VERIFICATION-REPORT.md
```

Do not modify business behavior during the audit unless required to safely inspect the application.

## PHASE 1 — ARCHITECTURE VALIDATION

Verify:

Frontend:

* Blade
* Tailwind/CSS
* JavaScript
* components
* layouts

Backend:

* Laravel
* routes
* controllers
* services
* form requests
* policies
* middleware
* models

Database:

* PostgreSQL target from Database Architecture
* migrations
* foreign keys
* constraints
* indexes
* transactions

If PRD and Database Architecture conflict, STOP and clearly document the conflict.

Do not silently switch database technology.

## PHASE 2 — FEATURE INVENTORY

Build a complete feature matrix.

Minimum feature groups:

### AUTHENTICATION

* login
* logout
* role redirect
* session
* password reset
* timeout

### USER MANAGEMENT

* create
* edit
* disable
* reset password
* role
* department
* plant
* approver

### MASTER DATA

* users
* departments
* plants
* materials
* categories

### INVENTORY

* stock overview
* stock in
* stock adjustment
* stock out
* stock history

### MATERIAL REQUEST

* create
* draft
* edit draft
* multiple materials
* SOH
* balance
* submit
* history

### APPROVAL

* inbox
* detail
* approve
* reject
* rejection reason
* approval history

### APPROVED REQUEST

* admin editing
* change reason
* old/new values
* audit

### CANCELLATION

* cancel approved request
* cancellation reason
* no stock reduction
* reversal after stock-out

### REPORTING

* request report
* stock report
* approval report
* filters
* search
* pagination
* Excel
* CSV
* PDF

### NOTIFICATION

* pending approval
* approved
* rejected
* cancellation where required

### AUDIT

* audit trail
* old value
* new value
* actor
* timestamp
* module
* record

## PHASE 3 — IMPLEMENTATION

Implement missing or broken features incrementally.

Recommended order:

```text
Authentication
↓
Authorization
↓
Master Data
↓
Inventory
↓
Material Request
↓
Approval
↓
Approved Request Processing
↓
Cancellation/Reversal
↓
History
↓
Reporting
↓
Notification
↓
Audit
↓
Responsive UI
↓
Testing
```

After every phase:

1. run tests
2. run application
3. manually verify workflow
4. fix discovered issues
5. update FEATURE-MATRIX.md

Do not continue while critical failures remain unresolved.

## PHASE 4 — FRONTEND QUALITY

For every page verify:

* responsive
* accessible
* consistent Design System
* loading state
* empty state
* error state
* disabled state
* success state
* permission-aware UI
* no dead buttons
* no dead links
* no fake data

Use reusable components.

## PHASE 5 — BACKEND QUALITY

For every mutation verify:

* authentication
* authorization
* validation
* business rule
* database transaction
* audit
* notification where required
* error handling

Never rely on frontend checks for security.

## PHASE 6 — CRITICAL BUSINESS WORKFLOW TEST

### USER FLOW

Perform:

```text
Login as USER
↓
Create Request
↓
Select Material
↓
Enter Quantity
↓
Verify SOH
↓
Verify Balance
↓
Save Draft
↓
Edit Draft
↓
Submit
↓
Verify PENDING_APPROVAL
```

### APPROVER FLOW

```text
Login as APPROVER
↓
Open Approval Inbox
↓
Open Request
↓
Review Items
↓
Approve
↓
Verify APPROVED
↓
Verify Approval History
↓
Verify Audit Log
↓
Verify Notification
```

Then separately test:

```text
Reject
↓
Reason required
↓
REJECTED
↓
Reason stored
↓
History
↓
Audit
↓
Notification
```

### ADMIN APPROVED REQUEST FLOW

```text
Login as ADMIN
↓
Open APPROVED Request
↓
Edit allowed field
↓
Enter Change Reason
↓
Save
↓
Verify old value
↓
Verify new value
↓
Verify Audit
```

### STOCK OUT FLOW

```text
Approved Request
↓
Process STOCK_OUT
↓
Verify stock decreases
↓
Verify STOCK_OUT transaction
↓
Verify balance_after
↓
Verify audit
```

### CANCELLATION BEFORE STOCK OUT

```text
Approved Request
↓
Admin Cancel
↓
Reason required
↓
Verify CANCELLED_AFTER_APPROVAL / configured cancellation state
↓
Verify stock unchanged
↓
Verify NO STOCK_OUT
↓
Verify audit
↓
Verify notification
```

### CANCELLATION AFTER STOCK OUT

```text
Approved Request
↓
STOCK_OUT
↓
Admin Cancel
↓
Reason
↓
REVERSAL
↓
Stock restored
↓
Original STOCK_OUT preserved
↓
Audit
```

## PHASE 7 — SECURITY TEST

Test:

* unauthorized page access
* unauthorized API/action
* user accessing another user's request
* approver approving outside scope
* user attempting approval
* user attempting admin operation
* mass assignment
* invalid IDs
* invalid status transitions
* CSRF
* validation bypass
* XSS payloads
* SQL injection-safe queries
* session expiration

## PHASE 8 — ROUTE VERIFICATION

Inspect every application route.

For each route verify:

```text
Route exists
↓
Correct middleware
↓
Correct role
↓
Correct controller
↓
Correct view
↓
Correct data
↓
Correct action
```

Pay special attention to report routes, approval routes, dashboard routes and navigation links.

No navigation item may point to a missing route.

## PHASE 9 — BROWSER VERIFICATION

Use actual browser interaction whenever available.

Test:

* login
* navigation
* forms
* dropdown
* search
* filters
* pagination
* modals
* approval
* rejection
* cancellation
* stock processing
* exports
* PDF download
* notifications

Do not consider source inspection sufficient.

## PHASE 10 — ERROR AUDIT

Check:

* Laravel logs
* browser console
* network requests
* HTTP status codes
* database errors
* failed JavaScript
* missing assets
* missing routes

Investigate every unexpected error.

## PHASE 11 — TEST SUITE

Run appropriate:

```text
PHP/Laravel tests
Feature tests
Unit tests
Database tests
Authorization tests
Frontend tests
Integration tests
E2E/browser tests
```

Fix failures instead of bypassing them.

Never weaken tests merely to make them pass.

## PHASE 12 — FINAL ACCEPTANCE

Do not declare "DONE" until:

[ ] all PRD MVP features are implemented
[ ] all critical acceptance criteria pass
[ ] all roles tested
[ ] authorization verified
[ ] validation verified
[ ] database state verified
[ ] stock transaction integrity verified
[ ] cancellation/reversal verified
[ ] audit trail verified
[ ] notifications verified
[ ] PDF verified
[ ] Excel/CSV verified
[ ] responsive UI verified
[ ] accessibility reviewed
[ ] route audit passed
[ ] no critical console errors
[ ] no critical server errors
[ ] tests pass
[ ] feature matrix updated

## FINAL REPORT

Return:

### 1. IMPLEMENTED

What was implemented.

### 2. VERIFIED

What was actually tested successfully.

### 3. FIXED

Bugs found and fixed.

### 4. FAILED

Tests/features that still fail.

### 5. BLOCKED

Things that cannot be verified and the exact reason.

### 6. REMAINING

Remaining work.

### 7. TEST EVIDENCE

Commands, test cases, routes, workflows and database checks performed.

### 8. FEATURE MATRIX

Show:

```text
Feature | Role | Status | Evidence
```

Allowed status:

VERIFIED
FAILED
BLOCKED
IN_PROGRESS

Never mark a feature VERIFIED without actual evidence.

## FINAL RULE

Do not optimize for "code generated".

Optimize for:

"the user can actually use the feature successfully from the browser."
