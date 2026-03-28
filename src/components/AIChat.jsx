import React, { useState, useRef, useEffect } from 'react';
import Groq from 'groq-sdk';
import { Send, Bot, User, Trash2 } from 'lucide-react';
import './AIChat.css';

// Initialize Groq. Warning: Exposing API keys in React apps directly is not safe for production,
// but works fine for personal/testing use.
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY || "dummy", 
  dangerouslyAllowBrowser: true 
});

const AIChat = ({ cartItems }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your AI Shopping Assistant. Ask me anything about the products you're scanning, recipes, or price history!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    // Check if API key is missing
    if (!import.meta.env.VITE_GROQ_API_KEY) {
      setMessages(prev => [...prev, { role: 'user', content: input }, 
        { role: 'assistant', content: '❌ Error: VITE_GROQ_API_KEY is not set in the .env file. Please add your key to use the AI chat.' }]);
      setInput('');
      return;
    }

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    // Provide context of current cart items to the AI secretly behind the scenes
    const systemPrompt = `You are a helpful smart shopping assistant in a POS/Barcode scanner app called Skanit. 
    The user's current scanned cart items are: ${JSON.stringify(cartItems.map(i => i.name))}
    Answer briefly, professionally, and enthusiastically.`;

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          ...newMessages.map(m => ({ role: m.role, content: m.content }))
        ],
        model: 'mixtral-8x7b-32768', // Excellent fast model on Groq
      });

      const reply = completion.choices[0]?.message?.content || "Sorry, I didn't get that.";
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Sorry, there was an error processing your request. Please check your API key.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-title">
          <Bot size={24} color="#00C6FF" />
          <h2>AI Shopping Assistant</h2>
        </div>
        <button className="clear-chat" onClick={() => setMessages([{ role: 'assistant', content: "Chat cleared! How can I help?" }])}>
          <Trash2 size={18} />
        </button>
      </div>

      <div className="chat-messages" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`message-wrapper ${msg.role}`}>
            <div className="message-bubble">
              {msg.role === 'assistant' ? <Bot size={16} className="msg-icon" /> : <User size={16} className="msg-icon user-icon" />}
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message-wrapper assistant">
            <div className="message-bubble typing">
              <span className="dot"></span><span className="dot"></span><span className="dot"></span>
            </div>
          </div>
        )}
      </div>

      <div className="chat-input-area">
        <input 
          type="text" 
          placeholder="Ask about your products..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        <button className="send-btn" onClick={handleSend} disabled={!input.trim() || isLoading}>
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default AIChat;
