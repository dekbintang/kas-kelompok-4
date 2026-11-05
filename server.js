const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'kas.json');

// Storage mode: 'supabase' or 'file'
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;
const isSupabaseConfigured = Boolean(process.env.SUPABASE_URL && supabaseKey);
const STORAGE_MODE = process.env.STORAGE_MODE || (isSupabaseConfigured ? 'supabase' : 'file');

// Supabase client (only initialized if STORAGE_MODE === 'supabase')
let supabase = null;
if (STORAGE_MODE === 'supabase' && isSupabaseConfigured) {
  supabase = createClient(process.env.SUPABASE_URL, supabaseKey);
  console.log('Mode penyimpanan: Supabase');
} else {
  console.log('Mode penyimpanan: File lokal (data/kas.json)');
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// FILE-BASED STORAGE (Fallback / Development)
// ============================================================
function readFileData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const initial = {
        settings: {
          groupName: 'Kelompok 4',
          subTitle: 'Buku Kas Kelompok 4',
          lpdName: 'LPD',
          adminPin: '1234',
          memberPin: '1111',
          accountNumberLPD: 'LPD-KL4-88921'
        },
        transactions: []
      };
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (err) {
    console.error('Error reading file:', err);
    return { settings: { adminPin: '1234', memberPin: '1111' }, transactions: [] };
  }
}

function writeFileData(data) {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing file:', err);
    return false;
  }
}

// ============================================================
// SUPABASE STORAGE HELPERS
// ============================================================
async function sbGetSetting(key) {
  const { data } = await supabase.from('settings').select('value').eq('key', key).single();
  return data ? data.value : null;
}

async function sbSetSetting(key, value) {
  await supabase.from('settings').upsert({ key, value: String(value) });
}

async function sbGetTransactions() {
  const { data } = await supabase.from('transactions').select('*').order('date', { ascending: false });
  return (data || []).map(t => ({
    id: t.id,
    date: t.date,
    type: t.type,
    category: t.category,
    amount: Number(t.amount),
    description: t.description || '',
    createdAt: t.created_at,
    updatedAt: t.updated_at
  }));
}

async function sbGetSummary() {
  const transactions = await sbGetTransactions();
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  return {
    groupName: await sbGetSetting('group_name') || 'Kelompok 4',
    subTitle: await sbGetSetting('sub_title') || 'Buku Kas Kelompok 4',
    lpdName: await sbGetSetting('lpd_name') || 'LPD',
    accountNumberLPD: await sbGetSetting('lpd_account') || '',
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    transactionCount: transactions.length,
    lastUpdated: transactions.length > 0 ? transactions[0].createdAt : new Date().toISOString()
  };
}

// ============================================================
// MIDDLEWARE: Verify PIN
// ============================================================
async function requireAdmin(req, res, next) {
  const pin = req.headers['x-admin-pin'] || req.body?.pin;

  let currentPin;
  if (supabase) {
    currentPin = await sbGetSetting('admin_pin') || '1234';
  } else {
    const db = readFileData();
    currentPin = db.settings?.adminPin || '1234';
  }

  if (!pin || String(pin) !== String(currentPin)) {
    return res.status(401).json({ success: false, message: 'PIN Pengurus salah.' });
  }
  next();
}

// ============================================================
// API ROUTES
// ============================================================

// Verify Member PIN (Anggota)
app.post('/api/auth/member', async (req, res) => {
  const { pin } = req.body;
  let currentPin;

  if (supabase) {
    currentPin = await sbGetSetting('member_pin') || '1111';
  } else {
    const db = readFileData();
    currentPin = db.settings?.memberPin || '1111';
  }

  if (String(pin) === String(currentPin)) {
    return res.json({ success: true, role: 'member' });
  }
  return res.status(401).json({ success: false, message: 'PIN Anggota salah.' });
});

// Verify Admin PIN (Pengurus)
app.post('/api/auth/verify-pin', async (req, res) => {
  const { pin } = req.body;
  let currentPin;

  if (supabase) {
    currentPin = await sbGetSetting('admin_pin') || '1234';
  } else {
    const db = readFileData();
    currentPin = db.settings?.adminPin || '1234';
  }

  if (String(pin) === String(currentPin)) {
    return res.json({ success: true, role: 'admin' });
  }
  return res.status(401).json({ success: false, message: 'PIN Pengurus salah.' });
});

// Change PIN (Admin or Member)
app.post('/api/auth/change-pin', requireAdmin, async (req, res) => {
  const { newPin, target } = req.body;
  if (!newPin || String(newPin).length < 4) {
    return res.status(400).json({ success: false, message: 'PIN baru minimal 4 digit.' });
  }

  const pinTarget = target === 'member' ? 'member' : 'admin';

  if (supabase) {
    await sbSetSetting(pinTarget === 'member' ? 'member_pin' : 'admin_pin', String(newPin));
  } else {
    const db = readFileData();
    db.settings = db.settings || {};
    if (pinTarget === 'member') {
      db.settings.memberPin = String(newPin);
    } else {
      db.settings.adminPin = String(newPin);
    }
    writeFileData(db);
  }

  res.json({ success: true, message: `PIN ${pinTarget === 'member' ? 'Anggota' : 'Pengurus'} berhasil diperbarui.` });
});

// GET Summary
app.get('/api/summary', async (req, res) => {
  if (supabase) {
    const summary = await sbGetSummary();
    return res.json({ success: true, ...summary });
  }

  const db = readFileData();
  const transactions = db.transactions || [];
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0);

  res.json({
    success: true,
    groupName: db.settings?.groupName || 'Kelompok 4',
    subTitle: db.settings?.subTitle || 'Buku Kas Kelompok 4',
    lpdName: db.settings?.lpdName || 'LPD',
    accountNumberLPD: db.settings?.accountNumberLPD || '',
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    transactionCount: transactions.length,
    lastUpdated: transactions.length > 0 ? transactions[0].createdAt || transactions[0].date : new Date().toISOString()
  });
});

// GET Transactions
app.get('/api/transactions', async (req, res) => {
  if (supabase) {
    const data = await sbGetTransactions();
    return res.json({ success: true, data });
  }

  const db = readFileData();
  const sorted = [...(db.transactions || [])].sort((a, b) => {
    return new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime();
  });
  res.json({ success: true, data: sorted });
});

// POST Transaction
app.post('/api/transactions', requireAdmin, async (req, res) => {
  const { type, amount, category, description, date } = req.body;
  if (!type || !amount || !category || !date) {
    return res.status(400).json({ success: false, message: 'Semua field wajib diisi.' });
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Nominal harus lebih dari 0.' });
  }

  const newTrx = {
    id: 'trx-' + Date.now(),
    date,
    type: type === 'expense' ? 'expense' : 'income',
    category: category.trim(),
    amount: numAmount,
    description: (description || '').trim(),
  };

  if (supabase) {
    const { error } = await supabase.from('transactions').insert({
      id: newTrx.id,
      date: newTrx.date,
      type: newTrx.type,
      category: newTrx.category,
      amount: newTrx.amount,
      description: newTrx.description,
    });
    if (error) return res.status(500).json({ success: false, message: error.message });
  } else {
    const db = readFileData();
    db.transactions = db.transactions || [];
    newTrx.createdAt = new Date().toISOString();
    db.transactions.unshift(newTrx);
    writeFileData(db);
  }

  res.status(201).json({ success: true, message: 'Transaksi berhasil ditambahkan.', data: newTrx });
});

// PUT Transaction
app.put('/api/transactions/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { type, amount, category, description, date } = req.body;
  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Nominal harus lebih dari 0.' });
  }

  if (supabase) {
    const { error } = await supabase.from('transactions').update({
      type: type === 'expense' ? 'expense' : 'income',
      amount: numAmount,
      category: category.trim(),
      description: (description || '').trim(),
      date,
      updated_at: new Date().toISOString()
    }).eq('id', id);
    if (error) return res.status(500).json({ success: false, message: error.message });
  } else {
    const db = readFileData();
    const index = (db.transactions || []).findIndex(t => t.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan.' });

    db.transactions[index] = {
      ...db.transactions[index],
      type: type === 'expense' ? 'expense' : 'income',
      amount: numAmount,
      category: category.trim(),
      description: (description || '').trim(),
      date,
      updatedAt: new Date().toISOString()
    };
    writeFileData(db);
  }

  res.json({ success: true, message: 'Transaksi berhasil diperbarui.' });
});

// DELETE Transaction
app.delete('/api/transactions/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  if (supabase) {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) return res.status(500).json({ success: false, message: error.message });
  } else {
    const db = readFileData();
    const initialLength = (db.transactions || []).length;
    db.transactions = (db.transactions || []).filter(t => t.id !== id);
    if (db.transactions.length === initialLength) {
      return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan.' });
    }
    writeFileData(db);
  }

  res.json({ success: true, message: 'Transaksi berhasil dihapus.' });
});

// Fallback to index.html for Vercel/Single-Page delivery
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server Kas Kelompok 4 berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;
