const mongoose = require('mongoose');

const SupportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['open','in_progress','resolved','closed'], default: 'open' },
  adminResponse: { type: String },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
}, { timestamps: true });

module.exports = mongoose.model('Support', SupportSchema);

// Add indexes for faster admin querying
SupportSchema.index({ userId: 1 });
SupportSchema.index({ orderId: 1 });
SupportSchema.index({ status: 1 });
SupportSchema.index({ createdAt: -1 });
