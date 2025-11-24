import dotenv from 'dotenv';

dotenv.config();

export const config = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/notification-system'
  },
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  evolution: {
    apiUrl: process.env.EVOLUTION_API_URL || 'http://localhost:8080',
    apiKey: process.env.EVOLUTION_API_KEY,
    instanceName: process.env.EVOLUTION_INSTANCE_NAME || 'notificacoes'
  },
  n8n: {
    webhookUrl: process.env.N8N_WEBHOOK_URL,
    enabled: process.env.N8N_ENABLED === 'true'
  },
  googleSheets: {
    enabled: process.env.GOOGLE_SHEETS_ENABLED === 'true',
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    usersTab: process.env.GOOGLE_SHEETS_USERS_TAB || 'Usuarios',
    paymentsTab: process.env.GOOGLE_SHEETS_PAYMENTS_TAB || 'Pagamentos',
    syncSchedule: process.env.GOOGLE_SHEETS_SYNC_SCHEDULE || '*/10 * * * *'
  },
  notifications: {
    schedule: process.env.NOTIFICATION_SCHEDULE || '0 8 * * *',
    birthdayAdvanceDays: parseInt(process.env.BIRTHDAY_ADVANCE_DAYS) || 1,
    paymentAdvanceDays: parseInt(process.env.PAYMENT_ADVANCE_DAYS) || 3
  }
};
