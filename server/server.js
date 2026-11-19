import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import recordRoutes from './routes/recordRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import errorHandler, { notFound } from './middleware/errorHandler.js';

const app = express();

app.use(helmet());

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/api/health', (req, res) => res.json({ success: true, message: 'API is running' }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;

try {
  await connectDB();
  app.listen(port, () => console.log(`API listening on port ${port}`));
} catch (error) {
  console.error('Failed to start API:', error);
  process.exitCode = 1;
}
