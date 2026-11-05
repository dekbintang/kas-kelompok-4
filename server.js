const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'kas.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper to read data safely
function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const initial = {
        settings: {
          groupName: "Kelompok 4",
          subTitle: "Kas Tempek / Kelompok 4",
          lpdName: "LPD (Lembaga Perkreditan Desa)",
          adminPin: "1234",
          accountNumberLPD: "LPD-KL4-88921"
        },
        transactions: []
      };
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading kas.json:', err);
    return { settings: { adminPin: '1234' }, transactions: [] };
  }
}

// Helper to write data safely
function writeData(data) {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing kas.json:', err);
    return false;
  }
}

// Middleware to verify Admin PIN
function requireAdmin(req, res, next) {
  const pin = req.headers['x-admin-pin'] || req.body?.pin;
  const db = readData();
  const currentPin = db.settings?.adminPin || '1234';

  if (!pin || String(pin) !== String(currentPin)) {
    return res.status(401).json({ success: false, message: 'PIN Bendahara salah atau tidak valid.' });
  }
  next();
}

// 1. GET Summary & Info (Public - untuk Anggota tanpa klik apapun)
app.get('/api/summary', (req, res) => {
  const db = readData();
  const transactions = db.transactions || [];

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const balance = totalIncome - totalExpense;

  res.json({
    success: true,
    groupName: db.settings?.groupName || 'Kelompok 4',
    subTitle: db.settings?.subTitle || 'Kas Tempek / Kelompok 4',
    lpdName: db.settings?.lpdName || 'LPD (Lembaga Perkreditan Desa)',
    accountNumberLPD: db.settings?.accountNumberLPD || '',
    totalIncome,
    totalExpense,
    balance,
    transactionCount: transactions.length,
    lastUpdated: transactions.length > 0 ? transactions[0].createdAt || transactions[0].date : new Date().toISOString()
  });
});

// 2. GET Transactions list (Public - untuk Anggota)
app.get('/api/transactions', (req, res) => {
  const db = readData();
  const sorted = [...(db.transactions || [])].sort((a, b) => {
    // Sort by date descending, then createdAt descending
    const dateA = new Date(a.date || a.createdAt).getTime();
    const dateB = new Date(b.date || b.createdAt).getTime();
    return dateB - dateA;
  });
  res.json({ success: true, data: sorted });
});

// 3. Auth: Verify PIN Bendahara
app.post('/api/auth/verify-pin', (req, res) => {
  const { pin } = req.body;
  const db = readData();
  const currentPin = db.settings?.adminPin || '1234';

  if (String(pin) === String(currentPin)) {
    return res.json({ success: true, message: 'Autentikasi Bendahara Berhasil' });
  }
  return res.status(401).json({ success: false, message: 'PIN salah' });
});

// 4. Change PIN
app.post('/api/auth/change-pin', requireAdmin, (req, res) => {
  const { newPin } = req.body;
  if (!newPin || String(newPin).length < 4) {
    return res.status(400).json({ success: false, message: 'PIN baru minimal 4 digit angka.' });
  }

  const db = readData();
  db.settings = db.settings || {};
  db.settings.adminPin = String(newPin);
  writeData(db);

  res.json({ success: true, message: 'PIN Bendahara berhasil diperbarui.' });
});

// 5. Tambah Transaksi (Pemasukan / Pengeluaran)
app.post('/api/transactions', requireAdmin, (req, res) => {
  const { type, amount, category, description, date } = req.body;

  if (!type || !amount || !category || !date) {
    return res.status(400).json({ success: false, message: 'Semua field wajib diisi.' });
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Nominal harus angka lebih besar dari 0.' });
  }

  const db = readData();
  const newTransaction = {
    id: 'trx-' + Date.now(),
    date: date,
    type: type === 'expense' ? 'expense' : 'income',
    category: category.trim(),
    amount: numAmount,
    description: (description || '').trim(),
    // Ketentuan khusus: Semua pemasukan tercatat disimpan di LPD
    lpdStatus: type === 'income' ? 'Tersimpan di LPD' : 'Ditarik dari LPD',
    createdAt: new Date().toISOString()
  };

  db.transactions = db.transactions || [];
  db.transactions.unshift(newTransaction);
  writeData(db);

  res.status(201).json({ success: true, message: 'Transaksi berhasil ditambahkan.', data: newTransaction });
});

// 6. Hapus Transaksi
app.delete('/api/transactions/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = readData();

  const initialLength = (db.transactions || []).length;
  db.transactions = (db.transactions || []).filter(t => t.id !== id);

  if (db.transactions.length === initialLength) {
    return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan.' });
  }

  writeData(db);
  res.json({ success: true, message: 'Transaksi berhasil dihapus.' });
});

// 7. Edit Transaksi
app.put('/api/transactions/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { type, amount, category, description, date } = req.body;

  const db = readData();
  const index = (db.transactions || []).findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan.' });
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Nominal harus angka lebih besar dari 0.' });
  }

  db.transactions[index] = {
    ...db.transactions[index],
    type: type === 'expense' ? 'expense' : 'income',
    amount: numAmount,
    category: category.trim(),
    description: (description || '').trim(),
    date: date,
    lpdStatus: type === 'income' ? 'Tersimpan di LPD' : 'Ditarik dari LPD',
    updatedAt: new Date().toISOString()
  };

  writeData(db);
  res.json({ success: true, message: 'Transaksi berhasil diperbarui.', data: db.transactions[index] });
});

// Export app for serverless (Vercel) & start standalone server if run directly
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server Kas Kelompok 4 berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;
