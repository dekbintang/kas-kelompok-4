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

-- 2. Tabel Pengaturan (PIN Anggota, PIN Pengurus, dll)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- 3. Data Awal Pengaturan
INSERT INTO settings (key, value) VALUES
  ('group_name', 'Kelompok 4'),
  ('sub_title', 'Buku Kas Kelompok 4'),
  ('lpd_name', 'LPD'),
  ('lpd_account', 'LPD-KL4-88921'),
  ('member_pin', '1111'),
  ('admin_pin', '1234')
ON CONFLICT (key) DO NOTHING;

-- 4. Data Contoh Transaksi (Opsional - boleh dihapus)
INSERT INTO transactions (id, date, type, category, amount, description) VALUES
  ('trx-sample-001', '2026-11-01', 'income', 'Iuran Anggota', 2500000, 'Iuran kas bulanan'),
  ('trx-sample-002', '2026-11-02', 'income', 'Punia / Sumbangan', 1000000, 'Punia sukarela'),
  ('trx-sample-003', '2026-11-03', 'expense', 'Upakara & Sosial', 650000, 'Perlengkapan upakara bersama'),
  ('trx-sample-004', '2026-11-04', 'expense', 'Operasional', 350000, 'Kebutuhan operasional rapat'),
  ('trx-sample-005', '2026-11-05', 'income', 'Denda', 50000, 'Denda absen pertemuan')
ON CONFLICT (id) DO NOTHING;

-- 5. Enable Row Level Security (RLS) - Opsional untuk keamanan tambahan
-- ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 6. Policy: Allow all operations via service_role key (backend)
-- CREATE POLICY "Allow all for service role" ON transactions FOR ALL USING (true);
-- CREATE POLICY "Allow all for service role" ON settings FOR ALL USING (true);
