<div align="center">

# 💰 KasFlow LPD
### *Financial Transparency & Cash Ledger System for Village Credit Institutions (LPD)*

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployment-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

<p align="center">
  Sistem pencatatan dan transparansi keuangan kas berbasis web untuk mencatat dan memantau dana kas kelompok yang ditempatkan di Lembaga Perkreditan Desa (LPD). Dirancang dengan arsitektur multi-storage (Supabase Cloud PostgreSQL + Local Fallback) serta kontainerisasi Docker.
</p>

</div>

---

## 🌟 Fitur Utama

- 🔐 **Otentikasi Berbasis Peran (Role-Based Access):**
  - **Akses Anggota:** Tampilan transparansi kas real-time (*read-only*) tanpa hambatan.
  - **Akses Pengurus:** Panel otorisasi untuk pencatatan mutasi kas (pemasukan & pengeluaran), edit, serta hapus transaksi.
- 📊 **Transparansi Kas Real-Time:**
  - Tampilan ringkasan saldo akhir kas di rekening LPD.
  - Akumulasi total pemasukan dan pengeluaran kas otomatis.
  - Pemisahan tabel pencatatan mutasi pemasukan dan pengeluaran secara mandiri.
- 🔎 **Pencarian & Penyaringan Data:**
  - Filter transaksi berdasarkan rentang tanggal.
  - Filter transaksi berdasarkan kategori spesifik.
- 🏷️ **Manajemen Kategori Finansial:**
  - **Kategori Pemasukan:** Iuran Anggota, Punia / Sumbangan, Denda, Pemasukan Lainnya.
  - **Kategori Pengeluaran:** Upakara & Sosial, Operasional, Dana Duka, Pengeluaran Lainnya.
- 🖨️ **Ekspor & Cetak Laporan:** Format cetak ramah printer (*print-optimized*) untuk kebutuhan arsip fisik dan rapat pertanggungjawaban.
- ☁️ **Dukungan Multi-Penyimpanan Data:**
  - **Cloud Database:** Terintegrasi dengan **Supabase (PostgreSQL)** untuk persistensi data online real-time.
  - **Local Storage Fallback:** Mendukung penyimpanan berbasis file JSON untuk *offline development*.

---

## 🛠️ Tech Stack & Arsitektur

* **Runtime & Framework:** Node.js, Express.js
* **Database & BaaS:** [Supabase](https://supabase.com/) (PostgreSQL)
* **Frontend:** HTML5, Vanilla JavaScript modern, Tailwind CSS
* **Containerization:** Docker & Docker Compose compatible
* **Deployment:** Vercel Serverless / Cloud Hosting

---

## 📂 Struktur Repositori

```
├── data/
│   └── kas.json             # Penyimpanan lokal cadangan (fallback)
├── public/
│   └── index.html           # Antarmuka web utama responsif
├── .dockerignore            # Aturan pengabaian file Docker
├── .env.example             # Template variabel environment
├── .gitignore               # Aturan pengabaian Git
├── Dockerfile               # Konfigurasi container Docker
├── package.json             # Manifes dependensi Node.js
├── server.js                # Server backend Express & API routing
├── supabase-schema.sql      # Skema DDL tabel PostgreSQL Supabase
└── vercel.json              # Konfigurasi deployment Vercel
```

---

## ⚡ Panduan Instalasi Lokal

### Prasyarat
* Node.js >= 18.x
* NPM

### Langkah-Langkah

1. **Clone Repositori:**
   ```bash
   git clone https://github.com/dekbintang/kas-kelompok-4.git
   cd kas-kelompok-4
   ```

2. **Instal Dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment:**
   Salin berkas konfigurasi environment:
   ```bash
   cp .env.example .env
   ```
   Isi variabel koneksi Supabase Anda:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-anon-or-service-role-key
   PORT=3000
   ```
   *(Opsional: Jika tidak mengisi Supabase credentials, sistem akan otomatis beralih menggunakan local JSON storage di `data/kas.json`)*.

4. **Jalankan Aplikasi:**
   ```bash
   npm run dev
   ```
   Buka peramban web pada: `http://localhost:3000`

### Menjalankan dengan Docker
```bash
docker build -t kasflow-lpd .
docker run -p 3000:3000 --env-file .env kasflow-lpd
```

---

## 👨‍💻 Pengembang

**I Kadek Bintang Adi Bimantara & Tim Kelompok 4**  
*Program Studi Teknologi Informasi — Universitas Udayana*  
* [GitHub Profile](https://github.com/dekbintang)
* [Instagram](https://instagram.com/ikadek_bintang)

---

## 📄 Lisensi
Proyek ini dilisensikan di bawah [Lisensi MIT](LICENSE).
