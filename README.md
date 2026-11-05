# Sistem Informasi Buku Kas Kelompok 4

Sistem pencatatan dan transparansi keuangan kas berbasis web untuk mencatat dan memantau dana kas Kelompok 4 yang disimpan di Lembaga Perkreditan Desa (LPD). Aplikasi dirancang dengan antarmuka yang bersih, formal, dan responsif untuk memudahkan pemantauan keuangan secara real-time.

---

## Fitur Utama

- **Otentikasi Berbasis Peran (Role-Based Access):**
  - Akses Anggota: Tampilan transparansi kas real-time (*read-only*).
  - Akses Pengurus: Pencatatan mutasi kas (pemasukan dan pengeluaran), pengeditan, serta penghapusan data transaksi.
- **Transparansi Kas Real-Time:**
  - Tampilan ringkasan saldo akhir kas di LPD.
  - Akumulasi total pemasukan dan pengeluaran kas.
  - Pemisahan tabel pencatatan mutasi pemasukan dan pengeluaran secara mandiri.
- **Pencarian & Penyaringan Data:**
  - Filter transaksi berdasarkan tanggal tertentu.
  - Filter transaksi berdasarkan kategori spesifik.
- **Manajemen Mutasi Terstruktur:**
  - Kategori Pemasukan: Iuran Anggota, Punia / Sumbangan, Denda, Pemasukan Lainnya.
  - Kategori Pengeluaran: Upakara & Sosial, Operasional, Dana Duka, Pengeluaran Lainnya.
- **Ekspor & Cetak Laporan:**
  - Format cetak ramah printer (*print-optimized*) untuk kebutuhan arsip dan pelaporan fisik.
- **Dukungan Multi-Penyimpanan Data:**
  - Cloud Database: Terintegrasi dengan Supabase (PostgreSQL) untuk persistensi data online.
  - Local Storage: Mendukung penyimpanan berbasis file JSON untuk lingkungan pengembangan.

---

## Teknologi yang Digunakan

- **Backend:** Node.js, Express.js
- **Database:** Supabase (PostgreSQL) / File Storage Lokal
- **Frontend:** HTML5, Vanilla JavaScript, Tailwind CSS
- **Deployment Platform:** Vercel / Render / Docker Container

---

## Struktur Direktori

```
├── data/
│   └── kas.json             # Penyimpanan lokal cadangan
├── public/
│   └── index.html           # Antarmuka web utama
├── .dockerignore            # Aturan pengabaian file Docker
├── .env.example             # Template konfigurasi environment variable
├── .gitignore               # Aturan pengabaian file Git
├── Dockerfile               # Konfigurasi container Docker
├── package.json             # Manifes dependensi Node.js
├── server.js                # Server backend Express & REST API
├── supabase-schema.sql      # Skema database PostgreSQL untuk Supabase
└── vercel.json              # Konfigurasi deployment Vercel
```

---

## Menjalankan di Lingkungan Lokal

### 1. Prasyarat
- Node.js versi 18 atau yang lebih baru.
- npm (Node Package Manager).

### 2. Instalasi Dependensi
Jalankan perintah berikut pada terminal:
```bash
npm install
```

### 3. Konfigurasi Lingkungan
Salin file `.env.example` menjadi `.env` dan lengkapi variabel yang dibutuhkan jika menggunakan database cloud:
```bash
cp .env.example .env
```

### 4. Menjalankan Aplikasi
```bash
npm start
```
Aplikasi akan aktif dan dapat diakses melalui browser pada port lokal yang ditentukan (default: port 3000).

---

## Panduan Deployment

### Deployment ke Vercel
1. Hubungkan repositori Git ke proyek baru di dashboard penyedia hosting.
2. Daftarkan Environment Variables berikut pada pengaturan proyek:
   - `SUPABASE_URL`: URL endpoint proyek database.
   - `SUPABASE_KEY`: Kunci API proyek database.
   - `STORAGE_MODE`: Diisi dengan nilai `supabase`.
3. Jalankan proses deployment.

### Deployment Menggunakan Docker
```bash
docker build -t kas-kelompok4 .
docker run -p 3000:3000 kas-kelompok4
```

---

## Keamanan Data
- Kredensial dan kunci autentikasi tidak disimpan di dalam repositori publik.
- Pengaturan hak akses dan PIN dikelola secara terpusat melalui database.
- Seluruh komunikasi data pada lingkungan produksi menggunakan protokol aman HTTPS.
