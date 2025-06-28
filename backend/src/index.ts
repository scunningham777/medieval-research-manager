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
const PORT = process.env.PORT || 5000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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

app.listen(PORT, () => {
  console.log(`🏰 Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  pool.end(() => {
    console.log('Database connection closed');
    process.exit(0);
  });
});
