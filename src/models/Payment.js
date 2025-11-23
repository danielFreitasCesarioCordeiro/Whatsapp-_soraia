import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['PAYMENT', 'RECEIPT'], // PAYMENT = a pagar, RECEIPT = a receber
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'],
    default: 'PENDING'
  },
  category: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  notificationSent: {
    type: Boolean,
    default: false
  },
  lastNotificationDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

paymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Índice para melhorar performance nas buscas por data
paymentSchema.index({ dueDate: 1, status: 1 });

export default mongoose.model('Payment', paymentSchema);
