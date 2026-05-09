const ChatbotQuery = require('../models/chatbotQuery.model');
const userModel = require('../models/user.model');
const vendorModel = require('../models/vendor.model');

// Initialize Integrations
const openRouterKey = process.env.OPENROUTER_API_KEY;
const openRouterModel = process.env.OPENROUTER_MODEL || 'gpt-4o-mini';
const openRouterApiUrl = 'https://openrouter.ai/api/v1/chat/completions';

async function generateOpenRouterResponse(message) {
  if (!openRouterKey) {
    console.log('OpenRouter key not configured');
    throw new Error('OpenRouter key not configured');
  }

  const modelName = openRouterModel.trim() || 'gpt-4o-mini';
  console.log('Calling OpenRouter API with message:', message.substring(0, 50) + '...');
  console.log('OpenRouter model:', modelName);

  const system = `You are a helpful customer support assistant for a food delivery platform named Cravvio. Provide concise and polite answers.`;
  const userPrompt = `User query: ${message}`;

  try {
    const resp = await fetch(openRouterApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openRouterKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: userPrompt }
        ]
      })
    });

    console.log('OpenRouter API response status:', resp.status);

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error('OpenRouter API error:', resp.status, errorText);
      if (resp.status === 404) {
        throw new Error(
          `OpenRouter API 404: model "${modelName}" not found or not available. ` +
          'Set OPENROUTER_MODEL to a valid OpenRouter model name such as gpt-4o-mini.'
        );
      }
      throw new Error(`OpenRouter API error: ${resp.status} - ${errorText}`);
    }

    const data = await resp.json();
    console.log('OpenRouter API response data:', data);

    const text = data?.choices?.[0]?.message?.content;
    if (!text) {
      console.error('No content in OpenRouter response:', data);
      throw new Error('No response content from OpenRouter');
    }

    console.log('OpenRouter response text:', text.substring(0, 100) + '...');
    return text.trim();
  } catch (error) {
    console.error('OpenRouter API call failed:', error.message);
    throw error;
  }
}

const generateOfflineResponse = (message) => {
  const query = (message || '').toLowerCase();

  if (!query) return 'Hi there! Please send a question or issue so I can help.';
  if (query.includes('order') || query.includes('track')) {
    return "I can help with order tracking. Please share your order ID or check the Orders page.";
  }
  if (query.includes('refund') || query.includes('cancel')) {
    return 'For refund/cancel requests, I will send this to admin support for quick resolution.';
  }
  if (query.includes('payment') || query.includes('card')) {
    return 'I can give payment info, but if there is an error I will connect you to admin support.';
  }
  if (query.includes('delivery') || query.includes('time')) {
    return "Standard delivery times are ~30-45 minutes depending on your location and vendor.";
  }
  if (query.includes('menu') || query.includes('food') || query.includes('restaurant')) {
    return 'You can browse vendors and menus in the app. Tell me your preference and I can suggest something.';
  }
  if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
    return 'Hello there! 👋 I am the Cravvio Support Assistant. How can I help?';
  }

  return 'Thanks for your question! I will do my best to help, and if needed I can forward this to admin support.';
};

const sendMessage = async (req, res) => {
  try {
    const { message, direct } = req.body;
    
    // Extracted from optionalAuthMiddleware
    const role = req.userRole || 'guest';
    const userId = req.userId || req.vendorId || req.adminId || null;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    let aiResponse = '';
    let forwarded = false;
    let queryId = null;

    const forwardToAdmin = async (autoResponse, directSend = false) => {
      let userName = null;
      let userEmail = null;

      if (userId && role === 'user') {
        try {
          const user = await userModel.findById(userId).select('name email');
          if (user) {
            userName = user.name || 'User';
            userEmail = user.email || null;
          }
        } catch (err) {
          console.error('Error fetching user details:', err.message);
        }
      } else if (userId && role === 'vendor') {
        try {
          const vendor = await vendorModel.findById(userId).select('name email');
          if (vendor) {
            userName = vendor.name || 'Vendor';
            userEmail = vendor.email || null;
          }
        } catch (err) {
          console.error('Error fetching vendor details:', err.message);
        }
      }

      const payload = {
        query: message,
        role,
        userName: userName || 'Guest',
        userEmail: userEmail || null,
        direct: Boolean(directSend),
      };

      if (userId) {
        payload.userId = userId;
      }

      const newQuery = new ChatbotQuery(payload);
      const saved = await newQuery.save();
      forwarded = true;
      queryId = saved._id;
      aiResponse = autoResponse || 'I am forwarding your message to our administrator for further help.';
    };

    if (direct) {
      await forwardToAdmin('Your request has been sent directly to admin support. Please wait for a response.', true);
      return res.status(200).json({ response: aiResponse, forwarded: true, direct: true, queryId });
    }
    if (direct) {
      await forwardToAdmin('Your request has been sent directly to admin support. Please wait for a response.', true);
      return res.status(200).json({ response: aiResponse, forwarded: true, direct: true, queryId });
    }

    if (openRouterKey) {
      try {
        aiResponse = await generateOpenRouterResponse(message);
      } catch (orErr) {
         console.error('OpenRouter API restricted/failed. Falling back to offline:', orErr.message);
      }
    }

    if (!aiResponse) {
      aiResponse = generateOfflineResponse(message);
    }

    const lowerResp = (aiResponse || '').toLowerCase();

    const shouldForwardToAdmin = () => {
      if (!aiResponse) return true;
      if (lowerResp.includes('i cannot help') || lowerResp.includes('i can not help')) return true;
      if (lowerResp.includes('forward this') || lowerResp.includes('admin support') || lowerResp.includes('escalate')) return true;
      return false;
    };

    if (shouldForwardToAdmin()) {
      await forwardToAdmin('I have forwarded this complex query to our admin team so they can personally assist you!');
      return res.status(200).json({ response: aiResponse || 'I have forwarded your message to admin.', forwarded, queryId });
    }

    res.status(200).json({ response: aiResponse, forwarded: false });
  } catch (error) {
    console.error('sendMessage handler error:', error);
    res.status(500).json({ message: 'Error processing message' });
  }
};

const getSuggestions = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ message: 'Query is required' });
    }

    let suggestions = [];

    // Topic-based suggestions
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('order') || lowerQuery.includes('track')) {
      suggestions = [
        'Where is my order?',
        'How long does delivery take?',
        'Can I cancel my order?',
        'Order status update',
      ];
    } else if (lowerQuery.includes('refund') || lowerQuery.includes('payment') || lowerQuery.includes('cancel')) {
      suggestions = [
        'Why was I charged?',
        'How do I get a refund?',
        'Payment methods accepted',
        'Billing issues',
      ];
    } else if (lowerQuery.includes('menu') || lowerQuery.includes('food') || lowerQuery.includes('restaurant')) {
      suggestions = [
        'What restaurants are available?',
        'Cuisine recommendations',
        'Special offers today',
        'Dietary restrictions',
      ];
    } else if (lowerQuery.includes('delivery') || lowerQuery.includes('address')) {
      suggestions = [
        'Delivery areas covered',
        'Change delivery address',
        'Delivery charges',
        'Express delivery available?',
      ];
    } else if (lowerQuery.includes('account') || lowerQuery.includes('profile') || lowerQuery.includes('login')) {
      suggestions = [
        'Reset my password',
        'Update my profile',
        'Change email address',
        'Account security',
      ];
    } else if (lowerQuery.includes('promo') || lowerQuery.includes('discount') || lowerQuery.includes('coupon')) {
      suggestions = [
        'Current promotions',
        'How to use coupon code',
        'Referral rewards',
        'Loyalty program',
      ];
    } else {
      // Default suggestions for unknown queries
      suggestions = [
        'How can I track my order?',
        'What refund options are available?',
        'Show me available restaurants',
        'I need technical support',
      ];
    }

    res.json({ suggestions });
  } catch (error) {
    console.error('getSuggestions error:', error);
    res.status(500).json({ message: 'Error generating suggestions' });
  }
};

module.exports = {
  sendMessage,
  getSuggestions,
};