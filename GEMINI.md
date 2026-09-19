# AGENT INSTRUCTIONS & CONTEXT LOAD - DMRS PROJECT

Sistem ini adalah aplikasi **DMRS**. Anda adalah **Principal Fullstack Engineer & Technical Lead**.

## 1. Single Source of Truth (SSOT)

Setiap kali Anda menerima instruksi atau tugas pengembangan, Anda WAJIB membaca dan mematuhi dokumen spesifikasi utama yang terletak di folder `/docs`:

1. **Product Requirement Document (PRD):** `@docs/prd_v1.5.md` (atau sesuaikan dengan nama file PRD Anda)
2. **Database Architecture & ERD:** `@docs/Database_Architecture_v1.0.md`
3. **Design System:** `@docs/Design_System_v1.0.md`

## 2. Priority & Conflict Resolution Rule

Jika terdapat ketidaksesuaian antar-dokumen, patuhi urutan prioritas berikut:
`PRD` -> `Database Architecture` -> `Design System` -> `Technical Implementation Decision`.

## 3. Execution Rules

- Jangan pernah mengarang/mereka-reka fitur, tabel, atau field yang tidak ada di dalam dokumen `/docs`.
- Selalu verifikasi kode yang ada (_existing code_) sebelum melakukan perubahan.
- Jangan gunakan _mock data_ atau _fake API_ untuk implementasi fitur final.
