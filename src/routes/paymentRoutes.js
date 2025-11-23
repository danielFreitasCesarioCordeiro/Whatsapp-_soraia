import express from 'express';
import Payment from '../models/Payment.js';

const router = express.Router();

// Criar novo pagamento/recebimento
router.post('/', async (req, res) => {
  try {
    const payment = new Payment(req.body);
    await payment.save();
    await payment.populate('user');
    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Listar todos os pagamentos
router.get('/', async (req, res) => {
  try {
    const { type, status, userId } = req.query;
    const filter = {};
    
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (userId) filter.user = userId;

    const payments = await Payment.find(filter)
      .populate('user')
      .sort({ dueDate: 1 });
    
    res.json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Buscar pagamento por ID
router.get('/:id', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('user');
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Pagamento não encontrado' });
    }
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Atualizar pagamento
router.put('/:id', async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user');
    
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Pagamento não encontrado' });
    }
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Deletar pagamento
router.delete('/:id', async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Pagamento não encontrado' });
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Marcar pagamento como pago
router.patch('/:id/pay', async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: 'PAID' },
      { new: true }
    ).populate('user');
    
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Pagamento não encontrado' });
    }
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Buscar pagamentos por período
router.get('/period/range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        error: 'startDate e endDate são obrigatórios' 
      });
    }

    const payments = await Payment.find({
      dueDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).populate('user').sort({ dueDate: 1 });

    res.json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Estatísticas de pagamentos
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const typeStats = await Payment.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    res.json({ 
      success: true, 
      data: {
        byStatus: stats,
        byType: typeStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
