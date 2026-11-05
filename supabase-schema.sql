-- =============================================
-- SUPABASE SQL SCHEMA: Buku Kas Kelompok 4
-- =============================================
-- Jalankan script ini di Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Tabel Transaksi Kas
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY DEFAULT ('trx-' || extract(epoch from now())::bigint::text || '-' || floor(random() * 1000)::int::text),
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabel Pengaturan (Pengaturan Umum & Kredensial)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- 3. Data Awal Konfigurasi
-- Nilai PIN dapat diatur langsung melalui menu Table Editor di dashboard Supabase
INSERT INTO settings (key, value) VALUES
  ('group_name', 'Kelompok 4'),
  ('sub_title', 'Buku Kas Kelompok 4'),
  ('lpd_name', 'LPD'),
  ('lpd_account', 'LPD-KL4-88921'),
  ('member_pin', '0000'),
  ('admin_pin', '0000')
ON CONFLICT (key) DO NOTHING;
