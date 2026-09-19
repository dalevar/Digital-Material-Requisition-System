# DMRS --- Database Architecture & ERD Blueprint

**Project:** Digital Material Requisition System (DMRS)\
**Company:** PT. Guthrie International Pulau Laut Refinery\
**Database Target:** PostgreSQL\
**ORM:** Prisma\
**Backend:** Laravel / PHP\
**Source of truth:** PRD DMRS v1.5

> **Important technology decision:** The PRD currently recommends
> MySQL/MariaDB, while the database architecture specification
> explicitly requires PostgreSQL. This blueprint follows the requested
> PostgreSQL target. This is marked `[NEEDS CONFIRMATION]` before
> implementation.

------------------------------------------------------------------------

# 01. Database Requirement Analysis

## 1.1 Product Scope

DMRS digitizes the Material Requisition Form process:

``` text
Authentication
    ↓
Master Data
    ↓
Inventory
    ↓
Material Request
    ↓
Approval
    ↓
Stock Processing
    ↓
History / Reporting
    ↓
Audit Trail / Notification
```

The PRD identifies three primary roles:

-   `ADMIN`
-   `USER / REQUESTER`
-   `EXECUTIVE / HOD / APPROVER`

The PRD explicitly lists these minimum tables:

``` text
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

The design preserves these as the core model. The PRD also requires
session management and password reset, so dedicated support tables are
added and marked as `[ASSUMPTION]`.

## 1.2 Data Created by Users

### User / Requester

-   Draft material requests
-   Request header data
-   Request items
-   Request reason
-   Submission action

### Approver

-   Approval action
-   Rejection action
-   Rejection reason
-   Approval timestamp

### Admin

-   User/master-data changes
-   Stock transactions
-   Approved-request field changes
-   Cancellation
-   Document number changes
-   Stock processing

## 1.3 Data Created by System

-   Request number
-   Request status transitions
-   Approval records
-   Notifications
-   Audit logs
-   Current stock balances
-   Stock transaction balances

## 1.4 External Data

The current MVP does not require external data integration. Future
integrations named by the PRD include:

``` text
Active Directory / LDAP
SSO
SAP
ERP
Power BI
Email / WhatsApp / other messaging
External API
```

These are not modeled as MVP entities.

## 1.5 AI / ML Data

The current PRD has no AI/ML functionality. Therefore no AI/ML tables
are added.

``` text
datasets
features
models
training_runs
predictions
inference_logs
```

are future-only and require a future PRD requirement.

## 1.6 Historical Data

Separate historical structures are required for:

-   approval history
-   stock transactions
-   audit trail
-   request lifecycle
-   approved-request changes

------------------------------------------------------------------------

# 02. Domain Identification

``` text
DMRS
│
├── Identity & Access
│   ├── Roles
│   ├── Users
│   ├── Sessions
│   └── Password Reset
│
├── Organization Master
│   ├── Departments
│   └── Plants
│
├── Material Master
│   ├── Material Categories
│   └── Materials
│
├── Inventory
│   ├── Stock Balances
│   └── Stock Transactions
│
├── Material Requisition
│   ├── Material Requests
│   └── Material Request Items
│
├── Approval
│   └── Approval Histories
│
├── Notification
│   └── Notifications
│
└── Governance
    └── Audit Logs
```

  ------------------------------------------------------------------------
  Domain                  Entities                 Scope
  ----------------------- ------------------------ -----------------------
  Identity & Access       roles, users,            MVP
                          user_sessions,           
                          password_reset_tokens    

  Organization            departments, plants      MVP

  Material Master         material_categories,     MVP
                          materials                

  Inventory               stock_balances,          MVP
                          stock_transactions       

  Request                 material_requests,       MVP
                          material_request_items   

  Approval                approval_histories       MVP

  Notification            notifications            MVP

  Governance              audit_logs               MVP

  AI/ML                   None                     Future

  External Integration    None                     Future
  ------------------------------------------------------------------------

------------------------------------------------------------------------

# 03. Entity List

  -----------------------------------------------------------------------------
  Entity                   Purpose                      Source
  ------------------------ ---------------------------- -----------------------
  roles                    Define Admin/User/Approver   PRD
                           role                         

  users                    Store application users      PRD

  user_sessions            Session management and       PRD authentication
                           timeout                      requirement

  password_reset_tokens    Secure password reset        PRD authentication
                                                        requirement

  departments              Organization master          PRD

  plants                   Plant master                 PRD

  material_categories      Material category master     PRD

  materials                Material master              PRD

  stock_balances           Current SOH                  PRD

  stock_transactions       Stock                        PRD
                           In/Out/Adjustment/Reversal   
                           history                      

  material_requests        Request header/lifecycle     PRD

  material_request_items   Request line items           PRD

  approval_histories       Immutable approval/rejection PRD
                           history                      

  notifications            In-app notifications         PRD

  audit_logs               Audit trail                  PRD
  -----------------------------------------------------------------------------

## Deliberately Excluded

These are not added to MVP because the PRD does not require them as
independent entities:

``` text
permissions
role_permissions
suppliers
storage_locations
approval_steps
approval_configs
notification_templates
notification_preferences
external_data_sources
datasets
models
predictions
```

------------------------------------------------------------------------

# 04. Database Architecture

## 4.1 Logical Architecture

``` text
┌─────────────────────────────────────────────────────┐
│                    DMRS Application                 │
│               Laravel + Blade + JS                  │
└─────────────────────────┬───────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│                    PostgreSQL                       │
│                                                     │
│  Identity      Master Data       Transactional      │
│  ─────────     ───────────       ─────────────      │
│  users         departments       material_requests  │
│  roles         plants             request_items    │
│  sessions      categories        approvals          │
│  reset tokens  materials         stock_transactions │
│                                  stock_balances      │
│                                                     │
│  Governance / Notification                          │
│  ─────────────────────────                          │
│  audit_logs                                           │
│  notifications                                        │
└─────────────────────────────────────────────────────┘
```

## 4.2 Data Ownership

``` text
User
 ├── owns → Material Requests
 └── receives → Notifications

Department
 └── scopes → Users / Requests

Plant
 └── scopes → Users / Materials / Requests

Material Category
 └── classifies → Materials

Material
 ├── has → Stock Balance
 ├── has → Stock Transactions
 └── appears in → Request Items

Material Request
 ├── belongs to → Requester
 ├── contains → Request Items
 ├── has → Approval History
 ├── generates → Notifications
 └── generates → Audit Logs

Stock Transaction
 └── changes → Stock Balance
```

------------------------------------------------------------------------

# 05. High-Level ERD

``` mermaid
erDiagram

    ROLES ||--o{ USERS : assigns
    DEPARTMENTS ||--o{ USERS : contains
    PLANTS ||--o{ USERS : assigns

    USERS ||--o{ USER_SESSIONS : creates
    USERS ||--o{ PASSWORD_RESET_TOKENS : requests
    USERS ||--o{ USERS : approves_for

    MATERIAL_CATEGORIES ||--o{ MATERIALS : classifies
    PLANTS ||--o{ MATERIALS : scopes
    MATERIALS ||--o| STOCK_BALANCES : has
    MATERIALS ||--o{ STOCK_TRANSACTIONS : records

    USERS ||--o{ MATERIAL_REQUESTS : creates
    DEPARTMENTS ||--o{ MATERIAL_REQUESTS : belongs_to
    PLANTS ||--o{ MATERIAL_REQUESTS : scopes

    MATERIAL_REQUESTS ||--|{ MATERIAL_REQUEST_ITEMS : contains
    MATERIALS ||--o{ MATERIAL_REQUEST_ITEMS : requested_as

    USERS ||--o{ APPROVAL_HISTORIES : performs
    MATERIAL_REQUESTS ||--o{ APPROVAL_HISTORIES : has

    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ AUDIT_LOGS : performs
```

------------------------------------------------------------------------

# 06. Core ERD

## 6.1 Identity & Organization

``` mermaid
erDiagram

    ROLES {
        uuid id PK
        varchar name UK
        varchar description
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    DEPARTMENTS {
        uuid id PK
        varchar code UK
        varchar name UK
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    PLANTS {
        uuid id PK
        varchar code UK
        varchar name UK
        varchar location
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    USERS {
        uuid id PK
        varchar employee_id UK
        varchar username UK
        varchar name
        varchar email UK
        varchar password_hash
        uuid department_id FK
        uuid plant_id FK
        uuid role_id FK
        uuid approver_id FK
        varchar position
        varchar status
        timestamp last_login_at
        timestamp created_at
        timestamp updated_at
    }

    USER_SESSIONS {
        uuid id PK
        uuid user_id FK
        varchar session_token_hash UK
        timestamp expires_at
        timestamp last_activity_at
        timestamp revoked_at
        timestamp created_at
    }

    PASSWORD_RESET_TOKENS {
        uuid id PK
        uuid user_id FK
        varchar token_hash UK
        timestamp expires_at
        timestamp used_at
        timestamp created_at
    }

    ROLES ||--o{ USERS : assigns
    DEPARTMENTS ||--o{ USERS : contains
    PLANTS ||--o{ USERS : assigns
    USERS ||--o{ USERS : "approves for"
    USERS ||--o{ USER_SESSIONS : creates
    USERS ||--o{ PASSWORD_RESET_TOKENS : requests
```

## 6.2 Material & Inventory

``` mermaid
erDiagram

    MATERIAL_CATEGORIES {
        uuid id PK
        varchar code UK
        varchar name UK
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    PLANTS {
        uuid id PK
        varchar code UK
        varchar name UK
        varchar location
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    MATERIALS {
        uuid id PK
        varchar material_number UK
        varchar description
        uuid category_id FK
        varchar uom
        numeric minimum_stock
        numeric maximum_stock
        varchar storage_location
        uuid plant_id FK
        varchar qr_code
        varchar status
        timestamp created_at
        timestamp updated_at
    }

    STOCK_BALANCES {
        uuid id PK
        uuid material_id FK
        numeric quantity
        timestamp updated_at
    }

    STOCK_TRANSACTIONS {
        uuid id PK
        uuid material_id FK
        varchar transaction_type
        uuid material_request_id FK
        uuid request_item_id FK
        varchar reference_no
        numeric qty_in
        numeric qty_out
        numeric balance_after
        varchar supplier
        varchar storage_location
        varchar reason
        timestamp transaction_date
        uuid user_id FK
        text note
        timestamp created_at
    }

    MATERIAL_CATEGORIES ||--o{ MATERIALS : classifies
    PLANTS ||--o{ MATERIALS : scopes
    MATERIALS ||--o| STOCK_BALANCES : has
    MATERIALS ||--o{ STOCK_TRANSACTIONS : records
```

## 6.3 Material Request & Approval

``` mermaid
erDiagram

    USERS {
        uuid id PK
        varchar employee_id UK
        varchar name
        uuid department_id FK
        uuid plant_id FK
        uuid role_id FK
    }

    DEPARTMENTS {
        uuid id PK
        varchar code UK
        varchar name UK
    }

    PLANTS {
        uuid id PK
        varchar code UK
        varchar name UK
    }

    MATERIAL_REQUESTS {
        uuid id PK
        varchar request_no UK
        varchar no_doc
        date request_date
        uuid requester_id FK
        uuid department_id FK
        uuid plant_id FK
        varchar gl_account
        varchar pwo_no
        varchar pur_org
        varchar pur_group
        varchar cost_center
        text reason
        varchar status
        uuid approver_id FK
        timestamp approved_at
        timestamp rejected_at
        text rejection_reason
        timestamp created_at
        timestamp updated_at
    }

    MATERIAL_REQUEST_ITEMS {
        uuid id PK
        uuid request_id FK
        uuid material_id FK
        varchar description
        numeric qty
        varchar uom
        numeric soh
        numeric balance
        text note
        timestamp created_at
        timestamp updated_at
    }

    MATERIALS {
        uuid id PK
        varchar material_number UK
        varchar description
        varchar uom
    }

    APPROVAL_HISTORIES {
        uuid id PK
        uuid request_id FK
        uuid approver_id FK
        varchar action
        text reason
        timestamp action_at
        timestamp created_at
    }

    USERS ||--o{ MATERIAL_REQUESTS : creates
    USERS ||--o{ MATERIAL_REQUESTS : approves
    DEPARTMENTS ||--o{ MATERIAL_REQUESTS : scopes
    PLANTS ||--o{ MATERIAL_REQUESTS : scopes
    MATERIAL_REQUESTS ||--|{ MATERIAL_REQUEST_ITEMS : contains
    MATERIALS ||--o{ MATERIAL_REQUEST_ITEMS : requested
    MATERIAL_REQUESTS ||--o{ APPROVAL_HISTORIES : has
    USERS ||--o{ APPROVAL_HISTORIES : performs
```

------------------------------------------------------------------------

# 07. AI/ML ERD

No AI/ML ERD is created for MVP because the current PRD does not define
AI/ML functionality.

``` text
[NEEDS CONFIRMATION / FUTURE]
```

A future AI/ML module should be designed as a separate bounded domain if
the PRD adds it.

------------------------------------------------------------------------

# 08. Supporting ERD

``` mermaid
erDiagram

    USERS {
        uuid id PK
        varchar name
        varchar role
    }

    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        varchar type
        varchar title
        text message
        boolean is_read
        timestamp read_at
        jsonb metadata
        timestamp created_at
    }

    AUDIT_LOGS {
        uuid id PK
        uuid user_id FK
        varchar role
        varchar action
        varchar module
        varchar record_type
        uuid record_id
        jsonb old_value
        jsonb new_value
        inet ip_address
        text user_agent
        text description
        timestamp created_at
    }

    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ AUDIT_LOGS : performs
```

------------------------------------------------------------------------

# 09. Relationship Explanation

## Users → Roles

``` text
ROLES 1 ─── N USERS
```

One role can be assigned to many users.

## Users → Users / Approver

``` text
USERS 1 ─── N USERS
```

`users.approver_id` references `users.id`.

This supports the PRD requirement to assign an approver.

## Departments → Users

``` text
DEPARTMENTS 1 ─── N USERS
```

## Plants → Users

``` text
PLANTS 1 ─── N USERS
```

## Material Category → Materials

``` text
MATERIAL_CATEGORIES 1 ─── N MATERIALS
```

## Plant → Materials

``` text
PLANTS 1 ─── N MATERIALS
```

## Material → Stock Balance

``` text
MATERIALS 1 ─── 0..1 STOCK_BALANCES
```

`[ASSUMPTION]`: MVP has one current stock balance per material because
the PRD does not define multiple stock balances by location.

## Material → Stock Transactions

``` text
MATERIALS 1 ─── N STOCK_TRANSACTIONS
```

## User → Material Requests

``` text
USERS 1 ─── N MATERIAL_REQUESTS
```

## Material Request → Items

``` text
MATERIAL_REQUESTS 1 ─── N MATERIAL_REQUEST_ITEMS
```

## Material → Request Items

``` text
MATERIALS 1 ─── N MATERIAL_REQUEST_ITEMS
```

## Request → Approval History

``` text
MATERIAL_REQUESTS 1 ─── N APPROVAL_HISTORIES
```

Approval history remains even when a request is rejected or cancelled.

## User → Approval History

``` text
USERS 1 ─── N APPROVAL_HISTORIES
```

## User → Notifications

``` text
USERS 1 ─── N NOTIFICATIONS
```

## User → Audit Logs

``` text
USERS 1 ─── N AUDIT_LOGS
```

------------------------------------------------------------------------

# 10. Data Dictionary

## `roles`

  Column        Type             Nullable Key   Default             Description
  ------------- -------------- ---------- ----- ------------------- -------------------------
  id            UUID                   NO PK    gen_random_uuid()   Role identifier
  name          VARCHAR(50)            NO UK    \-                  ADMIN / USER / APPROVER
  description   VARCHAR(255)          YES \-    NULL                Role description
  is_active     BOOLEAN                NO \-    TRUE                Role availability
  created_at    TIMESTAMPTZ            NO \-    NOW()               Creation timestamp
  updated_at    TIMESTAMPTZ            NO \-    NOW()               Last update

## `departments`

  Column       Type             Nullable Key   Default             Description
  ------------ -------------- ---------- ----- ------------------- -----------------------
  id           UUID                   NO PK    gen_random_uuid()   Department identifier
  code         VARCHAR(50)            NO UK    \-                  Department code
  name         VARCHAR(150)           NO UK    \-                  Department name
  is_active    BOOLEAN                NO \-    TRUE                Active/inactive
  created_at   TIMESTAMPTZ            NO \-    NOW()               Creation
  updated_at   TIMESTAMPTZ            NO \-    NOW()               Update

## `plants`

  Column       Type             Nullable Key   Default             Description
  ------------ -------------- ---------- ----- ------------------- ------------------
  id           UUID                   NO PK    gen_random_uuid()   Plant identifier
  code         VARCHAR(50)            NO UK    \-                  Plant code
  name         VARCHAR(150)           NO UK    \-                  Plant name
  location     VARCHAR(255)          YES \-    NULL                Plant location
  is_active    BOOLEAN                NO \-    TRUE                Active/inactive
  created_at   TIMESTAMPTZ            NO \-    NOW()               Creation
  updated_at   TIMESTAMPTZ            NO \-    NOW()               Update

## `users`

  Column          Type             Nullable Key   Default             Description
  --------------- -------------- ---------- ----- ------------------- ---------------------
  id              UUID                   NO PK    gen_random_uuid()   User identifier
  employee_id     VARCHAR(50)            NO UK    \-                  Employee identifier
  username        VARCHAR(100)           NO UK    \-                  Login username
  name            VARCHAR(150)           NO \-    \-                  Full name
  email           VARCHAR(255)           NO UK    \-                  Email
  password_hash   TEXT                   NO \-    \-                  Hashed password
  department_id   UUID                   NO FK    \-                  Department
  plant_id        UUID                   NO FK    \-                  Plant
  role_id         UUID                   NO FK    \-                  Role
  approver_id     UUID                  YES FK    NULL                Assigned approver
  position        VARCHAR(150)          YES \-    NULL                Position
  status          VARCHAR(20)            NO \-    ACTIVE              Account status
  last_login_at   TIMESTAMPTZ           YES \-    NULL                Last login
  created_at      TIMESTAMPTZ            NO \-    NOW()               Creation
  updated_at      TIMESTAMPTZ            NO \-    NOW()               Update

## `user_sessions`

  Column               Type            Nullable Key   Default             Description
  -------------------- ------------- ---------- ----- ------------------- ----------------------
  id                   UUID                  NO PK    gen_random_uuid()   Session identifier
  user_id              UUID                  NO FK    \-                  User
  session_token_hash   TEXT                  NO UK    \-                  Hashed session token
  expires_at           TIMESTAMPTZ           NO \-    \-                  Expiration
  last_activity_at     TIMESTAMPTZ           NO \-    NOW()               Last activity
  revoked_at           TIMESTAMPTZ          YES \-    NULL                Revocation
  created_at           TIMESTAMPTZ           NO \-    NOW()               Creation

## `password_reset_tokens`

  Column       Type            Nullable Key   Default             Description
  ------------ ------------- ---------- ----- ------------------- --------------------
  id           UUID                  NO PK    gen_random_uuid()   Reset record
  user_id      UUID                  NO FK    \-                  User
  token_hash   TEXT                  NO UK    \-                  Hashed reset token
  expires_at   TIMESTAMPTZ           NO \-    \-                  Expiration
  used_at      TIMESTAMPTZ          YES \-    NULL                Consumption
  created_at   TIMESTAMPTZ           NO \-    NOW()               Creation

## `material_categories`

  Column       Type             Nullable Key   Default             Description
  ------------ -------------- ---------- ----- ------------------- ---------------------
  id           UUID                   NO PK    gen_random_uuid()   Category identifier
  code         VARCHAR(50)            NO UK    \-                  Category code
  name         VARCHAR(150)           NO UK    \-                  Category name
  is_active    BOOLEAN                NO \-    TRUE                Active/inactive
  created_at   TIMESTAMPTZ            NO \-    NOW()               Creation
  updated_at   TIMESTAMPTZ            NO \-    NOW()               Update

## `materials`

  Column             Type              Nullable Key   Default             Description
  ------------------ --------------- ---------- ----- ------------------- ----------------------
  id                 UUID                    NO PK    gen_random_uuid()   Material identifier
  material_number    VARCHAR(100)            NO UK    \-                  Material number
  description        VARCHAR(255)            NO \-    \-                  Material description
  category_id        UUID                    NO FK    \-                  Category
  uom                VARCHAR(30)             NO \-    \-                  Unit of measure
  minimum_stock      NUMERIC(18,3)           NO \-    0                   Minimum stock
  maximum_stock      NUMERIC(18,3)          YES \-    NULL                Maximum stock
  storage_location   VARCHAR(150)            NO \-    \-                  Storage location
  plant_id           UUID                    NO FK    \-                  Plant
  qr_code            VARCHAR(255)           YES UK    NULL                QR identifier
  status             VARCHAR(20)             NO \-    ACTIVE              Material status
  created_at         TIMESTAMPTZ             NO \-    NOW()               Creation
  updated_at         TIMESTAMPTZ             NO \-    NOW()               Update

## `stock_balances`

  Column        Type              Nullable Key     Default             Description
  ------------- --------------- ---------- ------- ------------------- --------------------
  id            UUID                    NO PK      gen_random_uuid()   Balance identifier
  material_id   UUID                    NO FK/UK   \-                  Material
  quantity      NUMERIC(18,3)           NO \-      0                   Current SOH
  updated_at    TIMESTAMPTZ             NO \-      NOW()               Last update

## `stock_transactions`

  --------------------------------------------------------------------------------------------------
  Column                Type                  Nullable Key         Default             Description
  --------------------- --------------- -------------- ----------- ------------------- -------------
  id                    UUID                        NO PK          gen_random_uuid()   Transaction
                                                                                       identifier

  material_id           UUID                        NO FK          \-                  Material

  transaction_type      VARCHAR(20)                 NO \-          \-                  STOCK_IN /
                                                                                       STOCK_OUT /
                                                                                       ADJUSTMENT /
                                                                                       REVERSAL

  material_request_id   UUID                       YES FK          NULL                Related
                                                                                       request

  request_item_id       UUID                       YES FK          NULL                Related
                                                                                       request item

  reference_no          VARCHAR(100)               YES \-          NULL                Business
                                                                                       reference

  qty_in                NUMERIC(18,3)               NO \-          0                   Quantity in

  qty_out               NUMERIC(18,3)               NO \-          0                   Quantity out

  balance_after         NUMERIC(18,3)               NO \-          \-                  Balance after

  supplier              VARCHAR(255)               YES \-          NULL                Supplier for
                                                                                       stock-in

  storage_location      VARCHAR(150)               YES \-          NULL                Transaction
                                                                                       location

  reason                TEXT                       YES \-          NULL                Reason

  transaction_date      TIMESTAMPTZ                 NO \-          NOW()               Transaction
                                                                                       time

  user_id               UUID                        NO FK          \-                  Actor

  note                  TEXT                       YES \-          NULL                Note

  created_at            TIMESTAMPTZ                 NO \-          NOW()               Creation
  --------------------------------------------------------------------------------------------------

## `material_requests`

  ---------------------------------------------------------------------------------------------------------
  Column             Type                 Nullable Key         Default             Description
  ------------------ -------------- -------------- ----------- ------------------- ------------------------
  id                 UUID                       NO PK          gen_random_uuid()   Request identifier

  request_no         VARCHAR(30)                NO UK          \-                  Auto-generated request
                                                                                   number

  no_doc             VARCHAR(100)              YES \-          NULL                Admin document reference

  request_date       DATE                       NO \-          CURRENT_DATE        Request date

  requester_id       UUID                       NO FK          \-                  Request owner

  department_id      UUID                       NO FK          \-                  Department

  plant_id           UUID                       NO FK          \-                  Plant

  gl_account         VARCHAR(100)              YES \-          NULL                G/L account

  pwo_no             VARCHAR(100)              YES \-          NULL                PWO number

  pur_org            VARCHAR(100)              YES \-          NULL                Purchasing organization

  pur_group          VARCHAR(100)              YES \-          NULL                Purchasing group

  cost_center        VARCHAR(100)              YES \-          NULL                Cost center

  reason             TEXT                       NO \-          \-                  Request reason

  status             VARCHAR(30)                NO \-          DRAFT               Lifecycle status

  approver_id        UUID                      YES FK          NULL                Assigned approver

  approved_at        TIMESTAMPTZ               YES \-          NULL                Approval time

  rejected_at        TIMESTAMPTZ               YES \-          NULL                Rejection/cancellation
                                                                                   time

  rejection_reason   TEXT                      YES \-          NULL                Rejection/cancellation
                                                                                   reason

  created_at         TIMESTAMPTZ                NO \-          NOW()               Creation

  updated_at         TIMESTAMPTZ                NO \-          NOW()               Update
  ---------------------------------------------------------------------------------------------------------

## `material_request_items`

  -------------------------------------------------------------------------------------------
  Column        Type                  Nullable Key         Default             Description
  ------------- --------------- -------------- ----------- ------------------- --------------
  id            UUID                        NO PK          gen_random_uuid()   Item
                                                                               identifier

  request_id    UUID                        NO FK          \-                  Parent request

  material_id   UUID                        NO FK          \-                  Material

  description   VARCHAR(255)                NO \-          \-                  Request-time
                                                                               description
                                                                               snapshot

  qty           NUMERIC(18,3)               NO \-          \-                  Requested
                                                                               quantity

  uom           VARCHAR(30)                 NO \-          \-                  Request-time
                                                                               UoM

  soh           NUMERIC(18,3)               NO \-          \-                  SOH snapshot

  balance       NUMERIC(18,3)               NO \-          \-                  SOH -
                                                                               requested
                                                                               quantity

  note          TEXT                       YES \-          NULL                Item note

  created_at    TIMESTAMPTZ                 NO \-          NOW()               Creation

  updated_at    TIMESTAMPTZ                 NO \-          NOW()               Update
  -------------------------------------------------------------------------------------------

## `approval_histories`

  Column        Type            Nullable Key   Default             Description
  ------------- ------------- ---------- ----- ------------------- ---------------------
  id            UUID                  NO PK    gen_random_uuid()   History identifier
  request_id    UUID                  NO FK    \-                  Request
  approver_id   UUID                  NO FK    \-                  Actor
  action        VARCHAR(20)           NO \-    \-                  APPROVED / REJECTED
  reason        TEXT                 YES \-    NULL                Rejection reason
  action_at     TIMESTAMPTZ           NO \-    NOW()               Action time
  created_at    TIMESTAMPTZ           NO \-    NOW()               Creation

## `notifications`

  Column       Type             Nullable Key   Default             Description
  ------------ -------------- ---------- ----- ------------------- -----------------------------
  id           UUID                   NO PK    gen_random_uuid()   Notification identifier
  user_id      UUID                   NO FK    \-                  Recipient
  type         VARCHAR(50)            NO \-    \-                  Notification type
  title        VARCHAR(255)           NO \-    \-                  Title
  message      TEXT                   NO \-    \-                  Message
  is_read      BOOLEAN                NO \-    FALSE               Read state
  read_at      TIMESTAMPTZ           YES \-    NULL                Read timestamp
  metadata     JSONB                 YES \-    NULL                Dynamic supporting metadata
  created_at   TIMESTAMPTZ            NO \-    NOW()               Creation

## `audit_logs`

  Column        Type             Nullable Key   Default             Description
  ------------- -------------- ---------- ----- ------------------- --------------------
  id            UUID                   NO PK    gen_random_uuid()   Audit identifier
  user_id       UUID                  YES FK    NULL                Actor
  role          VARCHAR(50)           YES \-    NULL                Role snapshot
  action        VARCHAR(100)           NO \-    \-                  Action
  module        VARCHAR(100)           NO \-    \-                  Module
  record_type   VARCHAR(100)           NO \-    \-                  Entity type
  record_id     UUID                  YES \-    NULL                Affected record
  old_value     JSONB                 YES \-    NULL                Previous value
  new_value     JSONB                 YES \-    NULL                New value
  ip_address    INET                  YES \-    NULL                Source IP
  user_agent    TEXT                  YES \-    NULL                Client information
  description   TEXT                  YES \-    NULL                Description
  created_at    TIMESTAMPTZ            NO \-    NOW()               Audit timestamp

------------------------------------------------------------------------

# 11. Constraints

## Primary Keys

All core entities use UUID primary keys.

## Unique Constraints

``` text
roles.name
departments.code
departments.name
plants.code
plants.name
users.employee_id
users.username
users.email
materials.material_number
materials.qr_code
stock_balances.material_id
material_requests.request_no
material_categories.code
material_categories.name
user_sessions.session_token_hash
password_reset_tokens.token_hash
```

## Foreign Keys

``` text
users.department_id → departments.id
users.plant_id → plants.id
users.role_id → roles.id
users.approver_id → users.id

materials.category_id → material_categories.id
materials.plant_id → plants.id

stock_balances.material_id → materials.id

material_requests.requester_id → users.id
material_requests.department_id → departments.id
material_requests.plant_id → plants.id
material_requests.approver_id → users.id

material_request_items.request_id → material_requests.id
material_request_items.material_id → materials.id

approval_histories.request_id → material_requests.id
approval_histories.approver_id → users.id

notifications.user_id → users.id
audit_logs.user_id → users.id
```

## Delete Rules

Master data:

``` text
deactivate / inactive
```

instead of hard deletion.

Transactional data:

``` text
material_requests
material_request_items
stock_transactions
approval_histories
audit_logs
```

must not be hard-deleted.

## Quantity Constraints

``` text
qty > 0
qty_in >= 0
qty_out >= 0
balance_after >= 0
stock_balances.quantity >= 0
minimum_stock >= 0
maximum_stock >= minimum_stock when provided
```

## Rejection Reason

If an approval action is `REJECTED`, a reason is mandatory.

------------------------------------------------------------------------

# 12. Indexing Strategy

## Users

``` text
users.department_id
users.plant_id
users.role_id
users.approver_id
users.status
```

## Materials

``` text
materials.category_id
materials.plant_id
materials.status
materials.description
```

## Requests

``` text
material_requests.requester_id
material_requests.department_id
material_requests.plant_id
material_requests.status
material_requests.approver_id
material_requests.request_date
```

Composite:

``` text
(requester_id, created_at DESC)
(approver_id, status, created_at DESC)
(status, request_date DESC)
```

## Request Items

``` text
material_request_items.request_id
material_request_items.material_id
```

## Stock Transactions

``` text
stock_transactions.material_id
stock_transactions.transaction_type
stock_transactions.transaction_date
stock_transactions.user_id
stock_transactions.material_request_id
stock_transactions.request_item_id
(material_id, transaction_date DESC)
```

## Notifications

``` text
notifications.user_id
(user_id, is_read, created_at DESC)
```

## Audit Logs

``` text
audit_logs.user_id
audit_logs.module
audit_logs.record_type
audit_logs.record_id
audit_logs.created_at
(record_type, record_id, created_at DESC)
```

Avoid broad indexing beyond real query patterns.

------------------------------------------------------------------------

# 13. Normalization Analysis

## 1NF

-   Atomic fields.
-   No repeating groups.
-   Multiple materials are represented through `material_request_items`.

## 2NF

Request header and request items are separated.

``` text
material_requests
material_request_items
```

## 3NF

Reference/master values are normalized into:

``` text
roles
departments
plants
material_categories
materials
```

## Controlled Denormalization

`material_request_items` intentionally stores:

``` text
description
uom
soh
balance
```

as request-time snapshots.

Reason:

-   preserve historical document representation,
-   prevent later master-data changes from rewriting history,
-   support reporting.

`[ASSUMPTION]`: SOH and Balance are snapshots at the request transaction
point because the PRD explicitly requires those fields in the
request-item model.

------------------------------------------------------------------------

# 14. Prisma Schema

``` prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserStatus {
  ACTIVE
  INACTIVE
}

enum MaterialStatus {
  ACTIVE
  INACTIVE
}

enum RequestStatus {
  DRAFT
  SUBMITTED
  PENDING_APPROVAL
  APPROVED
  REJECTED
  PROCESSING
  COMPLETED
  CANCELLED
  CANCELLED_AFTER_APPROVAL
}

enum ApprovalAction {
  APPROVED
  REJECTED
}

enum StockTransactionType {
  STOCK_IN
  STOCK_OUT
  ADJUSTMENT
  REVERSAL
}

model Role {
  id          String   @id @default(uuid()) @db.Uuid
  name        String   @unique @db.VarChar(50)
  description String?  @db.VarChar(255)
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  users User[]

  @@map("roles")
}

model Department {
  id        String   @id @default(uuid()) @db.Uuid
  code      String   @unique @db.VarChar(50)
  name      String   @unique @db.VarChar(150)
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  users    User[]
  requests MaterialRequest[]

  @@map("departments")
}

model Plant {
  id        String   @id @default(uuid()) @db.Uuid
  code      String   @unique @db.VarChar(50)
  name      String   @unique @db.VarChar(150)
  location  String?  @db.VarChar(255)
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  users     User[]
  materials Material[]
  requests  MaterialRequest[]

  @@map("plants")
}

model User {
  id           String     @id @default(uuid()) @db.Uuid
  employeeId   String     @unique @map("employee_id") @db.VarChar(50)
  username     String     @unique @db.VarChar(100)
  name         String     @db.VarChar(150)
  email        String     @unique @db.VarChar(255)
  passwordHash String     @map("password_hash")
  departmentId String     @map("department_id") @db.Uuid
  plantId      String     @map("plant_id") @db.Uuid
  roleId       String     @map("role_id") @db.Uuid
  approverId   String?    @map("approver_id") @db.Uuid
  position     String?    @db.VarChar(150)
  status       UserStatus @default(ACTIVE)
  lastLoginAt  DateTime?  @map("last_login_at")
  createdAt    DateTime   @default(now()) @map("created_at")
  updatedAt    DateTime   @updatedAt @map("updated_at")

  department Department @relation(fields: [departmentId], references: [id], onDelete: Restrict)
  plant      Plant      @relation(fields: [plantId], references: [id], onDelete: Restrict)
  role       Role       @relation(fields: [roleId], references: [id], onDelete: Restrict)

  approver      User?  @relation("UserApprover", fields: [approverId], references: [id], onDelete: SetNull)
  assignedUsers User[] @relation("UserApprover")

  sessions            UserSession[]
  passwordResetTokens PasswordResetToken[]

  requestsCreated  MaterialRequest[] @relation("RequestRequester")
  requestsApproved MaterialRequest[] @relation("RequestApprover")

  approvalHistories  ApprovalHistory[]
  notifications      Notification[]
  auditLogs          AuditLog[]
  stockTransactions  StockTransaction[]

  @@index([departmentId])
  @@index([plantId])
  @@index([roleId])
  @@index([approverId])
  @@index([status])
  @@map("users")
}

model UserSession {
  id               String    @id @default(uuid()) @db.Uuid
  userId           String    @map("user_id") @db.Uuid
  sessionTokenHash String    @unique @map("session_token_hash")
  expiresAt        DateTime  @map("expires_at")
  lastActivityAt   DateTime  @default(now()) @map("last_activity_at")
  revokedAt        DateTime? @map("revoked_at")
  createdAt        DateTime  @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
  @@map("user_sessions")
}

model PasswordResetToken {
  id        String    @id @default(uuid()) @db.Uuid
  userId    String    @map("user_id") @db.Uuid
  tokenHash String    @unique @map("token_hash")
  expiresAt DateTime  @map("expires_at")
  usedAt    DateTime? @map("used_at")
  createdAt DateTime  @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
  @@map("password_reset_tokens")
}

model MaterialCategory {
  id        String   @id @default(uuid()) @db.Uuid
  code      String   @unique @db.VarChar(50)
  name      String   @unique @db.VarChar(150)
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  materials Material[]

  @@map("material_categories")
}

model Material {
  id              String         @id @default(uuid()) @db.Uuid
  materialNumber  String         @unique @map("material_number") @db.VarChar(100)
  description     String         @db.VarChar(255)
  categoryId      String         @map("category_id") @db.Uuid
  uom             String         @db.VarChar(30)
  minimumStock    Decimal        @default(0) @map("minimum_stock") @db.Decimal(18, 3)
  maximumStock    Decimal?       @map("maximum_stock") @db.Decimal(18, 3)
  storageLocation String         @map("storage_location") @db.VarChar(150)
  plantId         String         @map("plant_id") @db.Uuid
  qrCode          String?        @unique @map("qr_code") @db.VarChar(255)
  status          MaterialStatus @default(ACTIVE)
  createdAt       DateTime       @default(now()) @map("created_at")
  updatedAt       DateTime       @updatedAt @map("updated_at")

  category          MaterialCategory    @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  plant             Plant               @relation(fields: [plantId], references: [id], onDelete: Restrict)
  stockBalance      StockBalance?
  stockTransactions StockTransaction[]
  requestItems      MaterialRequestItem[]

  @@index([categoryId])
  @@index([plantId])
  @@index([status])
  @@index([description])
  @@map("materials")
}

model StockBalance {
  id         String   @id @default(uuid()) @db.Uuid
  materialId String   @unique @map("material_id") @db.Uuid
  quantity   Decimal  @default(0) @db.Decimal(18, 3)
  updatedAt  DateTime @updatedAt @map("updated_at")

  material Material @relation(fields: [materialId], references: [id], onDelete: Restrict)

  @@map("stock_balances")
}

model StockTransaction {
  id                String              @id @default(uuid()) @db.Uuid
  materialId        String              @map("material_id") @db.Uuid
  transactionType   StockTransactionType @map("transaction_type")
  materialRequestId String?             @map("material_request_id") @db.Uuid
  requestItemId     String?             @map("request_item_id") @db.Uuid
  referenceNo       String?             @map("reference_no") @db.VarChar(100)
  qtyIn             Decimal             @default(0) @map("qty_in") @db.Decimal(18, 3)
  qtyOut            Decimal             @default(0) @map("qty_out") @db.Decimal(18, 3)
  balanceAfter      Decimal             @map("balance_after") @db.Decimal(18, 3)
  supplier          String?             @db.VarChar(255)
  storageLocation   String?             @map("storage_location") @db.VarChar(150)
  reason            String?
  transactionDate   DateTime            @default(now()) @map("transaction_date")
  userId            String              @map("user_id") @db.Uuid
  note              String?
  createdAt         DateTime            @default(now()) @map("created_at")

  material        Material             @relation(fields: [materialId], references: [id], onDelete: Restrict)
  materialRequest MaterialRequest?     @relation(fields: [materialRequestId], references: [id], onDelete: Restrict)
  requestItem     MaterialRequestItem? @relation(fields: [requestItemId], references: [id], onDelete: Restrict)
  user            User                 @relation(fields: [userId], references: [id], onDelete: Restrict)

  @@index([materialId])
  @@index([transactionType])
  @@index([transactionDate])
  @@index([userId])
  @@index([materialRequestId])
  @@index([requestItemId])
  @@index([materialId, transactionDate])
  @@map("stock_transactions")
}

model MaterialRequest {
  id              String        @id @default(uuid()) @db.Uuid
  requestNo       String        @unique @map("request_no") @db.VarChar(30)
  noDoc           String?       @map("no_doc") @db.VarChar(100)
  requestDate     DateTime      @default(now()) @map("request_date") @db.Date
  requesterId     String        @map("requester_id") @db.Uuid
  departmentId    String        @map("department_id") @db.Uuid
  plantId         String        @map("plant_id") @db.Uuid
  glAccount       String?       @map("gl_account") @db.VarChar(100)
  pwoNo           String?       @map("pwo_no") @db.VarChar(100)
  purOrg          String?       @map("pur_org") @db.VarChar(100)
  purGroup        String?       @map("pur_group") @db.VarChar(100)
  costCenter      String?       @map("cost_center") @db.VarChar(100)
  reason          String
  status          RequestStatus @default(DRAFT)
  approverId      String?       @map("approver_id") @db.Uuid
  approvedAt      DateTime?     @map("approved_at")
  rejectedAt      DateTime?     @map("rejected_at")
  rejectionReason String?       @map("rejection_reason")
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")

  requester  User       @relation("RequestRequester", fields: [requesterId], references: [id], onDelete: Restrict)
  department Department @relation(fields: [departmentId], references: [id], onDelete: Restrict)
  plant      Plant      @relation(fields: [plantId], references: [id], onDelete: Restrict)
  approver   User?      @relation("RequestApprover", fields: [approverId], references: [id], onDelete: SetNull)

  items             MaterialRequestItem[]
  approvalHistories ApprovalHistory[]
  stockTransactions StockTransaction[]

  @@index([requesterId])
  @@index([departmentId])
  @@index([plantId])
  @@index([status])
  @@index([approverId])
  @@index([requestDate])
  @@index([requesterId, createdAt])
  @@index([approverId, status, createdAt])
  @@index([status, requestDate])
  @@map("material_requests")
}

model MaterialRequestItem {
  id          String   @id @default(uuid()) @db.Uuid
  requestId   String   @map("request_id") @db.Uuid
  materialId  String   @map("material_id") @db.Uuid
  description String   @db.VarChar(255)
  qty         Decimal  @db.Decimal(18, 3)
  uom         String   @db.VarChar(30)
  soh         Decimal  @db.Decimal(18, 3)
  balance     Decimal  @db.Decimal(18, 3)
  note        String?
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  request           MaterialRequest    @relation(fields: [requestId], references: [id], onDelete: Restrict)
  material          Material           @relation(fields: [materialId], references: [id], onDelete: Restrict)
  stockTransactions StockTransaction[]

  @@index([requestId])
  @@index([materialId])
  @@map("material_request_items")
}

model ApprovalHistory {
  id         String         @id @default(uuid()) @db.Uuid
  requestId  String         @map("request_id") @db.Uuid
  approverId String         @map("approver_id") @db.Uuid
  action     ApprovalAction
  reason     String?
  actionAt   DateTime       @default(now()) @map("action_at")
  createdAt  DateTime       @default(now()) @map("created_at")

  request  MaterialRequest @relation(fields: [requestId], references: [id], onDelete: Restrict)
  approver User            @relation(fields: [approverId], references: [id], onDelete: Restrict)

  @@index([requestId, actionAt])
  @@index([approverId, actionAt])
  @@map("approval_histories")
}

model Notification {
  id        String    @id @default(uuid()) @db.Uuid
  userId    String    @map("user_id") @db.Uuid
  type      String    @db.VarChar(50)
  title     String    @db.VarChar(255)
  message   String
  isRead    Boolean   @default(false) @map("is_read")
  readAt    DateTime? @map("read_at")
  metadata  Json?
  createdAt DateTime  @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, isRead, createdAt])
  @@map("notifications")
}

model AuditLog {
  id          String   @id @default(uuid()) @db.Uuid
  userId      String?  @map("user_id") @db.Uuid
  role        String?  @db.VarChar(50)
  action      String   @db.VarChar(100)
  module      String   @db.VarChar(100)
  recordType  String   @map("record_type") @db.VarChar(100)
  recordId    String?  @map("record_id") @db.Uuid
  oldValue    Json?    @map("old_value")
  newValue    Json?    @map("new_value")
  ipAddress   String?  @map("ip_address") @db.Inet
  userAgent   String?  @map("user_agent")
  description String?
  createdAt   DateTime @default(now()) @map("created_at")

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([module])
  @@index([recordType, recordId, createdAt])
  @@index([createdAt])
  @@map("audit_logs")
}
```

------------------------------------------------------------------------

# 15. PostgreSQL DDL

The following is the PostgreSQL baseline. If Prisma is used as the
migration source, keep the SQL behavior consistent with the generated
Prisma migration.

``` sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE');

CREATE TYPE material_status AS ENUM ('ACTIVE', 'INACTIVE');

CREATE TYPE request_status AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'PENDING_APPROVAL',
    'APPROVED',
    'REJECTED',
    'PROCESSING',
    'COMPLETED',
    'CANCELLED',
    'CANCELLED_AFTER_APPROVAL'
);

CREATE TYPE approval_action AS ENUM ('APPROVED', 'REJECTED');

CREATE TYPE stock_transaction_type AS ENUM (
    'STOCK_IN',
    'STOCK_OUT',
    'ADJUSTMENT',
    'REVERSAL'
);

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE plants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL UNIQUE,
    location VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(50) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    department_id UUID NOT NULL,
    plant_id UUID NOT NULL,
    role_id UUID NOT NULL,
    approver_id UUID,
    position VARCHAR(150),
    status user_status NOT NULL DEFAULT 'ACTIVE',
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE RESTRICT,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
    FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    session_token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE material_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_number VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    category_id UUID NOT NULL,
    uom VARCHAR(30) NOT NULL,
    minimum_stock NUMERIC(18,3) NOT NULL DEFAULT 0,
    maximum_stock NUMERIC(18,3),
    storage_location VARCHAR(150) NOT NULL,
    plant_id UUID NOT NULL,
    qr_code VARCHAR(255) UNIQUE,
    status material_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    FOREIGN KEY (category_id) REFERENCES material_categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE RESTRICT,
    CHECK (minimum_stock >= 0),
    CHECK (maximum_stock IS NULL OR maximum_stock >= minimum_stock)
);

CREATE TABLE stock_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID NOT NULL UNIQUE,
    quantity NUMERIC(18,3) NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE RESTRICT,
    CHECK (quantity >= 0)
);

CREATE TABLE material_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_no VARCHAR(30) NOT NULL UNIQUE,
    no_doc VARCHAR(100),
    request_date DATE NOT NULL DEFAULT CURRENT_DATE,
    requester_id UUID NOT NULL,
    department_id UUID NOT NULL,
    plant_id UUID NOT NULL,
    gl_account VARCHAR(100),
    pwo_no VARCHAR(100),
    pur_org VARCHAR(100),
    pur_group VARCHAR(100),
    cost_center VARCHAR(100),
    reason TEXT NOT NULL,
    status request_status NOT NULL DEFAULT 'DRAFT',
    approver_id UUID,
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE RESTRICT,
    FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE material_request_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL,
    material_id UUID NOT NULL,
    description VARCHAR(255) NOT NULL,
    qty NUMERIC(18,3) NOT NULL,
    uom VARCHAR(30) NOT NULL,
    soh NUMERIC(18,3) NOT NULL,
    balance NUMERIC(18,3) NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    FOREIGN KEY (request_id) REFERENCES material_requests(id) ON DELETE RESTRICT,
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE RESTRICT,
    CHECK (qty > 0),
    CHECK (soh >= 0),
    CHECK (balance = soh - qty)
);

CREATE TABLE approval_histories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL,
    approver_id UUID NOT NULL,
    action approval_action NOT NULL,
    reason TEXT,
    action_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    FOREIGN KEY (request_id) REFERENCES material_requests(id) ON DELETE RESTRICT,
    FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE RESTRICT,
    CHECK (
        action <> 'REJECTED'
        OR NULLIF(TRIM(reason), '') IS NOT NULL
    )
);

CREATE TABLE stock_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID NOT NULL,
    transaction_type stock_transaction_type NOT NULL,
    material_request_id UUID,
    request_item_id UUID,
    reference_no VARCHAR(100),
    qty_in NUMERIC(18,3) NOT NULL DEFAULT 0,
    qty_out NUMERIC(18,3) NOT NULL DEFAULT 0,
    balance_after NUMERIC(18,3) NOT NULL,
    supplier VARCHAR(255),
    storage_location VARCHAR(150),
    reason TEXT,
    transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE RESTRICT,
    FOREIGN KEY (material_request_id) REFERENCES material_requests(id) ON DELETE RESTRICT,
    FOREIGN KEY (request_item_id) REFERENCES material_request_items(id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,

    CHECK (qty_in >= 0),
    CHECK (qty_out >= 0),
    CHECK (balance_after >= 0)
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    module VARCHAR(100) NOT NULL,
    record_type VARCHAR(100) NOT NULL,
    record_id UUID,
    old_value JSONB,
    new_value JSONB,
    ip_address INET,
    user_agent TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

## Index DDL

``` sql
CREATE INDEX idx_users_department_id ON users(department_id);
CREATE INDEX idx_users_plant_id ON users(plant_id);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_approver_id ON users(approver_id);
CREATE INDEX idx_users_status ON users(status);

CREATE INDEX idx_materials_category_id ON materials(category_id);
CREATE INDEX idx_materials_plant_id ON materials(plant_id);
CREATE INDEX idx_materials_status ON materials(status);
CREATE INDEX idx_materials_description ON materials(description);

CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON user_sessions(expires_at);

CREATE INDEX idx_reset_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_reset_expires_at ON password_reset_tokens(expires_at);

CREATE INDEX idx_requests_requester_id ON material_requests(requester_id);
CREATE INDEX idx_requests_department_id ON material_requests(department_id);
CREATE INDEX idx_requests_plant_id ON material_requests(plant_id);
CREATE INDEX idx_requests_status ON material_requests(status);
CREATE INDEX idx_requests_approver_id ON material_requests(approver_id);
CREATE INDEX idx_requests_request_date ON material_requests(request_date);
CREATE INDEX idx_requests_requester_created ON material_requests(requester_id, created_at DESC);
CREATE INDEX idx_requests_approver_status_created ON material_requests(approver_id, status, created_at DESC);
CREATE INDEX idx_requests_status_date ON material_requests(status, request_date DESC);

CREATE INDEX idx_request_items_request_id ON material_request_items(request_id);
CREATE INDEX idx_request_items_material_id ON material_request_items(material_id);

CREATE INDEX idx_approval_request_action_at ON approval_histories(request_id, action_at DESC);
CREATE INDEX idx_approval_approver_action_at ON approval_histories(approver_id, action_at DESC);

CREATE INDEX idx_stock_tx_material ON stock_transactions(material_id);
CREATE INDEX idx_stock_tx_type ON stock_transactions(transaction_type);
CREATE INDEX idx_stock_tx_date ON stock_transactions(transaction_date DESC);
CREATE INDEX idx_stock_tx_user ON stock_transactions(user_id);
CREATE INDEX idx_stock_tx_request ON stock_transactions(material_request_id);
CREATE INDEX idx_stock_tx_request_item ON stock_transactions(request_item_id);
CREATE INDEX idx_stock_tx_material_date ON stock_transactions(material_id, transaction_date DESC);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_user_read_created ON notifications(user_id, is_read, created_at DESC);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_module ON audit_logs(module);
CREATE INDEX idx_audit_record ON audit_logs(record_type, record_id, created_at DESC);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at DESC);
```

------------------------------------------------------------------------

# 16. Security Review

## Passwords

Store only:

``` text
password_hash
```

Use Laravel-supported secure hashing such as bcrypt or Argon2id.

The development credential documented in the PRD is for
development/testing and must not be used as a production credential.

## Sessions

Store only hashed session tokens.

Enforce:

-   expiration
-   revocation
-   logout invalidation
-   session timeout
-   secure cookies

## Password Reset

Store only the reset token hash.

## Authorization

Server-side authorization remains authoritative.

``` text
USER
→ own requests

APPROVER
→ requests within approval scope

ADMIN
→ all requests
```

## Audit

Audit logs must not be deletable by User or Approver.

## PII

Potential PII includes:

``` text
employee_id
name
email
IP address
user agent
```

Restrict access according to company policy.

## JSONB

JSONB is limited to:

``` text
audit old_value
audit new_value
notification metadata
```

It is not used to replace relational modeling.

------------------------------------------------------------------------

# 17. Scalability Review

## High-Volume Tables

Expected growth:

``` text
stock_transactions
audit_logs
notifications
material_requests
approval_histories
```

## MVP Strategy

Use:

-   appropriate indexes
-   pagination
-   server-side filtering
-   bounded query sizes
-   transactional stock updates
-   date-based filtering

No partitioning is required for MVP.

## Future Partitioning

If volume becomes high:

``` text
audit_logs → monthly partitions
stock_transactions → monthly partitions
```

## Stock Concurrency

Stock processing must be atomic:

``` text
BEGIN
  lock stock balance
  validate quantity
  calculate new quantity
  update stock balance
  insert transaction
COMMIT
```

## Cancellation + Reversal

``` text
BEGIN
  verify request
  locate original STOCK_OUT
  restore stock
  insert REVERSAL
  update request
  insert audit log
COMMIT
```

The original STOCK_OUT must remain.

## Reporting

MVP:

``` text
indexed queries
pagination
server-side filtering
```

Future:

``` text
materialized views
read replicas
reporting database
Power BI
```

only when scale requires them.

------------------------------------------------------------------------

# 18. MVP VS FUTURE

## MVP

``` text
[MVP]
roles
users
user_sessions
password_reset_tokens
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

The PRD MVP includes:

``` text
Authentication
User Management
Material Master
Stock Management
Material Request
Approval
Reject
History
PDF
Excel Export
Audit Trail
```

## Phase 2

``` text
[PHASE 2]
Email notification infrastructure
```

## Future

``` text
[FUTURE]
AD / LDAP
SSO
SAP integration
ERP integration
Power BI
QR/barcode operational extensions
Mobile application backend
WhatsApp integration
Multi-level approval
Budget checking
Automatic reorder point
Low-stock notification engine
Digital signature
External API integration
AI/ML if later required
```

------------------------------------------------------------------------

# 19. PRD → DATABASE TRACEABILITY MATRIX

  ------------------------------------------------------------------------------------------
  PRD Feature        Entity/Table                   Purpose                Required
  ------------------ ------------------------------ ---------------------- -----------------
  Login              users                          Account credentials    MVP

  Logout             user_sessions                  Session lifecycle      MVP

  Password reset     password_reset_tokens          Secure reset flow      MVP

  Role-based         roles + users                  Role assignment        MVP
  authorization                                                            

  User management    users                          User CRUD/status       MVP

  Department master  departments                    Organization data      MVP

  Plant master       plants                         Plant data             MVP

  Material           material_categories            Material               MVP
  categories                                        classification         

  Material master    materials                      Material records       MVP

  Stock balance      stock_balances                 Current SOH            MVP

  Stock In           stock_transactions             Incoming stock         MVP

  Stock Adjustment   stock_transactions             Stock correction       MVP

  Stock Out          stock_transactions             Actual material issue  MVP

  Reversal           stock_transactions             Restore stock after    MVP
                                                    cancellation           

  Material Request   material_requests              Request lifecycle      MVP

  Multiple materials material_request_items         Request lines          MVP

  Draft              material_requests              Persist draft          MVP

  Submit             material_requests              Workflow transition    MVP

  Approval           approval_histories             Approval history       MVP

  Rejection          approval_histories +           Reason/history         MVP
                     material_requests                                     

  User history       material_requests + items      Own request history    MVP

  Admin request      material_requests              Search/filter/manage   MVP
  management                                                               

  Approved-request   material_requests + audit_logs Track changes          MVP
  edits                                                                    

  Document number    material_requests.no_doc       Admin                  MVP
                                                    archive/reference      

  Request number     material_requests.request_no   Unique business        MVP
                                                    identifier             

  Notifications      notifications                  In-app notification    MVP

  Audit trail        audit_logs                     Governance             MVP

  Request report     requests + items + master data Reporting              MVP

  Stock report       stock_balances +               Reporting              MVP
                     stock_transactions                                    

  Approval report    requests + approval_histories  Reporting              MVP

  PDF                request relational data        Document generation    MVP

  Excel/CSV          query layer                    Export                 MVP

  Email notification External channel               Future                 Future

  AD/LDAP            External identity provider     Future                 Future

  SAP/ERP            External integration           Future                 Future

  Power BI           Reporting integration          Future                 Future

  Multi-level        Future workflow model          Future                 Future
  approval                                                                 

  AI/ML              None currently                 Not defined            Future
  ------------------------------------------------------------------------------------------

------------------------------------------------------------------------

# 20. Final Database Validation

## ERD

-   [x] All PRD minimum tables represented.
-   [x] Authentication support represented.
-   [x] Session management represented.
-   [x] Password reset represented.
-   [x] User → approver relationship represented.
-   [x] Request → items is 1:N.
-   [x] Material → request items is 1:N.
-   [x] Request → approval history is 1:N.
-   [x] Material → stock transactions is 1:N.
-   [x] No orphan core table.
-   [x] Historical records remain traceable.

## Database

-   [x] UUID primary keys.
-   [x] Foreign keys.
-   [x] Unique constraints.
-   [x] Check constraints.
-   [x] Timestamp fields.
-   [x] TIMESTAMPTZ for timestamps.
-   [x] Master-data deactivation instead of destructive deletion.
-   [x] Transactional deletion avoided.
-   [x] JSONB limited to genuinely dynamic metadata/history.
-   [x] 3NF applied to transactional/master data.
-   [x] Snapshot denormalization documented.

## Backend

-   [x] PostgreSQL compatible.
-   [x] Prisma-compatible model.
-   [x] Laravel-compatible relational design.
-   [x] Migration-friendly.
-   [x] Business request number separated from UUID.

## Security

-   [x] Plaintext password excluded.
-   [x] Plaintext session tokens excluded.
-   [x] Plaintext reset tokens excluded.
-   [x] Server-side authorization required.
-   [x] Audit trail retained.
-   [x] Sensitive audit fields identified.

## Scalability

-   [x] High-growth tables identified.
-   [x] FK indexes identified.
-   [x] Request list indexes identified.
-   [x] Stock history indexes identified.
-   [x] Audit indexes identified.
-   [x] Notification indexes identified.
-   [x] No premature partitioning.
-   [x] Atomic stock strategy defined.

------------------------------------------------------------------------

# Architecture Decisions & Open Questions

## AD-001 --- PostgreSQL

**Decision:** PostgreSQL is the implementation target.

**Conflict:** PRD recommends MySQL/MariaDB.

**Status:** `[NEEDS CONFIRMATION]`

## AD-002 --- Session and Password Reset Tables

**Decision:** Add `user_sessions` and `password_reset_tokens`.

**Reason:** The PRD explicitly requires session management, session
timeout, and secure password reset.

**Status:** `[ASSUMPTION]`

## AD-003 --- Stock Transaction Reference

The PRD specifies:

``` text
reference_type
reference_id
```

The requested database principles prohibit unnecessary polymorphic
relationships.

**Decision:** Use explicit nullable foreign keys:

``` text
material_request_id
request_item_id
```

plus:

``` text
reference_no
```

**Status:** `[ASSUMPTION]`

## AD-004 --- Cancellation Status

The PRD lists `CANCELLED`, while the later cancellation requirement
recommends:

``` text
CANCELLED_AFTER_APPROVAL
```

**Decision:** Support both so rejection and post-approval cancellation
remain distinguishable.

**Status:** `[PRD-ALIGNED DESIGN INTERPRETATION]`

## AD-005 --- Stock Balance Granularity

Current MVP assumes:

``` text
one stock balance per material
```

If inventory later needs multiple plant/storage-location balances,
extend to:

``` text
material_id
plant_id
storage_location
quantity
```

with a composite unique constraint.

**Status:** `[NEEDS CONFIRMATION]`

## AD-006 --- Request Item SOH

Store `soh` and `balance` as request-time snapshots.

**Reason:** The PRD explicitly includes them in request items and
historical documents should not change when stock changes.

**Status:** `[ASSUMPTION]`

## AD-007 --- Permissions

The current PRD defines three stable roles but no granular permission
catalog.

**Decision:** No `permissions` / `role_permissions` tables in MVP.

Authorization belongs in Laravel middleware/policies/services.

**Status:** `[PRD-ALIGNED]`

------------------------------------------------------------------------

# Recommended Implementation Sequence

``` text
01. PostgreSQL setup
        ↓
02. Prisma schema / migration baseline
        ↓
03. Seed roles
        ↓
04. Seed development admin
        ↓
05. Departments / Plants
        ↓
06. Categories / Materials
        ↓
07. Stock Balance / Stock Transactions
        ↓
08. Material Requests / Items
        ↓
09. Approval Histories
        ↓
10. Notifications
        ↓
11. Audit Logs
        ↓
12. Authentication / Sessions / Reset
        ↓
13. Authorization Policies
        ↓
14. Inventory transaction service
        ↓
15. Request workflow service
        ↓
16. Approval workflow service
        ↓
17. Cancellation + reversal service
        ↓
18. Reports / exports
        ↓
19. Database tests
        ↓
20. Integration tests
```

# Critical Backend Transaction Boundaries

## Submit Request

``` text
BEGIN
  validate request
  validate items
  resolve approver
  update request status
  create approval history where applicable
  create audit log
  create approver notification
COMMIT
```

## Approve

``` text
BEGIN
  lock request
  verify PENDING_APPROVAL
  verify assigned approver
  update request → APPROVED
  insert approval history
  insert audit log
  insert requester notification
COMMIT
```

## Reject

``` text
BEGIN
  lock request
  verify PENDING_APPROVAL
  require reason
  update request → REJECTED
  insert approval history
  insert audit log
  insert requester notification
COMMIT
```

## Stock Out

``` text
BEGIN
  lock stock balance
  verify request APPROVED/PROCESSING
  verify sufficient stock
  decrement stock
  insert STOCK_OUT
  update request → PROCESSING / COMPLETED according to workflow
  insert audit log
COMMIT
```

## Cancel Before Stock Out

``` text
BEGIN
  lock request
  verify APPROVED and not completed
  update request → CANCELLED_AFTER_APPROVAL
  insert audit log
  insert requester notification
COMMIT
```

No stock transaction is created.

## Cancel After Stock Out

``` text
BEGIN
  lock request
  lock stock balance
  verify original STOCK_OUT
  increment stock
  insert REVERSAL
  update request → CANCELLED_AFTER_APPROVAL
  insert audit log
  insert requester notification
COMMIT
```

The original `STOCK_OUT` remains immutable.

------------------------------------------------------------------------

# Final Blueprint Summary

The recommended MVP database is centered around:

``` text
IDENTITY
├── roles
├── users
├── user_sessions
└── password_reset_tokens

MASTER DATA
├── departments
├── plants
├── material_categories
└── materials

INVENTORY
├── stock_balances
└── stock_transactions

REQUEST / APPROVAL
├── material_requests
├── material_request_items
└── approval_histories

GOVERNANCE
├── notifications
└── audit_logs
```

Core lifecycle:

``` text
USER
  ↓
MATERIAL_REQUEST
  ↓
MATERIAL_REQUEST_ITEMS
  ↓
PENDING_APPROVAL
  ↓
APPROVAL_HISTORY
  ↓
APPROVED
  ↓
STOCK_OUT
  ↓
STOCK_BALANCE
  ↓
COMPLETED
```

Cancellation lifecycle:

``` text
APPROVED
   │
   ├── no STOCK_OUT
   │      ↓
   │  CANCELLED_AFTER_APPROVAL
   │
   └── STOCK_OUT exists
          ↓
       REVERSAL
          ↓
       STOCK_BALANCE restored
          ↓
       CANCELLED_AFTER_APPROVAL
```

The model intentionally keeps approval history, stock history, and audit
history traceable and avoids unnecessary polymorphic relationships.

The architecture establishes:

``` text
PRD
 ↓
Business Domain
 ↓
Entity Model
 ↓
ERD
 ↓
Prisma Schema
 ↓
PostgreSQL
 ↓
Laravel Backend
 ↓
Application Workflow
```
