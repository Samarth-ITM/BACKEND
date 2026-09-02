const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const setupSwagger = require('./src/config/swagger');
const logger = require('./src/middleware/logger');
const limiter = require('./src/middleware/rateLimiter');

const authRoutes = require('./src/routes/authRoutes');
const bookRoutes = require('./src/routes/bookRoutes');
const userRoutes = require('./src/routes/userRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(logger);
app.use('/api', limiter);

setupSwagger(app);

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Library API Running', docs: `http://localhost:${PORT}/api-docs` });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server error'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

