// const mongoose = require('mongoose');

// const orderItemSchema = new mongoose.Schema({
//   foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'food', required: true },
//   name: { type: String, required: true },
//   price: { type: Number, default: 0 },
//   qty: { type: Number, default: 1 }
// });

// const orderSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
//   vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'vendor', required: true },
//   items: [orderItemSchema],
//   total: { type: Number, default: 0 },
//   status: { type: String, enum: ['pending', 'paid', 'preparing', 'completed', 'cancelled'], default: 'pending' },
//   paymentInfo: { type: Object }
// }, { timestamps: true });

// // Indexes to improve query performance for common admin queries
// orderSchema.index({ userId: 1 });
// orderSchema.index({ vendorId: 1 });
// orderSchema.index({ status: 1 });
// orderSchema.index({ createdAt: -1 });

// module.exports = mongoose.model('order', orderSchema);


// -----------------------------
// DONE TODAY as TESTING       |
// -----------------------------

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'food', required: true },
  name: { type: String, required: true },
  price: { type: Number, default: 0 },
  qty: { type: Number, default: 1 }
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'vendor', required: true },

  items: [orderItemSchema],
  total: { type: Number, default: 0 },

  // ✅ UPDATED STATUS (includes tracking)
  status: {
    type: String,
    enum: [
      'pending',
      'paid',
      'preparing',
      'agent_arrived',
      'picked_up',
      'on_the_way',
      'delivered',
      'cancelled'
    ],
    default: 'pending'
  },

  paymentInfo: { type: Object },

  // ✅ TRACKING FIELDS
  vendorLocation: {
    lat: { type: Number, default: 26.4499 },
    lng: { type: Number, default: 80.3319 }
  },

  userLocation: {
    lat: { type: Number, default: 26.4600 },
    lng: { type: Number, default: 80.3400 }
  },

  deliveryLocation: {
    lat: { type: Number, default: 26.4499 },
    lng: { type: Number, default: 80.3319 }
  },

  eta: {
    type: Number,
    default: 30
  }

}, { timestamps: true });

// Indexes (keep them)
orderSchema.index({ userId: 1 });
orderSchema.index({ vendorId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('order', orderSchema);