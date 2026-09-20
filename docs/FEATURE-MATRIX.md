# DMRS — Comprehensive Feature Verification Matrix

**Project Name:** Digital Material Requisition System (DMRS)  
**Company:** PT. Guthrie International Pulau Laut Refinery  
**Source of Truth:** PRD DMRS v1.5, Database Architecture v1.0, Design System v2.0  
**Classification Types:** `VERIFIED`, `PARTIALLY_IMPLEMENTED`, `BROKEN`, `MISSING`, `BLOCKED`  

---

## 1. Feature Matrix Breakdown

| Feature Group | Specific Feature | Role Scope | UI | Route | Backend | Validation | Authorization | Database | Business Logic | Audit | Notification | Test | E2E Verification | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **AUTH** | User Login | ALL | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | N/A | ✓ | PASS | `VERIFIED` |
| **AUTH** | User Logout | ALL | ✓ | ✓ | ✓ | N/A | ✓ | ✓ | ✓ | ✓ | N/A | ✓ | PASS | `VERIFIED` |
| **AUTH** | Password Reset Request | ALL | ✓ | ✓ | ✓ | ✓ | N/A | ✓ | ✓ | N/A | N/A | ✓ | PASS | `VERIFIED` |
| **AUTH** | Password Reset Update | ALL | ✓ | ✓ | ✓ | ✓ | N/A | ✓ | ✓ | N/A | N/A | ✓ | PASS | `VERIFIED` |
| **AUTH** | Inactive Account Block | ALL | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | N/A | ✓ | PASS | `VERIFIED` |
| **AUTH** | Session Timeout / Expired View | ALL | ✓ | ✓ | ✓ | N/A | N/A | ✓ | ✓ | N/A | N/A | ✓ | PASS | `VERIFIED` |
| **AUTH** | Role-Based Dashboard Dispatcher | ALL | ✓ | ✓ | ✓ | N/A | ✓ | ✓ | ✓ | N/A | N/A | ✓ | PASS | `VERIFIED` |
| **USER MGMT** | List System Users | ADMIN | ✓ | ✓ | ✓ | N/A | ✓ | ✓ | ✓ | N/A | N/A | ✓ | PASS | `VERIFIED` |
| **USER MGMT** | Create New User | ADMIN | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | N/A | ✓ | PASS | `VERIFIED` |
| **USER MGMT** | Edit User Details / Role / Status | ADMIN | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | N/A | ✓ | PASS | `VERIFIED` |
| **USER MGMT** | User Profile Page / Edit Profile | ALL | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | N/A | ✓ | PASS | `VERIFIED` |
| **MASTER DATA**| List Materials | ADMIN, USER, APPROVER | ✓ | ✓ | ✓ | N/A | ✓ | ✓ | ✓ | N/A | N/A | ✓ | PASS | `VERIFIED` |
| **MASTER DATA**| Add Material Item | ADMIN | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | N/A | ✓ | PASS | `VERIFIED` |
| **MASTER DATA**| Edit Material Item | ADMIN | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | N/A | ✓ | PASS | `VERIFIED` |
| **MASTER DATA**| Deactivate Material (Soft Status) | ADMIN | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | N/A | ✓ | PASS | `VERIFIED` |
| **MASTER DATA**| Manage Departments (CRUD) | ADMIN | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | N/A | ✓ | PASS | `VERIFIED` |
| **MASTER DATA**| Manage Plants (CRUD) | ADMIN | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | N/A | ✓ | PASS | `VERIFIED` |
| **MASTER DATA**| Manage Material Categories (CRUD)| ADMIN | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | N/A | ✓ | PASS | `VERIFIED` |
| **INVENTORY** | Stock Overview & Low/Out Badges | ALL | ✓ | ✓ | ✓ | N/A | ✓ | ✓ | ✓ | N/A | N/A | ✓ | PASS | `VERIFIED` |
| **INVENTORY** | Stock History & Filter Logs | ALL | ✓ | ✓ | ✓ | N/A | ✓ | ✓ | ✓ | N/A | N/A | ✓ | PASS | `VERIFIED` |
| **INVENTORY** | Stock In Entry | ADMIN | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | N/A | ✓ | PASS | `VERIFIED` |
| **INVENTORY** | Stock Adjustment | ADMIN | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | N/A | ✓ | PASS | `VERIFIED` |
| **INVENTORY** | Stock Out / Issue Material | ADMIN | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | N/A | ✓ | PASS | `VERIFIED` |
| **INVENTORY** | Pessimistic Lock Concurrency (`lockForUpdate`) | SYSTEM | N/A | N/A | ✓ | N/A | N/A | ✓ | ✓ | ✓ | N/A | ✓ | PASS | `VERIFIED` |
| **REQUISITION**| Create Draft Material Request | USER, ADMIN | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | N/A | ✓ | PASS | `VERIFIED` |
| **REQUISITION**| Multi-Item Table & SOH Balance Calc | USER, ADMIN | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | N/A | N/A | ✓ | PASS | `VERIFIED` |
| **REQUISITION**| Edit Draft Request | USER, ADMIN | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | N/A | ✓ | PASS | `VERIFIED` |
| **REQUISITION**| Submit Request for Approval | USER, ADMIN | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PASS | `VERIFIED` |
| **REQUISITION**| View Own Request History | USER | ✓ | ✓ | ✓ | N/A | ✓ | ✓ | ✓ | N/A | N/A | ✓ | PASS | `VERIFIED` |
| **REQUISITION**| View All Requests | ADMIN | ✓ | ✓ | ✓ | N/A | ✓ | ✓ | ✓ | N/A | N/A | ✓ | PASS | `VERIFIED` |
| **APPROVAL** | Approval Inbox | APPROVER, ADMIN | ✓ | ✓ | ✓ | N/A | ✓ | ✓ | ✓ | N/A | N/A | ✓ | PASS | `VERIFIED` |
| **APPROVAL** | Approve Request (No Auto Stock Reduction)| APPROVER, ADMIN | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PASS | `VERIFIED` |
| **APPROVAL** | Reject Request (Mandatory Reason) | APPROVER, ADMIN | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PASS | `VERIFIED` |
| **APPROVAL** | Block Self-Approval | USER, APPROVER | ✓ | ✓ | ✓ | ✓ | ✓ | N/A | ✓ | ✓ | N/A | ✓ | PASS | `VERIFIED` |
| **APPROVED MRF**| Admin Edit Allowed Fields (Plant, GL, PWO, etc.)| ADMIN | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | N/A | ✓ | PASS | `VERIFIED` |
| **APPROVED MRF**| Admin Cancel Approved Request | ADMIN | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PASS | `VERIFIED` |
| **APPROVED MRF**| Auto Stock Reversal on Cancel after Stock Out | ADMIN | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PASS | `VERIFIED` |
| **REPORTING** | Material Request Report & Filter | ALL | ✓ | ✓ | ✓ | N/A | ✓ | ✓ | ✓ | N/A | N/A | ✓ | PASS | `VERIFIED` |
| **REPORTING** | Stock Report | ADMIN | ✓ | ✓ | ✓ | N/A | ✓ | ✓ | ✓ | N/A | N/A | ✓ | PASS | `VERIFIED` |
| **REPORTING** | Approval Report & Summary Stats | APPROVER, ADMIN | ✓ | ✓ | ✓ | N/A | ✓ | ✓ | ✓ | N/A | N/A | ✓ | PASS | `VERIFIED` |
| **EXPORT** | Export Requests to Excel (.xlsx) | ALL | ✓ | ✓ | ✓ | N/A | ✓ | N/A | ✓ | N/A | N/A | ✓ | PASS | `VERIFIED` |
| **EXPORT** | Export Approvals to Excel (.xlsx) | APPROVER, ADMIN | ✓ | ✓ | ✓ | N/A | ✓ | N/A | ✓ | N/A | N/A | ✓ | PASS | `VERIFIED` |
| **EXPORT** | Official MRF PDF Download | ALL | ✓ | ✓ | ✓ | N/A | ✓ | N/A | ✓ | N/A | N/A | ✓ | PASS | `VERIFIED` |
| **AUDIT** | Audit Trail Log Viewer | ADMIN | ✓ | ✓ | ✓ | N/A | ✓ | ✓ | ✓ | N/A | N/A | ✓ | PASS | `VERIFIED` |
| **AUDIT** | Immutable Audit Trail Capture | SYSTEM | N/A | N/A | ✓ | N/A | N/A | ✓ | ✓ | N/A | N/A | ✓ | PASS | `VERIFIED` |
| **NOTIFICATIONS**| Generate DB Notification Records | SYSTEM | N/A | N/A | ✓ | N/A | N/A | ✓ | ✓ | N/A | ✓ | ✓ | PASS | `VERIFIED` |
| **NOTIFICATIONS**| Topbar Notification Bell / Dropdown UI | ALL | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | N/A | ✓ | ✓ | PASS | `VERIFIED` |
| **NAVIGATION**| Sidebar Pending Approvals Badge Count | APPROVER, ADMIN | ✓ | ✓ | ✓ | N/A | ✓ | N/A | ✓ | N/A | N/A | ✓ | PASS | `VERIFIED` |

---

## 2. Summary Status Counts

- **Total Features Audited:** 48
- **VERIFIED:** 48
- **PARTIALLY_IMPLEMENTED:** 0
- **BROKEN:** 0
- **MISSING:** 0
- **BLOCKED:** 0

---
*End of Feature Verification Matrix*
