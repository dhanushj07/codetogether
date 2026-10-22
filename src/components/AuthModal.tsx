import React, { useState } from 'react';
import { User } from '../types';
import { storage } from '../services/storageService';
import { X, LogIn, Sparkles, UserCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUserChanged: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChanged,
}) => {
  const [username, setUsername] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [isSigningIn, setIsSigningIn] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = () => {
    setIsSigningIn(true);
    setTimeout(() => {
      const googleUser: User = {
        ...currentUser,
        id: `google_${Date.now()}`,
        name: 'Dhanush J',
        email: 'dhanushj2007@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        isOnline: true,
        isAdmin: true,
      };
      storage.setCurrentUser(googleUser);
      onUserChanged(googleUser);
      setIsSigningIn(false);
      onClose();
    }, 600);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    const customUser: User = {
      ...currentUser,
      name: username.trim(),
      email: email.trim() || `${username.toLowerCase().replace(/\s+/g, '')}@codetogether.dev`,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username.trim())}`,
    };
    storage.setCurrentUser(customUser);
    onUserChanged(customUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0e1626] border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <LogIn className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Your Developer Profile</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Official Google Sign-In Button */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-3 cursor-pointer text-xs"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isSigningIn ? 'Connecting...' : 'Continue with Google'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-slate-500 text-[11px] my-2">
          <div className="flex-1 h-px bg-slate-800" />
          <span>OR UPDATE PROFILE DETAILS</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Custom Username & Email Form */}
        <form onSubmit={handleCustomSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-slate-300 text-xs font-semibold block">Coder Name / Handle</label>
            <input
              type="text"
              placeholder="e.g. Alex Chen"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 text-xs font-semibold block">Email</label>
            <input
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer shadow-md shadow-indigo-600/20"
          >
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
};
