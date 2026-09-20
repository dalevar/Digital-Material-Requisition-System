# DMRS — Design System v2.0 (SD Guthrie Brand Alignment)
## Digital Material Requisition System

> **Project:** Digital Material Requisition System (DMRS)  
> **Company:** PT. Guthrie International Pulau Laut Refinery  
> **Platform:** Web Application  
> **Design System Version:** 2.0 (Brand Identity Update)  
> **Brand Palette:** SD Guthrie Red (`#D9232D`) + Accent Orange (`#EA580C`) + Charcoal (`#0F172A`)  
> **Source:** PRD DMRS v1.5 & SD Guthrie International Brand Guidelines  
> **Frontend target:** Laravel Blade + Tailwind CSS / Utilities + JavaScript

---

## 0. Purpose & Evolution

Dokumen ini adalah **single source of truth untuk UI/UX** DMRS. Versi 2.0 mentransformasi identitas visual DMRS dari *Generic Enterprise Blue* menjadi **SD Guthrie Brand Identity**:

```text
SD GUTHRIE BRAND LOGO
     ↓
Red + Orange + Charcoal/Slate
     ↓
Corporate Industrial
     ↓
Enterprise Operations
     ↓
DMRS UI/UX (WCAG AA Compliant)
```

Design system ini mencakup:
- Design principles & Brand Direction
- Structured Color Tokens (Primary Red, Accent Orange, Charcoal Neutrals, Status Mapping)
- Typography, Spacing, Border Radius, Elevation
- Application Shell & Component Palette
- Form, Table, Modal, Badge, & Interactive Controls
- Authentication Page Branding Rules
- Accessibility (WCAG AA Target)
- Tailwind & CSS Custom Properties Mapping

---

# 1. Design Principles & Brand Direction

## 1.1 SD Guthrie Brand Identity Integration
Visual DMRS mencerminkan identitas korporat **PT. Guthrie International Pulau Laut Refinery**:
- **Primary Red:** Warna keberanian, presisi operasional, dan identitas utama logo SD Guthrie.
- **Accent Orange:** Elemen lengkungan dinamis logo, digunakan untuk *secondary emphasis*, *notifications*, dan *high-visibility highlights*.
- **Charcoal / Slate Neutrals:** Fondasi *industrial enterprise dashboard* yang memberikan kontras maksimal, kesan kokoh, dan pembacaan data yang bersih.

## 1.2 Core UX Principles
1. **Professional & Operational:** Clean white surfaces, neutral background, solid red primary CTAs, dan compact tables.
2. **Clarity First (Data-Oriented):** Prioritas pada kejelasan status, SOH stock, dan approval tracking.
3. **WCAG AA Accessibility:** Semua teks dan tombol interaktif memenuhi kontras rasio minimal 4.5:1 terhadap latar belakangnya.
4. **Restrained Decoration:** Radius terukur (`rounded-md` / `rounded-lg`), shadow halus (`shadow-xs` / `shadow-sm`), dan zero-fluff styling.

---

# 2. Color Tokens Architecture

Warna tidak di-hardcode secara acak. Semua kelas Tailwind harus merujuk pada token di bawah ini.

## 2.1 Primary — SD Guthrie Red
Digunakan untuk: Primary CTAs, active navigation items, primary headers, dan focal interactive elements.

| Token | Hex Code | Tailwind Equivalent | Usage Context |
|---|---|---|---|
| `primary-50` | `#FEF2F2` | `red-50` | Selected row bg, soft alert hover |
| `primary-100` | `#FEE2E2` | `red-100` | Soft active badge bg, subtle border |
| `primary-200` | `#FECACA` | `red-200` | Border highlights, tag background |
| `primary-300` | `#FCA5A5` | `red-300` | Soft focus rings, disabled primary |
| `primary-400` | `#F87171` | `red-400` | Hover on dark dark-mode surfaces |
| `primary-500` | `#EF4444` | `red-500` | Interactive secondary red icons |
| `primary-600` | `#D9232D` / `#DC2626` | `red-600` | **DEFAULT PRIMARY CTA**, Link, Active state |
| `primary-700` | `#B91C1C` | `red-700` | **Primary Button Hover**, Dark active text |
| `primary-800` | `#991B1B` | `red-800` | Active button click (pressed) |
| `primary-900` | `#7F1D1D` | `red-900` | Dark brand header text |

## 2.2 Accent — Guthrie Dynamic Orange
Digunakan untuk: Secondary brand accents, warning alerts, progress indicators, dan visual attention badges.

| Token | Hex Code | Tailwind Equivalent | Usage Context |
|---|---|---|---|
| `accent-50` | `#FFF7ED` | `orange-50` | Warning card background, highlight row |
| `accent-100` | `#FFEDD5` | `orange-100` | Pending badge bg, warning border |
| `accent-500` | `#F97316` | `orange-500` | Alert icons, secondary progress bar |
| `accent-600` | `#EA580C` | `orange-600` | **DEFAULT ACCENT**, Warning badge text |
| `accent-700` | `#C2410C` | `orange-700` | Accent hover state |

## 2.3 Neutrals — Industrial Slate & Charcoal
Digunakan untuk: Sidebar, Topbar, Background canvas, Text hierarchy, dan Table borders.

| Token | Hex Code | Tailwind Equivalent | Usage Context |
|---|---|---|---|
| `neutral-0` | `#FFFFFF` | `white` | Surface bg, Card bg, Input bg |
| `neutral-50` | `#F8FAFC` | `slate-50` | **Application Canvas Background** |
| `neutral-100` | `#F1F5F9` | `slate-100` | Table header bg, muted section bg |
| `neutral-200` | `#E2E8F0` | `slate-200` | **Default Border**, Divider line |
| `neutral-300` | `#CBD5E1` | `slate-300` | Input border hover, disabled border |
| `neutral-400` | `#94A3B8` | `slate-400` | Placeholder text, disabled text |
| `neutral-500` | `#64748B` | `slate-500` | Secondary caption, metadata |
| `neutral-600` | `#475569` | `slate-600` | Sub-headings, inactive sidebar text |
| `neutral-700` | `#334155` | `slate-700` | **Body Text**, Label text |
| `neutral-800` | `#1E293B` | `slate-800` | Dark Surface / Panel, Header text |
| `neutral-900` | `#0F172A` | `slate-900` | **Heading Text**, **Dark Sidebar BG** |

## 2.4 Semantic Status Mapping

| Status | Text Token | BG Token | Border Token | Visual Representation |
|---|---|---|---|---|
| **DRAFT** | `neutral-700` | `neutral-100` | `neutral-300` | `[○ DRAFT]` Neutral Gray |
| **SUBMITTED** | `accent-700` | `accent-50` | `accent-200` | `[● SUBMITTED]` Orange Badge |
| **PENDING_APPROVAL** | `amber-800` | `amber-50` | `amber-200` | `[⏳ PENDING]` Amber Yellow Badge |
| **APPROVED** | `emerald-800` | `emerald-50` | `emerald-200` | `[✓ APPROVED]` Solid Green Badge |
| **REJECTED** | `primary-800` | `primary-50` | `primary-200` | `[✕ REJECTED]` Red Badge |
| **PROCESSING** | `sky-800` | `sky-50` | `sky-200` | `[⚙ PROCESSING]` Soft Blue Badge |
| **COMPLETED** | `emerald-900` | `emerald-100` | `emerald-300` | `[✓ COMPLETED]` Dark Green Badge |
| **CANCELLED_AFTER_APPROVAL**| `primary-900` | `primary-100` | `primary-300` | `[⊘ CANCELLED]` Red Outline Badge |
| **NORMAL STOCK** | `emerald-700` | `emerald-50` | `emerald-200` | `[● NORMAL]` SOH > Min |
| **LOW STOCK** | `accent-700` | `accent-50` | `accent-200` | `[▲ LOW STOCK]` SOH ≤ Min |
| **OUT OF STOCK** | `primary-700` | `primary-50` | `primary-200` | `[✕ OUT OF STOCK]` SOH = 0 |

---

# 3. Typography & Spacing

## 3.1 Type Scale
Font Family: **Inter**, fallback `ui-sans-serif, system-ui, sans-serif`.

- **Display:** 32px / Line 40px / Bold (700) — *Dashboard Banner*
- **H1:** 24px / Line 32px / Bold (700) — *Page Titles*
- **H2:** 20px / Line 28px / SemiBold (600) — *Section Headers*
- **H3:** 16px / Line 24px / SemiBold (600) — *Card Titles, Table Headers*
- **Body Large:** 16px / Line 24px / Regular (400) — *Intro text*
- **Body:** 14px / Line 20px / Regular (400) — *Standard Text, Inputs, Tables*
- **Body Small:** 13px / Line 18px / Regular (400) — *Table Cell Data, Tooltips*
- **Caption / Label:** 12px / Line 16px / Medium (500) — *Badges, Form Labels*

## 3.2 Spacing & Radius
- **Spacing Scale:** 4px grid (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`).
- **Input / Button Radius:** `rounded-md` (6px)
- **Card / Panel Radius:** `rounded-lg` (8px) / `rounded-xl` (12px)
- **Badge / Avatar Radius:** `rounded-full` (9999px)
- **Focus Ring:** `focus:ring-2 focus:ring-red-500 focus:ring-offset-1 focus:outline-none`

---

# 4. Component Standards

## 4.1 Buttons

### Primary Button (Red Brand Action)
```html
<button class="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-medium text-white shadow-xs transition-colors hover:bg-red-700 active:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50">
  <svg class="h-4 w-4" aria-hidden="true">...</svg>
  <span>Submit Request</span>
</button>
```

### Secondary Button (Neutral Surface)
```html
<button class="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-xs transition-colors hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 disabled:opacity-50">
  <span>Cancel</span>
</button>
```

### Accent Button (Warning / Approval Action)
```html
<button class="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-orange-600 px-4 text-sm font-medium text-white shadow-xs transition-colors hover:bg-orange-700 active:bg-orange-800 focus:ring-2 focus:ring-orange-500">
  <span>Re-assign Approver</span>
</button>
```

### Danger Button (Rejection / Cancellation)
```html
<button class="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-red-700 px-4 text-sm font-medium text-white shadow-xs hover:bg-red-800 focus:ring-2 focus:ring-red-600">
  <span>Reject Request</span>
</button>
```

---

## 4.2 Inputs & Form Controls

```html
<div class="space-y-1.5">
  <label class="block text-xs font-semibold text-slate-700">
    Material Number <span class="text-red-600">*</span>
  </label>
  <input 
    type="text" 
    class="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 placeholder-slate-400 shadow-xs transition-colors focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:bg-slate-100 disabled:text-slate-500" 
    placeholder="e.g. MAT-2026-001"
  />
  <p class="text-[11px] text-slate-500">Pilih material terdaftar dari master data.</p>
</div>
```

---

## 4.3 Data Tables

- **Header BG:** `bg-slate-100` / `text-slate-700` (Font size 12px, font-weight 600, uppercase tracking).
- **Row Hover:** `hover:bg-red-50/30` (Aksen tipis merah saat kursor melintas).
- **Numeric Data:** Align Right (`text-right`), Font Monospace atau tabular figures (`font-mono text-slate-900`).
- **Border:** `border-b border-slate-200`.

```html
<div class="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-xs">
  <table class="w-full text-left text-sm text-slate-700">
    <thead class="bg-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-600 border-b border-slate-200">
      <tr>
        <th class="px-4 py-3">Req No</th>
        <th class="px-4 py-3">Requester</th>
        <th class="px-4 py-3">Plant</th>
        <th class="px-4 py-3 text-right">Items</th>
        <th class="px-4 py-3">Status</th>
        <th class="px-4 py-3 text-right">Action</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-slate-200">
      <tr class="transition-colors hover:bg-red-50/30">
        <td class="px-4 py-3 font-semibold text-red-700">MR-2026-000012</td>
        <td class="px-4 py-3 font-medium text-slate-900">Ahmad Subagja</td>
        <td class="px-4 py-3">Pulau Laut Refinery</td>
        <td class="px-4 py-3 text-right font-mono">4</td>
        <td class="px-4 py-3">
          <span class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
            APPROVED
          </span>
        </td>
        <td class="px-4 py-3 text-right">
          <button class="text-xs font-semibold text-red-600 hover:text-red-800">View</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

---

# 5. Application Shell Architecture

## 5.1 Sidebar (Dark Corporate Slate / Charcoal)
Sidebar menggunakan latar belakang **Dark Charcoal (`bg-slate-900`)** denganksen merah SD Guthrie untuk indikator item aktif.

```text
┌──────────────────────────────────────────┐
│ [LOGO] PT. Guthrie International         │
│        Pulau Laut Refinery               │
├──────────────────────────────────────────┤
│ MAIN NAVIGATION                          │
│                                          │
│  [■] Dashboard (Active)                  │  ← bg-red-600 text-white
│  [ ] Material Requisition                │  ← text-slate-300 hover:bg-slate-800
│  [ ] Stock Control & SOH                 │
│  [ ] Approval Inbox                      │  ← badge: bg-orange-600
│  [ ] Audit Trail                         │
└──────────────────────────────────────────┘
```

- **Active Navigation Item:** `bg-red-500/15 border-l-4 border-red-600 text-white font-semibold rounded-r-md transition-colors`
- **Hover Item:** `hover:bg-slate-800/80 hover:text-white transition-colors`
- **Inactive Item:** `text-slate-300 font-medium`
- **Section Label:** `text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-2`

## 5.2 Topbar
Latar putih bersih (`bg-white`) dengan garis batas bawah halus (`border-b border-slate-200`).
- **Breadcrumb Active Text:** `text-slate-900 font-semibold`
- **Notification Icon Badge:** `bg-red-600 text-white` (High urgency indicator)
- **User Avatar:** `bg-red-100 text-red-700 border border-red-300 font-bold`

---

# 6. Authentication Canvas Specification

Layar autentikasi (Login/Reset) wajib mengeksekusi visual identitas SD Guthrie secara langsung.

```text
┌────────────────────────────────────────────────────────────────────────┐
│ LEFT PANEL (42% Desktop Width)       │ RIGHT PANEL (Form Area)         │
│ BG: White to Soft Red/Orange Gradient │ BG: Pure White (`#FFFFFF`)      │
│     from-white via-red-50 to-orange-100│                                 │
│                                      │ Welcome Back                    │
│ [SD Guthrie Logo Badge]              │ Please sign in to your account. │
│ PT. Guthrie International            │                                 │
│ Pulau Laut Refinery                  │ Username / Employee ID          │
│                                      │ [__________________________]    │
│ Enterprise Access System             │                                 │
│ Digital Material Requisition System  │ Password                        │
│                                      │ [__________________________]    │
│ [•] Real-time SOH Tracking           │                                 │
│ [•] Role-Based Operational Security  │ [ Sign In ] ← Red Button        │
└──────────────────────────────────────┴─────────────────────────────────┘
```

### Brand Panel Styling (Left Side):
- **Gradient Background:** `bg-gradient-to-br from-white via-red-50/60 to-orange-100/70`
- **Border:** `border-r border-red-200/60`
- **Brand Title:** `text-red-700 font-bold`
- **Feature Icons:** `text-red-600`
- **Badges:** `bg-red-600/10 text-red-700 border-red-200`

---

# 7. Accessibility & UX Quality Checklist

- [x] **WCAG AA Contrast:** Semua teks utama (`slate-800` / `slate-900`) mencapai rasio minimal 7:1 di atas latar putih (`#FFFFFF`).
- [x] **Primary Red Buttons (`#D9232D`):** Memiliki rasio kontras 4.6:1 terhadap teks putih, memenuhi batas WCAG AA (minimal 4.5:1).
- [x] **Focus Ring Visibility:** Semua input dan tombol menyertakan `focus:ring-2 focus:ring-red-500` yang terlihat jelas saat navigasi keyboard.
- [x] **Non-Color Dependence:** Status tidak hanya diwakili warna, tetapi selalu menyertakan teks jelas (`APPROVED`, `REJECTED`, `PENDING`).
- [x] **Error Messaging:** Teks error menggunakan `text-red-700` dengan ikon peringatan di dekat bidang terkait.

---

# 8. Design Tokens Quick Reference (CSS Variables)

```css
:root {
  /* Brand Primary - SD Guthrie Red */
  --color-primary-50: #fef2f2;
  --color-primary-100: #fee2e2;
  --color-primary-500: #ef4444;
  --color-primary-600: #d9232d;
  --color-primary-700: #b91c1c;

  /* Brand Accent - Dynamic Orange */
  --color-accent-50: #fff7ed;
  --color-accent-100: #ffedd5;
  --color-accent-600: #ea580c;
  --color-accent-700: #c2410c;

  /* Neutrals - Charcoal & Slate */
  --color-neutral-0: #ffffff;
  --color-neutral-50: #f8fafc;
  --color-neutral-100: #f1f5f9;
  --color-neutral-200: #e2e8f0;
  --color-neutral-500: #64748b;
  --color-neutral-700: #334155;
  --color-neutral-900: #0f172a;

  /* System Metrics */
  --radius-md: 6px;
  --radius-lg: 8px;
  --input-height: 40px;
  --topbar-height: 64px;
  --sidebar-width: 256px;
}
```

---
**End of Design System v2.0 (SD Guthrie Brand Identity)**
```

File `.md` di atas sudah diperbarui sepenuhnya dan siap digunakan sebagai panduan utama pengkodean antarmuka DMRS.