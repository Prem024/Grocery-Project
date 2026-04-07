require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const productRoutes = require('./routes/productRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const reportRoutes = require('./routes/reportRoutes');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();

// 1. Connect to MongoDB (Call it here, but ensure config/db.js has the readyState check)
connectDB();

// Security & Middleware
app.use(helmet());
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || origin.startsWith('http://localhost') || origin.endsWith('.vercel.app') || origin === process.env.CLIENT_URL) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 2. Add a simple Root Route (Helps prevent 404 on the main Vercel URL)
app.get('/', (req, res) => {
  res.json({ message: "Grocery Stock API is Live" });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Grocery Stock API is running 🚀', timestamp: new Date() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reports', reportRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// 3. Environment-specific Listener
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Local Server: http://localhost:${PORT}`);
  });
}

module.exports = app;

// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const connectDB = require('./config/db');

// const authRoutes = require('./routes/authRoutes');
// const categoryRoutes = require('./routes/categoryRoutes');
// const supplierRoutes = require('./routes/supplierRoutes');
// const productRoutes = require('./routes/productRoutes');
// const inventoryRoutes = require('./routes/inventoryRoutes');
// const reportRoutes = require('./routes/reportRoutes');
// const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// // Connect to MongoDB
// connectDB();

// const app = express();

// // Security middleware
// app.use(helmet());

// // CORS
// app.use(
//   cors({
//     origin: [
//       'http://localhost:5173',
//       'http://localhost:3000',
//       process.env.CLIENT_URL || 'http://localhost:5173',
//     ],
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//   })
// );

// // Body parsing
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true }));

// // Logging
// if (process.env.NODE_ENV === 'development') {
//   app.use(morgan('dev'));
// }

// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({ success: true, message: 'Grocery Stock API is running 🚀', timestamp: new Date() });
// });

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/categories', categoryRoutes);
// app.use('/api/suppliers', supplierRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/inventory', inventoryRoutes);
// app.use('/api/reports', reportRoutes);

// // Error handling
// app.use(notFound);
// app.use(errorHandler);

// // const PORT = process.env.PORT || 5000;
// // app.listen(PORT, () => {
// //   console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
// // });

// // module.exports = app;
// // --- Change this section at the bottom ---

// // Only run the server listener if NOT on Vercel (local development)
// if (process.env.NODE_ENV !== 'production') {
//   const PORT = process.env.PORT || 5000;
//   app.listen(PORT, () => {
//     console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
//   });
// }

// // Export the app for Vercel to handle
// module.exports = app;