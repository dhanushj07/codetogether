import React, { useState } from 'react';
import { User, Room, Problem } from '../types';
import {
  Code2,
  Users,
  Trophy,
  ArrowRight,
  Plus,
  KeyRound,
  Sparkles,
  Sheet,
  CreditCard,
  Lock,
  Globe,
  Flame,
  CheckCircle2,
  ExternalLink,
  Compass,
  Link as LinkIcon,
} from 'lucide-react';
import { detectPlatformFromUrl, createProblemFromUrl } from '../data/problemLibrary';
import { storage } from '../services/storageService';

interface DashboardProps {
  currentUser: User;
  rooms: Room[];
  friends: User[];
  onJoinRoom: (roomId: string) => void;
  onJoinByCode: (code: string) => void;
  onCreateRoomModal: () => void;
  onStartBattle: () => void;
  onOpenProblems: () => void;
  onOpenSubscriptions: () => void;
  onOpenSheets: () => void;
  onOpenFriends: () => void;
  onViewLaunchPage: () => void;
  onQuickSolveLink?: (url: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  rooms,
  friends,
  onJoinRoom,
  onJoinByCode,
  onCreateRoomModal,
  onStartBattle,
  onOpenProblems,
  onOpenSubscriptions,
  onOpenSheets,
  onOpenFriends,
  onViewLaunchPage,
  onQuickSolveLink,
}) => {
  const [codeInputValue, setCodeInputValue] = useState('');
  const [codeError, setCodeError] = useState('');

  // Dashboard quick link solve bar
  const [quickLinkUrl, setQuickLinkUrl] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState<string | null>(null);
  const [quickLinkError, setQuickLinkError] = useState('');

  const allProblems = storage.getAllProblems();

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeInputValue.trim()) {
      setCodeError('Please enter a 6-character room code');
      return;
    }
    setCodeError('');
    onJoinByCode(codeInputValue.trim().toUpperCase());
  };

  const handleQuickLinkChange = (val: string) => {
    setQuickLinkUrl(val);
    setQuickLinkError('');
    if (val.trim().startsWith('http')) {
      const { platform } = detectPlatformFromUrl(val.trim());
      setDetectedPlatform(platform);
    } else {
      setDetectedPlatform(null);
    }
  };

  const handleQuickLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickLinkUrl.trim();
    if (!trimmed) {
      setQuickLinkError('Please enter a valid problem link.');
      return;
    }
    if (!trimmed.startsWith('http')) {
      setQuickLinkError('Please include https:// in the link.');
      return;
    }

    if (onQuickSolveLink) {
      onQuickSolveLink(trimmed);
      setQuickLinkUrl('');
    } else {
      // Default: create imported problem and room
      const imported = createProblemFromUrl(trimmed);
      storage.saveImportedProblem(imported);
      const newRoom = storage.createRoom(
        `${imported.title} Workspace`,
        `Collaborative solving session for ${imported.title} (${imported.platformName || 'Online Platform'})`,
        false,
        imported.id
      );
      onJoinRoom(newRoom.id);
      setQuickLinkUrl('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Hero Welcome & Authentic Metrics Strip */}
      <section className="bg-gradient-to-r from-[#0d1424] via-[#111c30] to-[#0d1424] border border-slate-800 rounded-2xl p-6 lg:p-8 relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono uppercase tracking-wider font-semibold">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Real-Time Workspace Dashboard</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {currentUser.name}
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Launch collaborative pair programming rooms, solve any problem via link, challenge peers to 1v1 battles, and video call in real time.
            </p>
          </div>

          {/* Authentic Real-Time Metrics (no fake pre-populated values) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
            <div className="text-center px-3">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Solved</span>
              <span className="text-xl font-bold font-mono tabular-nums text-white block mt-0.5">
                {currentUser.solvedCount}
              </span>
            </div>
            <div className="text-center px-3 border-l border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Rating</span>
              <span className="text-xl font-bold font-mono tabular-nums text-indigo-400 block mt-0.5">
                {currentUser.rating}
              </span>
            </div>
            <div className="text-center px-3 border-l border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Battles</span>
              <span className="text-xl font-bold font-mono tabular-nums text-emerald-400 block mt-0.5">
                {currentUser.battleWins}W-{currentUser.battleLosses}L
              </span>
            </div>
            <div className="text-center px-3 border-l border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Tier</span>
              <span className="text-sm font-bold text-amber-400 block mt-1 uppercase">
                {currentUser.rankTier}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Universal Link Solve Quick Launcher */}
      <section className="bg-gradient-to-r from-[#0d1627] to-[#0f1d35] border border-cyan-500/30 rounded-xl p-4 shadow-lg">
        <form onSubmit={handleQuickLinkSubmit} className="space-y-2">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white shrink-0">
              <div className="w-7 h-7 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                <LinkIcon className="w-4 h-4" />
              </div>
              <span>Quick Link Importer:</span>
            </div>

            <div className="relative flex-1 w-full">
              <input
                type="url"
                placeholder="Paste LeetCode, Codeforces, HackerRank, GeeksforGeeks, or CodeChef URL..."
                value={quickLinkUrl}
                onChange={(e) => handleQuickLinkChange(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700 focus:border-cyan-500 rounded-lg pl-3 pr-24 py-2 text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none"
              />
              {detectedPlatform && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700/60 uppercase">
                  {detectedPlatform}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 rounded-lg shadow-md shadow-cyan-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span>Launch Room by Link</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {quickLinkError && <p className="text-xs text-rose-400 pl-9">{quickLinkError}</p>}
        </form>
      </section>

      {/* Main Action Hub Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Create Room */}
        <div
          onClick={onCreateRoomModal}
          className="bg-[#0e1626] hover:bg-[#131f36] border border-slate-800/90 hover:border-indigo-500/50 rounded-xl p-5 cursor-pointer transition-all duration-200 group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
              Create Room
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Launch a public or private collaborative workspace with Monaco editor & video calling.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 mt-4">
            <span>Setup new room</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Join with Code */}
        <div className="bg-[#0e1626] border border-slate-800/90 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-4">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Join with Code</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Enter a 6-character room code from your teammate to jump in instantly.
            </p>
          </div>
          <form onSubmit={handleCodeSubmit} className="mt-3 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="e.g. ALGO99"
                maxLength={8}
                value={codeInputValue}
                onChange={(e) => setCodeInputValue(e.target.value.toUpperCase())}
                className="w-full px-3 py-1.5 text-xs font-mono font-semibold bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 uppercase placeholder:normal-case placeholder:text-slate-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer shrink-0"
              >
                Join
              </button>
            </div>
            {codeError && <span className="text-[10px] text-rose-400">{codeError}</span>}
          </form>
        </div>

        {/* Card 3: 1v1 Battle Arena */}
        <div
          onClick={onStartBattle}
          className="bg-[#0e1626] hover:bg-[#131f36] border border-slate-800/90 hover:border-amber-500/50 rounded-xl p-5 cursor-pointer transition-all duration-200 group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-lg bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
              Coding Battle Arena
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Compete 1v1 on algorithmic challenges with private code editors and synchronized countdowns.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 mt-4">
            <span>Enter battle arena</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: Problem Catalogue */}
        <div
          onClick={onOpenProblems}
          className="bg-[#0e1626] hover:bg-[#131f36] border border-slate-800/90 hover:border-indigo-500/50 rounded-xl p-5 cursor-pointer transition-all duration-200 group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
              Problem Catalogue
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Browse {allProblems.length} challenges across LeetCode, Codeforces, HackerRank, and GFG.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 mt-4">
            <span>Explore problems</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </section>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Active Collaborative Rooms */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Active Collaborative Rooms</h2>
              <p className="text-xs text-slate-400">Join an ongoing session or launch your own room</p>
            </div>
            <button
              onClick={onCreateRoomModal}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              New Room
            </button>
          </div>

          <div className="space-y-3">
            {rooms.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-10 text-center space-y-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
                  <Code2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">No active rooms yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Create your first collaborative coding room with Monaco editor and video calling, or invite a peer with a 6-character room code.
                  </p>
                </div>
                <button
                  onClick={onCreateRoomModal}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  Create Your First Coding Room
                </button>
              </div>
            ) : (
              rooms.map((room) => {
                const isFull = room.activeMembers.length >= room.maxSlots;
                const problem = allProblems.find((p) => p.id === room.currentProblemId);

                return (
                  <div
                    key={room.id}
                    className="bg-[#0e1626] border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-800/50 px-2 py-0.5 rounded">
                          {room.code}
                        </span>
                        <h3 className="text-sm font-bold text-white truncate max-w-sm">
                          {room.name}
                        </h3>
                        {room.isPrivate ? (
                          <span className="flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                            <Lock className="w-3 h-3" /> Private
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                            <Globe className="w-3 h-3" /> Public
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-1">{room.description}</p>

                      <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                        {problem && (
                          <span className="text-slate-300 font-medium">
                            Challenge: <span className="text-indigo-300">{problem.title}</span> ({problem.difficulty})
                          </span>
                        )}
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums text-slate-400">
                          {room.activeMembers.length}/{room.maxSlots} Members
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                      <div className="flex -space-x-2 overflow-hidden">
                        {room.activeMembers.slice(0, 3).map((m) => (
                          <img
                            key={m.id}
                            src={m.avatar}
                            alt={m.name}
                            className="inline-block h-7 w-7 rounded-full ring-2 ring-slate-900 object-cover"
                            title={m.name}
                          />
                        ))}
                      </div>

                      <button
                        onClick={() => onJoinRoom(room.id)}
                        disabled={isFull && !room.activeMembers.some((m) => m.id === currentUser.id)}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                          isFull && !room.activeMembers.some((m) => m.id === currentUser.id)
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                        }`}
                      >
                        <span>{isFull && !room.activeMembers.some((m) => m.id === currentUser.id) ? 'Room Full' : 'Join Room'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Friends, Subscriptions & Google Sheets Quick Panel */}
        <div className="space-y-6">
          {/* Room Capacity & UPI Billing Card */}
          <div className="bg-[#0e1626] border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Room Capacity & UPI</h3>
                  <p className="text-[11px] text-slate-400">Expand member limit for ₹20/mo</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>Free included slots:</span>
                <span className="font-bold text-emerald-400">2 Members (₹0)</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Additional slots:</span>
                <span className="font-bold text-indigo-400">₹20 / member / mo</span>
              </div>
              <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800 text-[11px]">
                <span>Payment method:</span>
                <span className="font-mono text-cyan-300">Instant UPI QR</span>
              </div>
            </div>

            <button
              onClick={onOpenSubscriptions}
              className="w-full py-2 text-xs font-bold text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-700/50 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Manage Capacity & UPI QR</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Friends & Peers */}
          <div className="bg-[#0e1626] border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Coding Peers</h3>
              </div>
              <button
                onClick={onOpenFriends}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
              >
                View all ({friends.length})
              </button>
            </div>

            <div className="space-y-2.5">
              {friends.length === 0 ? (
                <p className="text-xs text-slate-400">No peers added yet. Invite peers using room codes!</p>
              ) : (
                friends.slice(0, 4).map((f) => (
                  <div key={f.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <img
                          src={f.avatar}
                          alt={f.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ring-2 ring-slate-900 ${
                            f.isOnline ? 'bg-emerald-500' : 'bg-slate-500'
                          }`}
                        />
                      </div>
                      <div>
                        <span className="font-semibold text-white block">{f.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Rating: {f.rating} · {f.rankTier}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Google Sheets Sync Card */}
          <div className="bg-[#0e1626] border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Sheet className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Google Sheets Export</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Log your algorithmic practice sessions, battle records, and code snippets directly to Google Sheets.
            </p>
            <button
              onClick={onOpenSheets}
              className="w-full py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Export Coding Logs</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
