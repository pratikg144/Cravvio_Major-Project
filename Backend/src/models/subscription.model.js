const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  plan: { type: String, required: true }, // basic, standard, premium, gold
  price: { type: Number, required: true },
  months: { type: Number, default: 1 },
  startDate: { type: Date },
  endDate: { type: Date },
  status: { type: String, enum: ['pending', 'active', 'cancelled', 'expired', 'rejected'], default: 'pending' },
  paymentInfo: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

SubscriptionSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);
