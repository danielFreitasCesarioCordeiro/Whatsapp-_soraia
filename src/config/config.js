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
  whatsapp: {
    enabled: process.env.WHATSAPP_ENABLED === 'true'
  },
  notifications: {
    schedule: process.env.NOTIFICATION_SCHEDULE || '0 8 * * *',
    birthdayAdvanceDays: parseInt(process.env.BIRTHDAY_ADVANCE_DAYS) || 1,
    paymentAdvanceDays: parseInt(process.env.PAYMENT_ADVANCE_DAYS) || 3
  }
};
