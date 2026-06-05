const express = require('express');
const cors = require('cors');

const app = express();

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ================= ROUTES =================
const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');

// ================= ROUTE PREFIXES =================

// Auth (login/register)
app.use('/api/auth', authRoutes);

// Menu (items CRUD)
app.use('/api/menu', menuRoutes);

// Orders (checkout, history, payment)
app.use('/api/orders', orderRoutes);

// Users (admin management)
app.use('/api/users', userRoutes);

// Reports (analytics/dashboard)
app.use('/api/reports', reportRoutes);

// ================= START SERVER =================
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});