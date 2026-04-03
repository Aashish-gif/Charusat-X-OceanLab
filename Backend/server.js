import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import pricingRoutes from './routes/pricing.js';
import recommendationRoutes from './routes/recommendations.js';

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.MONGODB_URI) {
  console.error('\n❌ ERROR: MONGODB_URI is not defined in environment variables');
  console.error('\n📝 Please create a .env file in the root directory with:');
  console.error('   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname');
  console.error('   JWT_SECRET=your_secret_key');
  console.error('   PORT=5000\n');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.warn('\n⚠️  WARNING: JWT_SECRET is not defined. Using default (not secure for production)\n');
  process.env.JWT_SECRET = 'default_jwt_secret_change_in_production';
}

// Connect to MongoDB
connectDB().catch((error) => {
  console.error('Failed to connect to MongoDB:', error);
  process.exit(1);
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
