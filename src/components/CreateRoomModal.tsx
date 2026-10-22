import React, { useState } from 'react';
import { Problem } from '../types';
import { INITIAL_PROBLEMS } from '../data/problemLibrary';
import { storage } from '../services/storageService';
import { X, Plus, Lock, Globe, BookOpen } from 'lucide-react';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (name: string, description: string, isPrivate: boolean, problemId: string) => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onCreateRoom,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedProblemId, setSelectedProblemId] = useState(INITIAL_PROBLEMS[0].id);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateRoom(
      name.trim() || 'Collaborative Coding Session',
      description.trim() || 'Live algorithmic pair programming with Monaco editor',
      isPrivate,
      selectedProblemId
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0e1626] border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Create Collaborative Coding Room</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">Room Name</label>
            <input
              type="text"
              placeholder="e.g. FAANG Mock Interview Practice"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">Description / Session Topic</label>
            <input
              type="text"
              placeholder="e.g. Solving 2-Sum and Palindrome algorithms together"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">Starting Problem</label>
            <select
              value={selectedProblemId}
              onChange={(e) => setSelectedProblemId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {storage.getAllProblems().map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.difficulty} - {p.platformName || p.category})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 pt-1">
            <label className="text-slate-300 font-semibold block">Room Privacy</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  !isPrivate
                    ? 'bg-indigo-950/40 border-indigo-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Globe className="w-4 h-4 mb-1 text-indigo-400" />
                <span className="font-bold block">Public Room</span>
                <span className="text-[10px] text-slate-400">Listed on active dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  isPrivate
                    ? 'bg-indigo-950/40 border-indigo-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="w-4 h-4 mb-1 text-amber-400" />
                <span className="font-bold block">Private Room</span>
                <span className="text-[10px] text-slate-400">Joinable via 6-digit code only</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400">
            Every room includes <strong className="text-slate-200">2 member slots free</strong>. Additional members can be unlocked for ₹20/month via the subscription billing manager.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-slate-300 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-600/20 transition-colors cursor-pointer"
            >
              Launch Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
