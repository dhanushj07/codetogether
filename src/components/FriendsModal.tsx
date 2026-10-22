import React, { useState } from 'react';
import { User, Room } from '../types';
import { storage } from '../services/storageService';
import { X, Users, UserPlus, Check, MessageSquare, ExternalLink } from 'lucide-react';

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  activeRoom?: Room;
  onInviteToRoom: (friend: User) => void;
}

export const FriendsModal: React.FC<FriendsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  activeRoom,
  onInviteToRoom,
}) => {
  const [invitedId, setInvitedId] = useState<string | null>(null);
  const [newFriendName, setNewFriendName] = useState('');
  const [addSuccess, setAddSuccess] = useState(false);

  if (!isOpen) return null;

  const allUsers = storage.getAllUsers().filter((u) => u.id !== currentUser.id);

  const handleInvite = (friend: User) => {
    onInviteToRoom(friend);
    setInvitedId(friend.id);
    setTimeout(() => setInvitedId(null), 2500);
  };

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendName.trim()) return;

    // Add friend
    const updatedFriends = [...new Set([...currentUser.friends, newFriendName.trim().toLowerCase()])];
    const updatedUser: User = { ...currentUser, friends: updatedFriends };
    storage.setCurrentUser(updatedUser);
    setNewFriendName('');
    setAddSuccess(true);
    setTimeout(() => setAddSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0e1626] border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Friends & Room Invites</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add Friend Form */}
        <form onSubmit={handleAddFriend} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Add friend by username or email..."
            value={newFriendName}
            onChange={(e) => setNewFriendName(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Friend</span>
          </button>
        </form>

        {addSuccess && (
          <p className="text-[11px] text-emerald-400 font-medium">Friend added to your directory!</p>
        )}

        {/* Friends Directory */}
        <div className="space-y-3 max-h-72 overflow-y-auto">
          {allUsers.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500 space-y-1">
              <Users className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-60" />
              <p className="text-slate-400">No peers in your friend list yet.</p>
              <p className="text-[11px] text-slate-500">
                Add friends using the input above or share your 6-digit room code.
              </p>
            </div>
          ) : (
            allUsers.map((friend) => (
              <div
                key={friend.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative">
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-700"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-slate-900 ${
                        friend.isOnline ? 'bg-emerald-500' : 'bg-slate-600'
                      }`}
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-white block truncate">{friend.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {friend.rankTier} · {friend.rating} pts
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeRoom ? (
                    <button
                      onClick={() => handleInvite(friend)}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    >
                      {invitedId === friend.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-300" />
                          <span>Invited</span>
                        </>
                      ) : (
                        <span>Invite to Room</span>
                      )}
                    </button>
                  ) : (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        friend.isOnline ? 'text-emerald-400 bg-emerald-950' : 'text-slate-500 bg-slate-800'
                      }`}
                    >
                      {friend.isOnline ? 'Online' : 'Offline'}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
