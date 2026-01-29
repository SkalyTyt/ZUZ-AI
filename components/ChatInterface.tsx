import React, { useState, useRef, useEffect } from 'react';
import { User, ChatMessage } from '../types.ts';
import { sendMessageToManager, resetChat } from '../services/geminiService.ts';

interface ChatInterfaceProps {
  user: User;
  onLogout: () => void;
  onSwitchToAdmin?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ user, onLogout, onSwitchToAdmin }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Здравствуйте, ${user.firstName}! Я виртуальный менеджер завода ZUZ. Чем могу помочь? У нас вы можете узнать о наличии проставок, ценах и возможности изготовления под заказ.`,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const responseText = await sendMessageToManager(input);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const handleReset = () => {
    resetChat();
    setMessages([{
      id: Date.now().toString(),
      role: 'model',
      text: 'Диалог сброшен. Готов ответить на новые вопросы о нашей продукции.',
      timestamp: Date.now()
    }]);
  };

  return (
    <div className="flex flex-col h-screen bg-zuz-black">
      {/* Header */}
      <header className="h-16 border-b border-zuz-border flex items-center justify-between px-6 bg-zuz-dark">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zuz-red rounded flex items-center justify-center font-bold font-display text-white">
            Z
          </div>
          <div>
            <h2 className="text-white font-display font-bold leading-tight">ZUZ FACTORY</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs text-gray-400">AI Manager Online</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {onSwitchToAdmin && (
            <button 
              onClick={onSwitchToAdmin}
              className="hidden md:block px-4 py-2 text-xs font-bold text-zuz-red border border-zuz-red rounded hover:bg-zuz-red hover:text-white transition-all uppercase"
            >
              Панель Управления
            </button>
          )}
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-200">{user.firstName} {user.lastName}</p>
            <button onClick={onLogout} className="text-xs text-gray-500 hover:text-white transition-colors">
              Выйти
            </button>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-5 shadow-lg ${
                msg.role === 'user' 
                  ? 'bg-zuz-red text-white rounded-br-none' 
                  : 'bg-zuz-dark border border-zuz-border text-gray-200 rounded-bl-none'
              }`}
            >
              <div className="text-xs opacity-50 mb-1 font-bold uppercase">
                {msg.role === 'user' ? 'Вы' : 'ZUZ Менеджер'}
              </div>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-zuz-dark border border-zuz-border rounded-2xl rounded-bl-none p-5 flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-zuz-dark border-t border-zuz-border p-4 md:p-6">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex gap-3">
          <button
             type="button"
             onClick={handleReset}
             className="px-4 py-3 text-gray-400 hover:text-white bg-zuz-black border border-zuz-border rounded-lg transition-colors"
             title="Сбросить диалог"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Введите ваш вопрос (например: есть ли проставки на Toyota?)"
            className="flex-1 bg-zuz-black border border-zuz-border text-white px-5 py-4 rounded-lg focus:outline-none focus:border-zuz-red transition-all shadow-inner"
          />
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold px-8 py-3 rounded-lg uppercase tracking-wider transition-colors"
          >
            <span className="hidden md:inline">Отправить</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:hidden"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </form>
        <p className="text-center text-zuz-gray text-[10px] mt-3 uppercase tracking-widest opacity-60">
          ZUZ Intelligent Production System v2.0
        </p>
      </div>
    </div>
  );
};