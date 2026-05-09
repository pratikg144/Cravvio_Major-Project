import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, Utensils, Info, Store, MessageCircle, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { apiClient } from './config/api';

// Cravvio Brand Configuration
const SYSTEM_PROMPT = `You are Cravvio AI, the official intelligent assistant for Cravvio - a Smart Online Food Delivery System. 
Your primary goal is to help users with:
1. Long-term meal planning and personalized food recommendations (Vegan, Keto, etc.).
2. Explaining Cravvio's weekly and monthly subscription meal plans.
3. Helping local vendors understand how to register, manage menus, and use the vendor dashboard.
4. General queries about order tracking, delivery, and pricing.

Tone: Friendly, helpful, professional, and food-oriented. Keep responses concise and use markdown formatting (like bullet points and bold text) to make it easy to read.`;

export default function CravvioChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'model', 
      text: "Hello! I'm your Cravvio AI assistant. I can help you with smart meal planning, subscription plans, or vendor onboarding. How can I help you today?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen]);

  // Suggested quick prompts
  const suggestions = [
    { icon: Utensils, text: "Suggest a high-protein vegan meal plan" },
    { icon: Info, text: "How do Cravvio subscriptions work?" },
    { icon: Store, text: "How do I register as a local vendor?" }
  ];

  const handleSend = async (textToSend = input, direct = false) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await apiClient.post('/api/chatbot/send-message', {
        message: textToSend,
        direct,
      });

      const botReply = response.data.response || "I'm sorry, I couldn't process that request.";
      let finalBotMessage = botReply;
      if (direct && response.data.queryId) {
        finalBotMessage = `${botReply} \n\nYour query has been sent directly to admin. Query ID: ${response.data.queryId}`;
      }
      setMessages(prev => [...prev, { role: 'model', text: finalBotMessage }]);
    } catch (error) {
      console.error("Chatbot Error:", error);
      const fallbackMessage = "Sorry, I'm having trouble connecting to the Cravvio servers right now. Please try again later or contact support.";
      setMessages(prev => [...prev, { role: 'model', text: fallbackMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 sm:bottom-7 sm:right-7 w-20 h-20 bg-[#6AA200] text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex items-center justify-center hover:bg-[#4E7A00] hover:scale-105 transition-all duration-300 z-50"
        aria-label="Toggle AI Chatbot"
      >
        {isOpen ? <X className="w-10 h-10" /> : <MessageCircle className="w-12 h-12" />}
      </button>

      {/* Chat Window Popup */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-8 z-50 w-[calc(100vw-2rem)] sm:w-[calc(100vw-4rem)] md:w-[650px] lg:w-[700px] h-[calc(100vh-8rem)] md:h-[65vh] max-h-[600px] bg-[#f0f0f0] rounded-[1.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-300 origin-bottom-right transition-all animate-in fade-in zoom-in-95 duration-200">
          
          {/* Left Sidebar - Branding & Suggestions */}
          <div className="w-full md:w-[280px] lg:w-[300px] bg-[#4E7A00] text-white p-5 lg:p-6 flex flex-col hidden md:flex shrink-0">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-[#6AA200] rounded-lg flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">Cravvio AI</h1>
                <p className="text-[#A8E05A] text-xs uppercase tracking-widest font-semibold mt-0.5">Support</p>
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-xs font-bold text-[#A8E05A] mb-3 uppercase tracking-widest">Quick Inquiries</h3>
              <div className="space-y-2">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(suggestion.text)}
                    className="w-full text-left bg-[#6AA200] hover:bg-[#7FB800] p-3 rounded-lg transition-all border border-[#7FB800] flex items-center gap-3 group shadow-sm"
                  >
                    <suggestion.icon className="w-4 h-4 text-white group-hover:text-[#2A2A2A] shrink-0" />
                    <span className="text-xs font-medium leading-snug text-white group-hover:text-[#2A2A2A]">{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-[#6AA200]">
              <p className="text-xs text-[#A8E05A] leading-relaxed font-medium">
                Cravvio AI uses advanced ML for personalized meal plans and vendor assistance.
              </p>
            </div>
          </div>

          {/* Right Chat Interface */}
          <div className="flex-1 flex flex-col bg-[#EFEFEF] overflow-hidden">
            {/* Mobile Header */}
            <div className="md:hidden bg-[#4E7A00] p-3 flex items-center justify-between shadow-md z-10">
               <div className="flex items-center gap-2">
                 <div className="w-9 h-9 bg-[#6AA200] rounded-md flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-white leading-tight">Cravvio AI</h1>
                  <p className="text-[#A8E05A] text-[10px] uppercase tracking-widest font-semibold">Support</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white hover:bg-[#6AA200] p-2 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-5 space-y-4 scroll-smooth bg-[#EBEBEB]">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                    msg.role === 'user' ? 'bg-[#2B343B]' : 'bg-[#C7F291] border border-[#A7E05A]'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-5 h-5 text-[#4E7A00]" />}
                  </div>
                  
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-[#2B343B] text-white rounded-tr-sm' 
                      : 'bg-[#DFF2B8] text-gray-800 rounded-tl-sm border border-[#C7F291]/50'
                  }`}>
                    {msg.role === 'user' ? (
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    ) : (
                      <ReactMarkdown
                        components={{
                          p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                          li: ({node, ...props}) => <li className="mb-1" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start gap-3 animate-fade-in">
                  <div className="w-9 h-9 rounded-full bg-[#C7F291] border border-[#A7E05A] flex items-center justify-center shrink-0 shadow-sm">
                    <Bot className="w-5 h-5 text-[#4E7A00]" />
                  </div>
                  <div className="bg-[#DFF2B8] border border-[#C7F291]/50 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-[#4E7A00] animate-spin" />
                    <span className="text-xs text-gray-700 font-medium">Typing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 sm:p-4 lg:p-5 bg-[#EBEBEB] border-t border-gray-300/60 z-10">
              <div className="flex flex-col gap-2">
                <div className="flex items-end gap-2 bg-white border border-gray-300 rounded-full p-1.5 focus-within:ring-2 focus-within:ring-[#6AA200]/30 focus-within:border-[#6AA200] transition-all shadow-sm">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about meal plans..."
                    className="w-full bg-transparent border-none outline-none resize-none max-h-28 min-h-[40px] px-4 py-2.5 text-gray-800 placeholder-gray-400 font-medium text-md focus:ring-0"
                    rows={1}
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading}
                    className="bg-[#6AA200] hover:bg-[#4E7A00] disabled:bg-gray-400 disabled:cursor-not-allowed text-white w-10 h-10 my-2.5 rounded-full flex items-center justify-center shrink-0 transition-all shadow-md"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
                <button
                  onClick={() => handleSend(input, true)}
                  disabled={!input.trim() || isLoading}
                  className="w-full bg-[#F59E0B] hover:bg-[#D97706] disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-md"
                >
                  Send to Admin
                </button>
              </div>
              <p className="text-center text-[10px] text-gray-500 mt-2 font-medium">
                Verify important details.
              </p>
            </div>

          </div>
        </div>
      )}
    </>
  );
}