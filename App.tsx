import React, { useState, useEffect } from 'react';
import { User, ScreenState, UserRole } from './types';
import { AuthScreen } from './components/AuthScreen';
import { ChatInterface } from './components/ChatInterface';
import { AdminPanel } from './components/AdminPanel';
import { getInventory } from './services/storageService';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<ScreenState>(ScreenState.AUTH);

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('zuz_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setCurrentUser(parsedUser);
      if (parsedUser.role === UserRole.ADMIN) {
        setCurrentScreen(ScreenState.ADMIN);
      } else {
        setCurrentScreen(ScreenState.CHAT);
      }
    } else {
      // Ensure default inventory exists if first run
      const inv = getInventory();
      if (inv.length === 0) {
        // seed initial data if empty
        // logic handled inside storageService implicitly or we leave empty
      }
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('zuz_user', JSON.stringify(user));
    if (user.role === UserRole.ADMIN) {
      setCurrentScreen(ScreenState.ADMIN);
    } else {
      setCurrentScreen(ScreenState.CHAT);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('zuz_user');
    setCurrentUser(null);
    setCurrentScreen(ScreenState.AUTH);
  };

  const navigateTo = (screen: ScreenState) => {
    setCurrentScreen(screen);
  };

  return (
    <div className="min-h-screen bg-zuz-black text-white font-sans selection:bg-zuz-red selection:text-white overflow-hidden">
      {currentScreen === ScreenState.AUTH && (
        <AuthScreen onLogin={handleLogin} />
      )}

      {currentScreen === ScreenState.CHAT && currentUser && (
        <ChatInterface 
          user={currentUser} 
          onLogout={handleLogout}
          onSwitchToAdmin={currentUser.role === UserRole.ADMIN ? () => navigateTo(ScreenState.ADMIN) : undefined}
        />
      )}

      {currentScreen === ScreenState.ADMIN && currentUser && (
        <AdminPanel 
          user={currentUser} 
          onLogout={handleLogout}
          onSwitchToChat={() => navigateTo(ScreenState.CHAT)}
        />
      )}
    </div>
  );
}