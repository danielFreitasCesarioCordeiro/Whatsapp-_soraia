import express from 'express';
import cors from 'cors';
import { config } from './config/config.js';
import { connectDatabase } from './config/database.js';
import schedulerService from './services/schedulerService.js';
import whatsappService from './services/whatsappService.js';

// Import routes
import userRoutes from './routes/userRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota principal
app.get('/', (req, res) => {
  res.json({
    message: '🔔 Sistema de Notificações Automáticas',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      users: '/api/users',
      payments: '/api/payments',
      notifications: '/api/notifications'
    }
  });
});

// Rota de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'connected',
    whatsapp: whatsappService.isReady ? 'connected' : 'disconnected'
  });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    message: config.server.env === 'development' ? err.message : undefined
  });
});

// Inicializar servidor
const startServer = async () => {
  try {
    // Conectar ao banco de dados
    await connectDatabase();

    // Iniciar servidor HTTP
    app.listen(config.server.port, () => {
      console.log('\n' + '='.repeat(60));
      console.log('🚀 SISTEMA DE NOTIFICAÇÕES AUTOMÁTICAS');
      console.log('='.repeat(60));
      console.log(`🌐 Servidor rodando na porta: ${config.server.port}`);
      console.log(`🔗 URL: http://localhost:${config.server.port}`);
      console.log(`📝 Ambiente: ${config.server.env}`);
      console.log('='.repeat(60) + '\n');
    });

    // Iniciar agendador de notificações
    schedulerService.start();

    // Mensagem sobre WhatsApp
    if (config.whatsapp.enabled) {
      console.log('📱 WhatsApp habilitado - aguardando autenticação...\n');
    } else {
      console.log('⚠️  WhatsApp desabilitado - apenas notificações por email serão enviadas\n');
    }

  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 Sinal SIGTERM recebido. Encerrando servidor...');
  schedulerService.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Sinal SIGINT recebido. Encerrando servidor...');
  schedulerService.stop();
  process.exit(0);
});

// Iniciar
startServer();

export default app;
