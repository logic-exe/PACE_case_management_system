import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import config from './config/index.js';
import pool, { initDatabase } from './db.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import beneficiaryRoutes from './routes/beneficiaryRoutes.js';
import caseRoutes from './routes/caseRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import documentRoutes from './routes/documentRoutes.js';

const app = express();

// Middleware
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Drive-Access-Token']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/beneficiaries', beneficiaryRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/documents', documentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'PACE Case Management API is running' });
});

// Dashboard stats endpoint
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const totalCasesQuery = 'SELECT COUNT(*) FROM cases';
    const ongoingCasesQuery = "SELECT COUNT(*) FROM cases WHERE status IN ('active', 'pending')";
    const disposedCasesQuery = "SELECT COUNT(*) FROM cases WHERE status = 'resolved'";
    
    const [totalResult, ongoingResult, disposedResult] = await Promise.all([
      pool.query(totalCasesQuery),
      pool.query(ongoingCasesQuery),
      pool.query(disposedCasesQuery)
    ]);

    res.json({
      totalCases: parseInt(totalResult.rows[0].count),
      ongoingCases: parseInt(ongoingResult.rows[0].count),
      disposedCases: parseInt(disposedResult.rows[0].count)
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    // Initialize database tables
    await initDatabase();
    
    app.listen(config.port, () => {
      console.log(`🚀 Server is running on port ${config.port}`);
      console.log(`📊 Environment: ${config.nodeEnv}`);
      console.log(`🌐 Frontend URL: ${config.frontendUrl}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
