import React, { useState, useEffect } from 'react';
import { User, Room, Problem } from './types';
import { storage } from './services/storageService';
import { createProblemFromUrl } from './data/problemLibrary';
import { Navbar } from './components/Navbar';
import { LaunchPage } from './components/LaunchPage';
import { Dashboard } from './components/Dashboard';
import { RoomWorkspace } from './components/RoomWorkspace';
import { CodingBattleArena } from './components/CodingBattleArena';
import { ProblemLibraryModal } from './components/ProblemLibraryModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { Judge0ConfigModal } from './components/Judge0ConfigModal';
import { CreateRoomModal } from './components/CreateRoomModal';
import { FriendsModal } from './components/FriendsModal';
import { AuthModal } from './components/AuthModal';

export default function App() {
  // Global State
  const [currentUser, setCurrentUser] = useState<User>(() => storage.getCurrentUser());
  const [rooms, setRooms] = useState<Room[]>(() => storage.getRooms());
  const [activeRoom, setActiveRoom] = useState<Room | undefined>(undefined);
  const [currentView, setCurrentView] = useState<'launch' | 'dashboard' | 'room' | 'battle' | 'problems' | 'subscriptions'>('launch');

  // Modals state
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isProblemLibraryOpen, setIsProblemLibraryOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isSheetsOpen, setIsSheetsOpen] = useState(false);
  const [isJudge0Open, setIsJudge0Open] = useState(false);
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Notifications
  const [bannerAlert, setBannerAlert] = useState<string | null>(null);

  // Real-time synchronization listener across tabs & windows
  useEffect(() => {
    const unsub = storage.subscribeToBroadcast((msg) => {
      if (msg.type === 'ROOM_UPDATED') {
        const freshRooms = storage.getRooms();
        setRooms(freshRooms);
        if (activeRoom && activeRoom.id === msg.payload.id) {
          setActiveRoom(msg.payload);
        }
      } else if (msg.type === 'USER_UPDATED') {
        setCurrentUser(storage.getCurrentUser());
      }
    });

    return () => unsub();
  }, [activeRoom]);

  // Create Room
  const handleCreateRoom = (
    name: string,
    description: string,
    isPrivate: boolean,
    initialProblemId: string
  ) => {
    const newRoom = storage.createRoom(name, description, isPrivate, initialProblemId);
    setRooms(storage.getRooms());
    setActiveRoom(newRoom);
    setCurrentView('room');
  };

  // Join Room with slot limit enforcement
  const handleJoinRoom = (roomId: string) => {
    const target = storage.getRoomById(roomId);
    if (!target) {
      setBannerAlert(`Room not found.`);
      setTimeout(() => setBannerAlert(null), 3000);
      return;
    }

    const isAlreadyMember = target.activeMembers.some((m) => m.id === currentUser.id);

    // Enforce Member Slot Capacity!
    if (!isAlreadyMember && target.activeMembers.length >= target.maxSlots) {
      setBannerAlert(
        `Room ${target.code} is full (${target.activeMembers.length}/${target.maxSlots} members). The room owner can upgrade capacity for ₹20/month via UPI.`
      );
      setTimeout(() => setBannerAlert(null), 4000);
      setIsSubscriptionOpen(true);
      return;
    }

    // Add user to room members if not already joined
    if (!isAlreadyMember) {
      target.activeMembers.push({
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        role: 'member',
        joinedAt: Date.now(),
      });
      storage.saveRoom(target);
    }

    setActiveRoom(target);
    setCurrentView('room');
  };

  // Join by 6-char Room Code
  const handleJoinByCode = (code: string) => {
    const target = storage.getRoomByCode(code);
    if (!target) {
      setBannerAlert(`No room found with code "${code}". Please verify and try again.`);
      setTimeout(() => setBannerAlert(null), 3500);
      return;
    }
    handleJoinRoom(target.id);
  };

  // Leave active room
  const handleLeaveRoom = () => {
    setActiveRoom(undefined);
    setCurrentView('dashboard');
  };

  // Select problem from library
  const handleSelectProblem = (problem: Problem) => {
    if (activeRoom) {
      const updated: Room = {
        ...activeRoom,
        currentProblemId: problem.id,
        codeBuffer: problem.starterCode[activeRoom.language || 'javascript'],
      };
      storage.saveRoom(updated);
      setActiveRoom(updated);
    }
  };

  // Quick solve from any platform link (LeetCode, Codeforces, HackerRank, etc.)
  const handleQuickSolveLink = (url: string) => {
    const imported = createProblemFromUrl(url);
    storage.saveImportedProblem(imported);
    const newRoom = storage.createRoom(
      `${imported.title} Room`,
      `Collaborative coding session for ${imported.title} (${imported.platformName || 'Platform'})`,
      false,
      imported.id
    );
    setRooms(storage.getRooms());
    setActiveRoom(newRoom);
    setCurrentView('room');
  };

  // Invite friend to active room
  const handleInviteFriend = (friend: User) => {
    if (!activeRoom) return;

    if (activeRoom.activeMembers.some((m) => m.id === friend.id)) {
      setBannerAlert(`${friend.name} is already in this room.`);
      setTimeout(() => setBannerAlert(null), 2500);
      return;
    }

    // Check slot capacity
    if (activeRoom.activeMembers.length >= activeRoom.maxSlots) {
      setBannerAlert(
        `Cannot invite ${friend.name}: room limit reached (${activeRoom.maxSlots} slots). Upgrade capacity for ₹20/month per member.`
      );
      setTimeout(() => setBannerAlert(null), 4000);
      setIsSubscriptionOpen(true);
      return;
    }

    activeRoom.activeMembers.push({
      id: friend.id,
      name: friend.name,
      avatar: friend.avatar,
      role: 'member',
      joinedAt: Date.now(),
    });
    storage.saveRoom(activeRoom);
    setActiveRoom({ ...activeRoom });
  };

  const friends = storage.getAllUsers().filter((u) => u.id !== currentUser.id);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Banner Alert if any */}
      {bannerAlert && (
        <div className="bg-amber-950/90 border-b border-amber-500/40 px-4 py-2 text-xs text-amber-200 text-center font-medium sticky top-0 z-50 flex items-center justify-center gap-2">
          <span>{bannerAlert}</span>
          <button
            onClick={() => setBannerAlert(null)}
            className="text-amber-400 hover:text-white font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Show Navbar when in app views */}
      {currentView !== 'launch' && (
        <Navbar
          currentUser={currentUser}
          activeRoom={activeRoom}
          currentView={currentView}
          onNavigate={(view) => {
            if (view === 'problems') {
              setIsProblemLibraryOpen(true);
            } else if (view === 'subscriptions') {
              setIsSubscriptionOpen(true);
            } else {
              setCurrentView(view);
            }
          }}
          onCreateRoom={() => setIsCreateRoomOpen(true)}
          onOpenFriends={() => setIsFriendsOpen(true)}
          onOpenSheets={() => setIsSheetsOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={() => {
            localStorage.clear();
            const fresh = storage.getCurrentUser();
            setCurrentUser(fresh);
            setRooms([]);
            setActiveRoom(undefined);
            setCurrentView('launch');
          }}
        />
      )}

      {/* Main Content View Switcher */}
      <div className="flex-1 flex flex-col">
        {currentView === 'launch' && (
          <LaunchPage
            onEnterWorkspace={() => setCurrentView('dashboard')}
            onOpenProblems={() => setIsProblemLibraryOpen(true)}
            onOpenSubscriptions={() => setIsSubscriptionOpen(true)}
            onQuickSolveLink={handleQuickSolveLink}
            roomsCount={rooms.length}
            problemsCount={storage.getAllProblems().length}
          />
        )}

        {currentView === 'dashboard' && (
          <Dashboard
            currentUser={currentUser}
            rooms={rooms}
            friends={friends}
            onJoinRoom={handleJoinRoom}
            onJoinByCode={handleJoinByCode}
            onCreateRoomModal={() => setIsCreateRoomOpen(true)}
            onStartBattle={() => setCurrentView('battle')}
            onOpenProblems={() => setIsProblemLibraryOpen(true)}
            onOpenSubscriptions={() => setIsSubscriptionOpen(true)}
            onOpenSheets={() => setIsSheetsOpen(true)}
            onOpenFriends={() => setIsFriendsOpen(true)}
            onViewLaunchPage={() => setCurrentView('launch')}
            onQuickSolveLink={handleQuickSolveLink}
          />
        )}

        {currentView === 'room' && activeRoom && (
          <RoomWorkspace
            room={activeRoom}
            currentUser={currentUser}
            onLeaveRoom={handleLeaveRoom}
            onOpenProblemLibrary={() => setIsProblemLibraryOpen(true)}
            onOpenSubscriptions={() => setIsSubscriptionOpen(true)}
            onOpenSheets={() => setIsSheetsOpen(true)}
            onOpenJudge0Config={() => setIsJudge0Open(true)}
          />
        )}

        {currentView === 'battle' && (
          <CodingBattleArena
            currentUser={currentUser}
            onExitBattle={() => setCurrentView('dashboard')}
          />
        )}
      </div>

      {/* Modals & Dialogs */}
      <CreateRoomModal
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
        onCreateRoom={handleCreateRoom}
      />

      <ProblemLibraryModal
        isOpen={isProblemLibraryOpen}
        onClose={() => setIsProblemLibraryOpen(false)}
        onSelectProblem={handleSelectProblem}
        currentProblemId={activeRoom?.currentProblemId}
      />

      <SubscriptionModal
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
        activeRoom={activeRoom}
        allRooms={rooms}
        currentUser={currentUser}
        onSubscriptionUpdated={() => {
          setRooms(storage.getRooms());
          if (activeRoom) {
            setActiveRoom(storage.getRoomById(activeRoom.id));
          }
        }}
      />

      <GoogleSheetsModal
        isOpen={isSheetsOpen}
        onClose={() => setIsSheetsOpen(false)}
        currentUser={currentUser}
        activeRoom={activeRoom}
      />

      <Judge0ConfigModal
        isOpen={isJudge0Open}
        onClose={() => setIsJudge0Open(false)}
      />

      <FriendsModal
        isOpen={isFriendsOpen}
        onClose={() => setIsFriendsOpen(false)}
        currentUser={currentUser}
        activeRoom={activeRoom}
        onInviteToRoom={handleInviteFriend}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onUserChanged={(u) => setCurrentUser(u)}
      />
    </div>
  );
}
