import { Room, User, Problem, Message, BattleSession, CodeSnapshot, SubscriptionRecord, SupportedLanguage } from '../types';
import { INITIAL_PROBLEMS } from '../data/problemLibrary';

const USERS_KEY = 'codetogether_users_v2';
const CURRENT_USER_KEY = 'codetogether_current_user_v2';
const ROOMS_KEY = 'codetogether_rooms_v2';
const MESSAGES_KEY = 'codetogether_messages_v2_';
const SNAPSHOTS_KEY = 'codetogether_snapshots_v2_';
const SUBSCRIPTIONS_KEY = 'codetogether_subscriptions_v2';
const BATTLES_KEY = 'codetogether_battles_v2_';
const IMPORTED_PROBLEMS_KEY = 'codetogether_imported_problems_v2';

// Fresh initial user profile: 0 solved, baseline rating, no fake counts
export const FRESH_DEFAULT_USER: User = {
  id: 'usr_me',
  name: 'Developer',
  email: 'dhanushj2007@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  rating: 1000,
  rankTier: 'Bronze',
  solvedCount: 0,
  battleWins: 0,
  battleLosses: 0,
  friends: [],
  isOnline: true,
  isAdmin: true,
};

// Setup multi-tab real-time BroadcastChannel
let broadcastChannel: BroadcastChannel | null = null;
try {
  broadcastChannel = new BroadcastChannel('codetogether_realtime_stream');
} catch (e) {
  console.warn('BroadcastChannel not supported in this environment', e);
}

export const storage = {
  // Current active user
  getCurrentUser(): User {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(FRESH_DEFAULT_USER));
    return FRESH_DEFAULT_USER;
  },

  setCurrentUser(user: User) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    this.broadcast({ type: 'USER_UPDATED', payload: user });
  },

  // Record an actual solved problem in real-time
  incrementSolvedCount(problemId: string) {
    const user = this.getCurrentUser();
    const updatedUser: User = {
      ...user,
      solvedCount: user.solvedCount + 1,
      rating: user.rating + 15,
      rankTier:
        user.rating + 15 >= 1800
          ? 'Platinum'
          : user.rating + 15 >= 1500
          ? 'Gold'
          : user.rating + 15 >= 1200
          ? 'Silver'
          : 'Bronze',
    };
    this.setCurrentUser(updatedUser);
    return updatedUser;
  },

  // Record battle result in real-time
  recordBattleResult(won: boolean) {
    const user = this.getCurrentUser();
    const ratingDelta = won ? 25 : -10;
    const newRating = Math.max(800, user.rating + ratingDelta);
    const updatedUser: User = {
      ...user,
      rating: newRating,
      battleWins: won ? user.battleWins + 1 : user.battleWins,
      battleLosses: won ? user.battleLosses : user.battleLosses + 1,
      solvedCount: won ? user.solvedCount + 1 : user.solvedCount,
      rankTier:
        newRating >= 1800
          ? 'Platinum'
          : newRating >= 1500
          ? 'Gold'
          : newRating >= 1200
          ? 'Silver'
          : 'Bronze',
    };
    this.setCurrentUser(updatedUser);
    return updatedUser;
  },

  // Users Directory
  getAllUsers(): User[] {
    try {
      const stored = localStorage.getItem(USERS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    const initialList = [this.getCurrentUser()];
    localStorage.setItem(USERS_KEY, JSON.stringify(initialList));
    return initialList;
  },

  addUserToDirectory(user: User) {
    const users = this.getAllUsers();
    if (!users.some((u) => u.id === user.id)) {
      users.push(user);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      this.broadcast({ type: 'DIRECTORY_UPDATED', payload: users });
    }
  },

  // Rooms
  getRooms(): Room[] {
    try {
      const stored = localStorage.getItem(ROOMS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  },

  getRoomById(roomId: string): Room | undefined {
    return this.getRooms().find((r) => r.id === roomId);
  },

  getRoomByCode(code: string): Room | undefined {
    return this.getRooms().find((r) => r.code.toUpperCase() === code.trim().toUpperCase());
  },

  saveRoom(room: Room) {
    const rooms = this.getRooms();
    const idx = rooms.findIndex((r) => r.id === room.id);
    if (idx >= 0) {
      rooms[idx] = room;
    } else {
      rooms.unshift(room);
    }
    localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
    this.broadcast({ type: 'ROOM_UPDATED', payload: room });
  },

  createRoom(
    name: string,
    description: string,
    isPrivate: boolean,
    initialProblemId = 'two-sum'
  ): Room {
    const user = this.getCurrentUser();
    const problem = this.getProblemById(initialProblemId) || INITIAL_PROBLEMS[0];
    const newRoom: Room = {
      id: `room_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      name: name.trim() || 'Collaborative Coding Workspace',
      description: description.trim() || 'Real-time pair programming session with Monaco Editor',
      ownerId: user.id,
      ownerName: user.name,
      isPrivate,
      maxSlots: 2, // Free plan default (2 members)
      activeMembers: [
        {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          role: 'owner',
          joinedAt: Date.now(),
        },
      ],
      currentProblemId: problem.id,
      language: 'javascript',
      codeBuffer: problem.starterCode.javascript,
      createdAt: Date.now(),
    };
    this.saveRoom(newRoom);
    return newRoom;
  },

  // Room messages
  getMessages(roomId: string): Message[] {
    try {
      const stored = localStorage.getItem(MESSAGES_KEY + roomId);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  },

  sendMessage(message: Message) {
    const messages = this.getMessages(message.roomId);
    messages.push(message);
    localStorage.setItem(MESSAGES_KEY + message.roomId, JSON.stringify(messages));
    this.broadcast({ type: 'MESSAGE_SENT', payload: message });
  },

  toggleReaction(roomId: string, messageId: string, emoji: string, userId: string) {
    const messages = this.getMessages(roomId);
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return;

    if (!msg.reactions) msg.reactions = {};
    const existing = msg.reactions[emoji] || [];
    if (existing.includes(userId)) {
      msg.reactions[emoji] = existing.filter((id) => id !== userId);
      if (msg.reactions[emoji].length === 0) {
        delete msg.reactions[emoji];
      }
    } else {
      msg.reactions[emoji] = [...existing, userId];
    }
    localStorage.setItem(MESSAGES_KEY + roomId, JSON.stringify(messages));
    this.broadcast({
      type: 'REACTION_UPDATED',
      payload: { roomId, messageId, reactions: msg.reactions },
    });
  },

  // Snapshots
  getSnapshots(roomId: string): CodeSnapshot[] {
    try {
      const stored = localStorage.getItem(SNAPSHOTS_KEY + roomId);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  },

  saveSnapshot(
    roomId: string,
    title: string,
    code: string,
    language: SupportedLanguage,
    savedBy: string
  ): CodeSnapshot {
    const snapshots = this.getSnapshots(roomId);
    const snap: CodeSnapshot = {
      id: `snap_${Date.now()}`,
      roomId,
      title: title.trim() || `Snapshot #${snapshots.length + 1}`,
      code,
      language,
      savedBy,
      createdAt: Date.now(),
    };
    snapshots.unshift(snap);
    localStorage.setItem(SNAPSHOTS_KEY + roomId, JSON.stringify(snapshots));
    return snap;
  },

  // Subscriptions & Payment verification
  getSubscriptions(): SubscriptionRecord[] {
    try {
      const stored = localStorage.getItem(SUBSCRIPTIONS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  },

  saveSubscription(sub: SubscriptionRecord) {
    const list = this.getSubscriptions();
    const idx = list.findIndex((s) => s.id === sub.id);
    if (idx >= 0) {
      list[idx] = sub;
    } else {
      list.unshift(sub);
    }
    localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(list));
    this.broadcast({ type: 'SUBSCRIPTION_UPDATED', payload: sub });
  },

  verifyAndApproveSubscription(subId: string): boolean {
    const subs = this.getSubscriptions();
    const sub = subs.find((s) => s.id === subId);
    if (!sub) return false;

    sub.status = 'active';
    sub.expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
    this.saveSubscription(sub);

    // Update room capacity immediately in real-time
    const room = this.getRoomById(sub.roomId);
    if (room) {
      room.maxSlots = sub.totalSlots;
      this.saveRoom(room);
    }
    return true;
  },

  // Battles
  getBattle(battleId: string): BattleSession | undefined {
    try {
      const stored = localStorage.getItem(BATTLES_KEY + battleId);
      if (stored) return JSON.parse(stored);
    } catch {}
    return undefined;
  },

  saveBattle(battle: BattleSession) {
    localStorage.setItem(BATTLES_KEY + battle.id, JSON.stringify(battle));
    this.broadcast({ type: 'BATTLE_UPDATED', payload: battle });
  },

  // Problems Management (Built-in + Imported Links)
  getImportedProblems(): Problem[] {
    try {
      const stored = localStorage.getItem(IMPORTED_PROBLEMS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  },

  saveImportedProblem(problem: Problem) {
    const list = this.getImportedProblems();
    const idx = list.findIndex((p) => p.id === problem.id || p.platformUrl === problem.platformUrl);
    if (idx >= 0) {
      list[idx] = problem;
    } else {
      list.unshift(problem);
    }
    localStorage.setItem(IMPORTED_PROBLEMS_KEY, JSON.stringify(list));
    this.broadcast({ type: 'PROBLEM_IMPORTED', payload: problem });
  },

  getAllProblems(): Problem[] {
    const imported = this.getImportedProblems();
    // Return imported on top, then built-in initial problems
    return [...imported, ...INITIAL_PROBLEMS];
  },

  getProblemById(problemId: string): Problem | undefined {
    return this.getAllProblems().find((p) => p.id === problemId);
  },

  // Real-time broadcast channel across tabs & windows
  broadcast(msg: { type: string; payload: any }) {
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage(msg);
      } catch (err) {
        console.warn('Broadcast failed', err);
      }
    }
  },

  subscribeToBroadcast(callback: (msg: { type: string; payload: any }) => void) {
    if (!broadcastChannel) return () => {};
    const handler = (event: MessageEvent) => {
      callback(event.data);
    };
    broadcastChannel.addEventListener('message', handler);
    return () => {
      broadcastChannel?.removeEventListener('message', handler);
    };
  },
};
