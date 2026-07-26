const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const passport = require('./config/passport');
const session = require('express-session');

const app = express();

// ──── Security Middleware ────
app.use(helmet({ 
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
      frameSrc: ["'self'", "https://js.stripe.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://images.unsplash.com"],
    }
  }
}));
app.use(mongoSanitize()); // Prevent NoSQL injection

// ──── Rate Limiter (auth routes) ────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, message: 'Too many requests, please try again later' },
});

// ──── Payment Routes (Webhook needs raw body) ────
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }), require('./routes/paymentRoutes'));

// ──── Core Middleware ────
app.use(cors({
  origin: [process.env.CLIENT_URL, 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'].filter(Boolean),
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

// Other API Routes
app.use('/api/payments', require('./routes/paymentRoutes'));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(session({
  secret: process.env.JWT_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// ──── Static Files ────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ──── API Routes ────
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/admin/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/quiz', authLimiter, require('./routes/quizRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/subscriptions', authLimiter, require('./routes/subscriptionRoutes'));
app.use('/api/articles', require('./routes/articleRoutes'));
app.use('/api/newsletter', require('./routes/newsletterRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
// ──── Health Check ────
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Strandds Hair Cosmetic API is running 🚀' });
});

// ──── Error Handling ────
app.use(notFound);
app.use(errorHandler);

process.on('uncaughtException', (err) => {
  require('fs').writeFileSync('crash.log', err.stack);
  console.error(err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  require('fs').writeFileSync('crash.log', err.stack || err.toString());
  console.error(err);
  process.exit(1);
});

module.exports = app;
