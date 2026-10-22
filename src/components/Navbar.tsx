import React from 'react';
import { User, Room } from '../types';
import { Code2, Users, Trophy, BookOpen, CreditCard, Sheet, LogIn, LogOut, Plus, Home } from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  activeRoom?: Room;
  currentView: 'launch' | 'dashboard' | 'room' | 'battle' | 'problems' | 'subscriptions';
  onNavigate: (view: 'launch' | 'dashboard' | 'room' | 'battle' | 'problems' | 'subscriptions') => void;
  onCreateRoom: () => void;
  onOpenFriends: () => void;
  onOpenSheets: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeRoom,
  currentView,
  onNavigate,
  onCreateRoom,
  onOpenFriends,
  onOpenSheets,
  onOpenAuth,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#070b14]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap block">
                CodeTogether
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block">
                Social IDE & Battles
              </span>
            </div>
          </button>

          {activeRoom && currentView !== 'room' && (
            <button
              onClick={() => onNavigate('room')}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 rounded-md hover:bg-emerald-900/40 transition-colors whitespace-nowrap ml-2 cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Room: {activeRoom.code}
            </button>
          )}
        </div>

        {/* Zone 2: Navigation Links (Single-Line Controls) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => onNavigate('launch')}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer ${
              currentView === 'launch' ? 'text-indigo-400 font-semibold' : 'hover:text-white'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            Home
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'dashboard' ? 'text-indigo-400 font-semibold' : 'hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onNavigate('problems')}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
              currentView === 'problems' ? 'text-indigo-400 font-semibold' : 'hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Problems
          </button>
          <button
            onClick={() => onNavigate('battle')}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
              currentView === 'battle' ? 'text-indigo-400 font-semibold' : 'hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            1v1 Battles
          </button>
          <button
            onClick={() => onNavigate('subscriptions')}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
              currentView === 'subscriptions' ? 'text-indigo-400 font-semibold' : 'hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Subscriptions
          </button>
          <button
            onClick={onOpenSheets}
            className="transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 cursor-pointer"
          >
            <Sheet className="w-4 h-4" />
            Google Sheets
          </button>
        </nav>

        {/* Zone 3: Primary Action & Profile Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenFriends}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-lg transition-colors cursor-pointer"
            title="Friends & Invites"
          >
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Friends</span>
          </button>

          <button
            onClick={onCreateRoom}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Create Room</span>
            <span className="sm:hidden">Room</span>
          </button>

          {/* User profile avatar or Auth switch */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 group cursor-pointer"
                title={`${currentUser.name} (${currentUser.rankTier} - Rating ${currentUser.rating})`}
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full border border-indigo-500/40 object-cover"
                />
                <div className="hidden xl:block text-left">
                  <span className="text-xs font-semibold text-slate-200 block leading-tight truncate max-w-[100px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-indigo-400 font-mono block leading-tight">
                    {currentUser.rating} pts
                  </span>
                </div>
              </button>
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                title="Reset session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
