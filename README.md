# 🏦 Sistem Pencatatan Kas Kelompok 4
> Sistem Transparansi Kas & Penempatan Dana LPD (Lembaga Perkreditan Desa) dengan Tampilan **Zero-Click** untuk Anggota.

---

## 🌟 Fitur Utama

1. **Dashboard Zero-Click untuk Anggota:**
   - Anggota cukup membuka link web, **tanpa perlu memencet tombol atau ikon apa pun**.
   - Langsung menampilkan:
     - 💳 **Saldo Kas Terkini di LPD** (Font besar & status rekening).
     - 📈 **Total Pemasukan** (Semua tercatat ditempatkan di LPD).
     - 📉 **Total Pengeluaran** (Rincian belanja/kegiatan).
     - 📜 **Daftar Mutasi / Riwayat Transaksi** tersaji langsung di layar utama secara berurutan.
2. **Akses Khusus Bendahara (PIN Protected):**
   - Tombol bendahara di pojok kanan atas.
   - Dilindungi PIN keamanan (Default: `1234`, dapat diganti langsung di aplikasi).
   - Form Tambah Pemasukan (otomatis masuk ke rekening LPD).
   - Form Tambah Pengeluaran.
   - Fitur Edit & Hapus transaksi.
3. **Cetak & Ekspor Laporan:**
   - Tombol Cetak / Simpan PDF yang otomatis diformat rapi untuk arsip fisik atau tanda tangan pengurus.

---

## 🚀 Cara Menjalankan di Komputer Lokal

1. **Buka Terminal / Command Prompt** di folder ini (`c:\Tempek 4`).
2. Jalankan perintah:
   ```bash
   npm start
   ```
3. Buka browser di HP atau Laptop:
   ```
   http://localhost:3000
   ```

---

## 🌐 Panduan Deploy ke Internet (Bisa Dibuka Seluruh Anggota di WhatsApp)

### Opsi 1: Deploy ke Vercel (Paling Populer & Gratis)
File konfigurasi `vercel.json` sudah disiapkan.
1. Buat akun di [Vercel](https://vercel.com).
2. Upload folder ini ke GitHub atau deploy langsung menggunakan Vercel CLI:
   ```bash
   npm i -g vercel
   vercel
   ```
3. Web Anda langsung aktif dan memiliki link (contoh: `https://kas-kelompok4.vercel.app`) yang siap dibagikan ke grup WhatsApp.

### Opsi 2: Deploy ke Render (Gratis & Mendukung Penyimpanan File Permanen)
1. Buat akun di [Render.com](https://render.com).
2. Pilih **New Web Service** -> Hubungkan dengan repositori GitHub Anda.
3. Konfigurasi:
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Klik **Deploy Web Service**.

### Opsi 3: Deploy Menggunakan Docker
File `Dockerfile` sudah tersedia:
```bash
docker build -t kas-kelompok4 .
docker run -p 3000:3000 kas-kelompok4
```

---

## 🔐 Informasi Akun Pengurus / Bendahara
* **Default PIN:** `1234`
* Cara login: Klik tombol **Bendahara** di kanan atas header, masukkan PIN `1234`.
* Untuk mengganti PIN: Setelah login, klik tautan **Ganti PIN** pada panel bendahara.

---

## 📁 Struktur Berkas
```
├── server.js            # Backend API Express & kalkulasi kas
├── vercel.json          # Konfigurasi deploy ke Vercel
├── Dockerfile           # Konfigurasi container deploy
├── package.json         # Konfigurasi Node.js & dependencies
├── data/
│   └── kas.json         # Penyimpanan data saldo & riwayat transaksi
└── public/
    └── index.html       # Tampilan frontend responsif (Zero-Click Dashboard)
```

