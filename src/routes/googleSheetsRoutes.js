import express from 'express';
import googleSheetsService from '../services/googleSheetsService.js';
import schedulerService from '../services/schedulerService.js';

const router = express.Router();

// Sincronizar manualmente (usuários + pagamentos)
router.post('/sync', async (req, res) => {
  try {
    console.log('🔧 Sincronização manual solicitada via API');
    const result = await schedulerService.runManualSync();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sincronizar apenas usuários
router.post('/sync/users', async (req, res) => {
  try {
    console.log('🔧 Sincronização de usuários solicitada via API');
    const result = await googleSheetsService.syncUsers();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sincronizar apenas pagamentos
router.post('/sync/payments', async (req, res) => {
  try {
    console.log('🔧 Sincronização de pagamentos solicitada via API');
    const result = await googleSheetsService.syncPayments();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Verificar status do Google Sheets
router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      enabled: googleSheetsService.isReady,
      spreadsheetId: googleSheetsService.isReady ? '***configurado***' : 'não configurado',
      lastSync: 'Verifique os logs do sistema'
    }
  });
});

export default router;
