import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check the status of the server and database connection.
 *     responses:
 *       200:
 *         description: Server and database are running successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: UP
 *                 database:
 *                   type: string
 *                   example: CONNECTED
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2026-06-07T12:00:00.000Z
 *       503:
 *         description: Database connection is unavailable.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: DOWN
 *                 database:
 *                   type: string
 *                   example: DISCONNECTED
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2026-06-07T12:00:00.000Z
 */
router.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState;
  let dbStatus = 'DISCONNECTED';
  if (dbState === 1) dbStatus = 'CONNECTED';
  else if (dbState === 2) dbStatus = 'CONNECTING';
  else if (dbState === 3) dbStatus = 'DISCONNECTING';

  const isUp = dbState === 1;

  res.status(isUp ? 200 : 503).json({
    status: isUp ? 'UP' : 'DOWN',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

export default router;
