import mongoose from 'mongoose';

const notificationLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['BIRTHDAY', 'PAYMENT', 'RECEIPT'],
    required: true
  },
  channel: {
    type: String,
    enum: ['EMAIL', 'WHATSAPP'],
    required: true
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  errorMessage: {
    type: String
  },
  relatedPayment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  sentAt: {
    type: Date,
    default: Date.now
  }
});

// Índice para consultas de histórico
notificationLogSchema.index({ user: 1, sentAt: -1 });

export default mongoose.model('NotificationLog', notificationLogSchema);
