import React, { useState, useRef, useEffect } from 'react';
import Groq from 'groq-sdk';
import { Send, Bot, User, Trash2, Sparkles } from 'lucide-react';
import './AIChat.css';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY || 'dummy',
  dangerouslyAllowBrowser: true,
});

const SUGGESTIONS = [
  "Is the MacBook Air M4 worth it?",
  "Best budget wireless earbuds?",
  "Compare iPhone 16 vs Pixel 9",
  "Good time to buy a 4K TV?",
];

const AIChat = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hey! 👋 I'm **Skanit AI** — your personal shopping advisor. Ask me anything: product comparisons, whether it's a good time to buy, budget picks, you name it." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendMessage = async (text) => {
    const content = text || input;
    if (!content.trim() || isLoading) return;

    const userMsg = { role: 'user', content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    if (!import.meta.env.VITE_GROQ_API_KEY) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '⚠️ No Groq API key found. Add `VITE_GROQ_API_KEY` to your `.env` file to enable AI responses.'
        }]);
        setIsLoading(false);
      }, 800);
      return;
    }

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are Skanit AI, a sharp, friendly, and knowledgeable shopping advisor built into the Skanit price comparison app.
Your job: help users make smart buying decisions. Be concise but insightful (2-4 short paragraphs max).
Cover: price value, alternatives, timing ("wait for a sale" vs "buy now"), and honest trade-offs.
Use casual, confident language. Use emojis sparingly. Never make up specific prices.`
          },
          ...newMessages.map(m => ({ role: m.role, content: m.content }))
        ],
        model: 'llama-3.1-8b-instant',
      });
      const reply = completion.choices[0]?.message?.content || "Sorry, I didn't get a response.";
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Error reaching AI. Check your API key and internet connection.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: "Hey! 👋 I'm **Skanit AI** — your personal shopping advisor. Ask me anything!" }]);
  };

  // Render text with basic bold support (**text**)
  const renderContent = (text) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    );
  };

  return (
    <div className="aichat">
      {/* Header */}
      <div className="aichat__header">
        <div className="aichat__header-left">
          <div className="aichat__avatar">
            <Sparkles size={16} />
          </div>
          <div>
            <h2 className="aichat__title">Skanit AI</h2>
            <p className="aichat__status">Shopping Advisor · Always Online</p>
          </div>
        </div>
        <button className="aichat__clear" onClick={clearChat} id="clear-chat-btn" title="Clear chat">
          <Trash2 size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="aichat__messages" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`msg msg--${msg.role}`}>
            {msg.role === 'assistant' && (
              <div className="msg__avatar"><Sparkles size={12} /></div>
            )}
            <div className="msg__bubble">
              <p>{renderContent(msg.content)}</p>
            </div>
            {msg.role === 'user' && (
              <div className="msg__avatar msg__avatar--user"><User size={12} /></div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="msg msg--assistant">
            <div className="msg__avatar"><Sparkles size={12} /></div>
            <div className="msg__bubble msg__bubble--typing">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="aichat__suggestions">
          {SUGGESTIONS.map(s => (
            <button key={s} className="suggestion-chip" onClick={() => sendMessage(s)} id={`suggest-${s.slice(0,10).replace(/\s/g,'-')}`}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="aichat__input-area">
        <div className="aichat__input-box">
          <textarea
            id="chat-input"
            ref={inputRef}
            rows={1}
            placeholder="Ask anything about products…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            className="aichat__send"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            id="chat-send-btn"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
