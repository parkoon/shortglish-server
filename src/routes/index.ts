import { Router } from 'express';
import tossRoutes from './toss.routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/toss', tossRoutes);

export default router;

