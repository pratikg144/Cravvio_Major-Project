const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth.routes');
const foodRoutes = require('./routes/food.routes');
const userRoutes = require('./routes/user.routes');
const paymentRoutes = require('./routes/payment.routes');
const adminRoutes = require('./routes/admin.routes');
const supportRoutes = require('./routes/support.routes');
const publicRoutes = require('./routes/public.routes');
const chatbotRoutes = require('./routes/chatbot.routes');
const cors = require('cors');

const app = express();
const mongoose = require('mongoose');

app.use(cors({
  origin: function (origin, callback) {
    const defaultLocal = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175'
    ];
    const envOrigins = (process.env.ALLOWED_ORIGINS || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const allowedOrigins = defaultLocal.concat(envOrigins);

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow if explicitly configured
    if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);

    // Allow common hosting domains (Vercel, Render). Keep this permissive only for known hosts.
    if (origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com') || origin.includes('render.com')) {
      return callback(null, true);
    }

    // Allow a single FRONTEND_URL env var as fallback
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) return callback(null, true);

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const frontendDist = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
}

app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/user', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/chatbot', chatbotRoutes);

app.get('/', (req, res) => {
  if (fs.existsSync(path.join(frontendDist, 'index.html'))) {
    return res.sendFile(path.join(frontendDist, 'index.html'));
  }
  return res.send('Hello World!');
});

// Simple health check (reports DB connection state)
app.get('/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const state = mongoose.connection && mongoose.connection.readyState != null ? mongoose.connection.readyState : 0;
  return res.json({ ok: state === 1, state: states[state] || state });
});

app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  if (fs.existsSync(path.join(frontendDist, 'index.html'))) {
    return res.sendFile(path.join(frontendDist, 'index.html'));
  }
  return res.status(404).send('Not found');
});

module.exports = app;
