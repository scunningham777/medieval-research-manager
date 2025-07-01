import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { initializeSourceRoutes } from './routes/sources';
import { SourceModel } from './models/Source';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test database connection on startup
pool.connect()
  .then(async () => {
    console.log('Connected to database')

    // Create tables if they don't exist
    const sourceModel = new SourceModel(pool);
    await sourceModel.createTable();
    console.log('Tables created successfully');
  })
  .catch((err) => console.error('Failed to connect to database', err));

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/api/sources', initializeSourceRoutes(pool));

app.get('/api/health', (req, res) => {
  res.json({ status: 'Medieval Research Manager API Running' });
});

// Database health check route
app.get('/api/db-health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'Database is healthy', timestamp: result.rows[0].now });
  } catch (error) {
    console.error('Database health check failed', error);
    res.status(500).json({ 
      status: 'Database health check failed',
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🏰 Server running on port ${PORT}`);
});

// Graceful shutdown handler
const shutdown = async (signal: string) => {
  console.log(`🛑 Received ${signal}. Shutting down gracefully...`);
  
  // Close the HTTP server
  server.close(() => {
    console.log('✅ HTTP server closed');
  });
  
  // Close database connections
  await pool.end();
  console.log('✅ Database connection closed');
  
  // Exit the process
  process.exit(0);
};

// Handle different termination signals
process.on('SIGINT', () => shutdown('SIGINT'));  // Ctrl+C
process.on('SIGTERM', () => shutdown('SIGTERM')); // Container orchestration (e.g., Docker, Kubernetes)
process.on('SIGQUIT', () => shutdown('SIGQUIT')); // Keyboard quit

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown('unhandledRejection');
});
