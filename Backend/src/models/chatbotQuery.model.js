const mongoose = require('mongoose');

const chatbotQuerySchema = new mongoose.Schema(
  {
    query: {
      type: String,
      required: [true, "Query is required"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      refPath: 'role',
    },
    userName: {
      type: String,
      required: false,
    },
    userEmail: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      required: true,
      enum: ['user', 'vendor', 'guest'],
      default: 'guest',
    },
    direct: {
      type: Boolean,
      default: false,
    },
    direct: {
      type: Boolean,
      default: false,
    },
    adminResponse: {
      type: String,
      required: false,
    },
    resolvedAt: {
      type: Date,
      required: false,
    },
    status: {
      type: String,
      enum: ['pending', 'resolved'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const chatbotQueryModel = mongoose.model("chatbotQuery", chatbotQuerySchema);

module.exports = chatbotQueryModel;