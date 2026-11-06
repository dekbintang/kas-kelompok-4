# KasFlow — Buku Kas LPD

Sistem pencatatan dan transparansi keuangan kas berbasis web. Mencatat dan memantau dana kas yang disimpan di Lembaga Perkreditan Desa (LPD) dengan dukungan multi-storage (Supabase cloud / JSON lokal).

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** Supabase (PostgreSQL) / JSON file fallback
- **Frontend:** HTML5, Vanilla JS, Tailwind CSS
- **Deploy:** Vercel / Docker

## Fitur

- Otentikasi berbasis PIN (peran Pengurus dan Anggota)
- Pencatatan mutasi pemasukan dan pengeluaran kas
- Ringkasan saldo, total pemasukan, total pengeluaran
- Filter transaksi berdasarkan tanggal dan kategori
- Cetak laporan (format ramah printer)
- Fallback ke penyimpanan JSON lokal jika Supabase tidak dikonfigurasi

## Setup

```bash
git clone https://github.com/dekbintang/kas-kelompok-4.git
cd kas-kelompok-4
npm install
cp .env.example .env
```

Isi kredensial Supabase di `.env` (opsional — tanpa Supabase, sistem menggunakan `data/kas.json`):

```bash
npm run dev
```

Buka `http://localhost:3000`.

### Docker

```bash
docker build -t kasflow .
docker run -p 3000:3000 --env-file .env kasflow
```

## Lisensi

[MIT](LICENSE)
