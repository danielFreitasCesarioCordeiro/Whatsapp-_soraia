import express from 'express';
import NotificationLog from '../models/NotificationLog.js';
import schedulerService from '../services/schedulerService.js';

const router = express.Router();

// Executar verificação manual de notificações
router.post('/check-now', async (req, res) => {
  try {
    console.log('🔧 Verificação manual solicitada via API');
    const result = await schedulerService.runManualCheck();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Histórico de notificações
router.get('/logs', async (req, res) => {
  try {
    const { userId, type, channel, status, limit = 50 } = req.query;
    const filter = {};
    
    if (userId) filter.user = userId;
    if (type) filter.type = type;
    if (channel) filter.channel = channel;
    if (status) filter.status = status;

    const logs = await NotificationLog.find(filter)
      .populate('user', 'name email phone')
      .populate('relatedPayment', 'description amount dueDate')
      .sort({ sentAt: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Estatísticas de notificações
router.get('/stats', async (req, res) => {
  try {
    const stats = await NotificationLog.aggregate([
      {
        $group: {
          _id: {
            type: '$type',
            channel: '$channel',
            status: '$status'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const last24h = await NotificationLog.countDocuments({
      sentAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    const successRate = await NotificationLog.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({ 
      success: true, 
      data: {
        detailed: stats,
        last24Hours: last24h,
        successRate: successRate
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
