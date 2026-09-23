const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const kpiRoutes = require('./routes/kpi');
const userRoutes = require('./routes/users');

// Load environment variables
dotenv.config({ path: './config.env' });

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    console.log('Server initialization completed');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/kpi', kpiRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'KPI System API is running' });
});

// Debug endpoint to reset admin user
app.post('/api/debug/reset-admin', async (req, res) => {
  try {
    const resetAdmin = require('./utils/resetAdmin');
    await resetAdmin();
    res.json({ message: 'Admin user reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reset admin user', error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
