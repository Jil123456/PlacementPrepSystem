import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import chatApi from '../../services/chatApi';

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', content: "Hi! I'm your AI Placement Mentor. Ask me anything about DSA, Aptitude, Core Subjects, or Interview Prep!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage(newMessages);
      if (response.success) {
        setMessages((prev) => [...prev, { role: 'model', content: response.data.message }]);
      } else {
        setMessages((prev) => [...prev, { role: 'model', content: 'Sorry, I encountered an error. Please try again later.' }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'model', content: 'Network error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 hover:bg-primary-500 text-white rounded-full shadow-lg shadow-primary-500/20 flex items-center justify-center transition-transform hover:scale-110 z-50 animate-bounce"
        aria-label="Open AI Mentor Chat"
      >
        <MessageCircle className="w-7 h-7" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 md:w-[450px] lg:w-[500px] h-[600px] max-h-[85vh] bg-dark-800 border border-slate-700 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700 p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">AI Mentor</h3>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Online
            </p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-dark-900">
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-700 text-slate-300' : 'bg-primary-500/20 text-primary-400'}`}>
              {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm min-w-0 overflow-hidden ${msg.role === 'user' ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'}`}>
              {msg.role === 'user' ? (
                <p className="break-words">{msg.content}</p>
              ) : (
                <div className="prose prose-invert max-w-none prose-sm prose-p:leading-snug prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 flex-row">
            <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0 text-primary-400">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-slate-800 border border-slate-700 text-slate-200 p-3 rounded-2xl rounded-tl-none flex items-center">
              <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-700 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 bg-dark-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="w-10 h-10 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:hover:bg-primary-600 flex items-center justify-center text-white transition-colors shrink-0"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </form>
    </div>
  );
};

export default AIChat;
