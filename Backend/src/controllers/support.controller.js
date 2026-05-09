const Support = require('../models/support.model');
const Order = require('../models/order.model');
const fetch = global.fetch || require('node-fetch');

async function createSupportRequest(req, res) {
  try {
    const userId = req.userId;
    const { orderId, subject, message } = req.body;
    if (!subject || !message) return res.status(400).json({ message: 'Subject and message are required' });

    const support = await Support.create({ userId, orderId, subject, message });
    res.status(201).json({ message: 'Support request created', support });
  } catch (err) {
    console.error('createSupportRequest error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function getSupportRequests(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '50', 10);
    const status = req.query.status;

    const filter = {};
    if (status) filter.status = status;

    const total = await Support.countDocuments(filter);
    const items = await Support.find(filter)
      .populate('userId', 'username email')
      .populate('orderId', 'items total status')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({ items, total, page, limit });
  } catch (err) {
    console.error('getSupportRequests error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function getSupportRequestById(req, res) {
  try {
    const id = req.params.id;
    const support = await Support.findById(id)
      .populate('userId', 'username email')
      .populate('orderId')
      .lean();
    if (!support) return res.status(404).json({ message: 'Support request not found' });

    // allow owner or admin
    if (req.userId && support.userId && support.userId._id.toString() !== req.userId.toString() && !req.adminId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json({ support });
  } catch (err) {
    console.error('getSupportRequestById error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function resolveSupportRequest(req, res) {
  try {
    const id = req.params.id;
    const { adminResponse, status } = req.body; // status can be 'resolved' or 'closed'
    const allowed = ['resolved','closed','in_progress'];
    if (status && !allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const updated = await Support.findByIdAndUpdate(id, { adminResponse, status: status || 'resolved', resolvedBy: req.adminId }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Support request not found' });
    res.json({ message: 'Support request updated', support: updated });
  } catch (err) {
    console.error('resolveSupportRequest error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { createSupportRequest, getSupportRequests, getSupportRequestById, resolveSupportRequest, suggestSupportResponse };

// AI-powered suggestion endpoint
async function suggestSupportResponse(req, res) {
  try {
    const id = req.params.id;
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'message is required' });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(501).json({ message: 'AI API key not configured on server' });

    // Build prompt
    const system = `You are a helpful customer support assistant for a food delivery platform. Provide up to three concise polite responses an admin can send to the user to resolve the issue. Return a JSON array of responses only.`;
    const userPrompt = `User support message:\n${message}\n\nProvide up to 3 suggested admin replies as a JSON array of strings.`;

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 400,
        temperature: 0.2
      })
    });

    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content || '';

    // Try to parse JSON from model output
    let suggestions = [];
    try {
      suggestions = JSON.parse(text);
      if (!Array.isArray(suggestions)) suggestions = [String(suggestions)];
    } catch (e) {
      // Fallback: split by lines and take up to 3
      suggestions = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean).slice(0,3);
    }

    res.json({ suggestions });
  } catch (err) {
    console.error('suggestSupportResponse error', err);
    res.status(500).json({ message: 'Error generating suggestions' });
  }
}
