import React, { useState } from 'react';
import { User, UserRole } from '../types.ts';
import { ADMIN_EMAIL } from '../constants.ts';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName) return;

    // Secret logic: If email matches ADMIN_EMAIL, user becomes Admin
    const role = email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() 
      ? UserRole.ADMIN 
      : UserRole.GUEST;

    const newUser: User = {
      firstName,
      lastName,
      email: email || undefined,
      role
    };

    onLogin(newUser);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[url('https://images.unsplash.com/photo-1565691083756-347590822183?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full max-w-md p-8 bg-zuz-dark border border-zuz-border rounded-lg shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-white tracking-widest uppercase mb-2">
            ZUZ <span className="text-zuz-red">FACTORY</span>
          </h1>
          <p className="text-zuz-gray text-sm tracking-wide">ЗАВОД ПРОСТАВОК</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zuz-gray uppercase mb-1">Имя</label>
              <input 
                type="text" 
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-zuz-black border border-zuz-border rounded px-3 py-3 text-white focus:outline-none focus:border-zuz-red transition-colors"
                placeholder="Иван"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zuz-gray uppercase mb-1">Фамилия</label>
              <input 
                type="text" 
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-zuz-black border border-zuz-border rounded px-3 py-3 text-white focus:outline-none focus:border-zuz-red transition-colors"
                placeholder="Иванов"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zuz-gray uppercase mb-1">
              Email <span className="text-xs normal-case text-gray-600">(опционально)</span>
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zuz-black border border-zuz-border rounded px-3 py-3 text-white focus:outline-none focus:border-zuz-red transition-colors"
              placeholder="user@example.com"
            />
            <p className="text-[10px] text-gray-500 mt-1">Введите корпоративную почту для доступа к управлению.</p>
          </div>

          <button 
            type="submit"
            className="w-full bg-zuz-red hover:bg-red-700 text-white font-bold py-4 rounded uppercase tracking-wider transition-all transform hover:scale-[1.02]"
          >
            Войти в систему
          </button>
        </form>
      </div>
    </div>
  );
};