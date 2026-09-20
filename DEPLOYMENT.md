# Production Deployment Guide — DMRS Laravel on Render + Aiven MySQL

This guide provides instructions for deploying the **Digital Material Requisition System (DMRS)** application to **Render** as a containerized Docker Web Service connected to **Aiven MySQL**.

---

## ⚠️ Critical Security Notice — Aiven Credential Rotation

> [!CAUTION]
> **ACTION REQUIRED BEFORE DEPLOYMENT**: If database credentials were sent or exposed in plain text, **rotate your Aiven MySQL password immediately** in the Aiven Cloud Console.
>
> **Never** commit production credentials to Git, Dockerfiles, or environment template files. All credentials must be injected solely via Render Environment Variables.

---

## Architecture Overview

```text
Render Cloud
    ↓
Docker Container (PHP 8.3-FPM + Nginx)
    ↓
Nginx (Listens on dynamic ${PORT})
    ↓
PHP-FPM (Port 9000)
    ↓
Laravel Production Application
    ↓ (TLS/SSL Connection)
Aiven MySQL Database
```

---

## Environment Variables Configuration

Set the following environment variables in your Render Web Service dashboard (**Settings → Environment**):

| Variable Name | Recommended Value / Description |
|---|---|
| `APP_NAME` | `DMRS` |
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_URL` | `https://<your-app-name>.onrender.com` |
| `APP_KEY` | Generated base64 string (`php artisan key:generate --show`) |
| `LOG_CHANNEL` | `stderr` |
| `LOG_LEVEL` | `error` |
| `DB_CONNECTION` | `mysql` |
| `DB_HOST` | `<YOUR_AIVEN_MYSQL_HOST>` (e.g. `dmrs-xxxx.aivencloud.com`) |
| `DB_PORT` | `<YOUR_AIVEN_MYSQL_PORT>` (e.g. `18747`) |
| `DB_DATABASE` | `defaultdb` |
| `DB_USERNAME` | `<YOUR_AIVEN_MYSQL_USERNAME>` (e.g. `avnadmin`) |
| `DB_PASSWORD` | `<YOUR_NEW_ROTATED_AIVEN_PASSWORD>` |
| `MYSQL_ATTR_SSL_CA` | Path to CA file if using custom CA, or leave empty for standard SSL |
| `SESSION_DRIVER` | `database` |
| `SESSION_SECURE_COOKIE` | `true` |
| `CACHE_STORE` | `database` |
| `QUEUE_CONNECTION` | `database` |

---

## Pre-Deployment Migration & Seeding Strategy

### 1. Database Migrations
Database migrations are configured to run as a **Pre-Deploy Command** on Render:

```bash
php artisan migrate --force
```

This ensures database migrations execute strictly prior to routing live traffic to the new container.

### 2. Initial Data Seeding (Idempotent)
To seed initial system roles, departments, plant master data, and default accounts (`admin`, `approver`, `user`):

Run via Render Shell or a one-time command:

```bash
php artisan db:seed --force
```

> [!NOTE]
> The seeders in `DatabaseSeeder.php` use `firstOrCreate` and `updateOrCreate` logic, making them safe to execute without duplicating records.

---

## Deployment Options on Render

### Option A: Automatic Blueprint Deployment (`render.yaml`)

1. Connect your GitHub repository to Render.
2. Select **New +** → **Blueprint**.
3. Render automatically detects `render.yaml` in the root repository.
4. Supply the sync environment variables (`DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, `APP_URL`).
5. Render will automatically build the Docker image and deploy.

### Option B: Manual Web Service Setup

1. Go to **Render Dashboard** → **New +** → **Web Service**.
2. Select repository: `Digital-Material-Requisition-System`.
3. Choose **Docker** as environment.
4. Dockerfile path: `./Dockerfile`.
5. Pre-Deploy Command: `php artisan migrate --force`.
6. Health Check Path: `/health`.
7. Fill in all Environment Variables as listed above.
8. Click **Create Web Service**.

---

## Ephemeral Filesystem & File Storage

> [!IMPORTANT]
> Render containers operate on an **ephemeral filesystem**.
> - Temporary report exports (PDF / Excel downloads) are generated dynamically and served directly via HTTP responses, which works seamlessly.
> - If permanent file uploads (e.g., uploaded attachments or signatures) are required in future features, configure an S3-compatible object storage disk (e.g. AWS S3, Cloudflare R2, or Supabase Storage).

---

## Health Check Endpoint

Render monitors application availability via the lightweight `/health` endpoint:

- **URL**: `GET /health`
- **Response**: `200 OK`
- **Body**: `{"status": "ok"}`

This endpoint avoids database queries so container availability is independent of database latency or connection pool fluctuations.

---

## Rollback Procedure

If a deployment encounters an error:

1. **Application Rollback**:
   - In Render Dashboard, navigate to **Deploys**.
   - Select a previous successful build and click **Rollback to this deploy**.

2. **Database Migration Rollback (If needed)**:
   - Access Render Shell.
   - Run: `php artisan migrate:rollback --step=1` (Inspect affected tables first).

---

## Verification & Smoke Test Checklist

- [ ] Web Service boots and passes `/health` check (`HTTP 200`).
- [ ] HTTPS is enforced automatically by Render.
- [ ] Login screen is accessible at `/login`.
- [ ] Log in with initial seeded credentials (`admin` / `admin`).
- [ ] Verify Dashboard, Material Request creation, Approvals, Stock, Reports, and Audit Trail.
- [ ] Download PDF and Excel reports to verify dompdf / phpspreadsheet dependencies function correctly in Linux Docker environment.
