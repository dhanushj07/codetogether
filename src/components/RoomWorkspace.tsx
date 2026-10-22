import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Room, User, Problem, SupportedLanguage, Message, ExecutionResult, CodeSnapshot } from '../types';
import { INITIAL_PROBLEMS, detectPlatformFromUrl, createProblemFromUrl } from '../data/problemLibrary';
import { ALL_SUPPORTED_LANGUAGES, getLanguageMeta, getStarterCode } from '../services/languageHelper';
import { runCodeSandboxed } from '../services/codeRunner';
import { storage } from '../services/storageService';
import {
  Play,
  Copy,
  Check,
  Video,
  VideoOff,
  Mic,
  MicOff,
  MessageSquare,
  Users,
  Camera,
  Share2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Link as LinkIcon,
  Save,
  Clock,
  Sparkles,
  Sheet,
  CreditCard,
  Send,
  Code2,
  Smile,
  ShieldAlert,
  SlidersHorizontal,
  Maximize2,
  Minimize2,
  Wrench,
  Shield,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  CheckCheck,
  Terminal,
} from 'lucide-react';

interface RoomWorkspaceProps {
  room: Room;
  currentUser: User;
  onLeaveRoom: () => void;
  onOpenProblemLibrary: () => void;
  onOpenSubscriptions: () => void;
  onOpenSheets: () => void;
  onOpenJudge0Config: () => void;
}

export const RoomWorkspace: React.FC<RoomWorkspaceProps> = ({
  room,
  currentUser,
  onLeaveRoom,
  onOpenProblemLibrary,
  onOpenSubscriptions,
  onOpenSheets,
  onOpenJudge0Config,
}) => {
  // State
  const [currentProblem, setCurrentProblem] = useState<Problem>(() => {
    return storage.getAllProblems().find((p) => p.id === room.currentProblemId) || INITIAL_PROBLEMS[0];
  });
  const [language, setLanguage] = useState<SupportedLanguage>(room.language || 'javascript');
  const [code, setCode] = useState<string>(() => {
    return room.codeBuffer || getStarterCode(currentProblem, room.language || 'javascript');
  });
  const [isCopiedCode, setIsCopiedCode] = useState(false);

  // Link problem URL state
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkInputUrl, setLinkInputUrl] = useState('');
  const [linkInputError, setLinkInputError] = useState('');
  const [linkPlatformPreview, setLinkPlatformPreview] = useState<string | null>(null);

  // Panels layout
  const [isProblemCollapsed, setIsProblemCollapsed] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<'video' | 'chat' | 'participants'>('chat');
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const [isVideoFloating, setIsVideoFloating] = useState(false);

  // Video call state (Jitsi Meet)
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  // Execution state & LeetCode testcase drawer
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [activeConsoleTab, setActiveConsoleTab] = useState<'testcase' | 'tests' | 'error_solver' | 'console'>('testcase');
  const [selectedTestCaseIdx, setSelectedTestCaseIdx] = useState<number>(0);
  const [customInputJson, setCustomInputJson] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [autoFixSuccessToast, setAutoFixSuccessToast] = useState<boolean>(false);

  // Chat & messaging
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [snippetMode, setSnippetMode] = useState(false);
  const [snippetInput, setSnippetInput] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Snapshots
  const [snapshots, setSnapshots] = useState<CodeSnapshot[]>([]);
  const [showSnapshotsModal, setShowSnapshotsModal] = useState(false);
  const [snapshotTitleInput, setSnapshotTitleInput] = useState('');
  const [snapshotSuccessToast, setSnapshotSuccessToast] = useState(false);

  // Sync Room Updates
  useEffect(() => {
    const unsub = storage.subscribeToBroadcast((msg) => {
      if (msg.type === 'ROOM_UPDATED' && msg.payload.id === room.id) {
        if (msg.payload.codeBuffer !== undefined && msg.payload.codeBuffer !== code) {
          setCode(msg.payload.codeBuffer);
        }
        if (msg.payload.currentProblemId) {
          const p = storage.getAllProblems().find((x) => x.id === msg.payload.currentProblemId);
          if (p) setCurrentProblem(p);
        }
      } else if (msg.type === 'MESSAGE_SENT' && msg.payload.roomId === room.id) {
        setMessages((prev) => [...prev, msg.payload]);
      } else if (msg.type === 'REACTION_UPDATED' && msg.payload.roomId === room.id) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msg.payload.messageId ? { ...m, reactions: msg.payload.reactions } : m
          )
        );
      }
    });

    // Initial messages & snapshots load
    setMessages(storage.getMessages(room.id));
    setSnapshots(storage.getSnapshots(room.id));

    return () => unsub();
  }, [room.id]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Code change broadcast
  const handleEditorChange = (value?: string) => {
    const newCode = value || '';
    setCode(newCode);
    const updatedRoom: Room = { ...room, codeBuffer: newCode, language };
    storage.saveRoom(updatedRoom);
  };

  // Run Test cases with multi-language engine and error solver integration
  const handleRunCode = async (overrideCode?: string, customInput?: any[]) => {
    setIsRunning(true);
    const codeToRun = overrideCode || code;
    try {
      const result = await runCodeSandboxed(codeToRun, currentProblem, language, customInput);
      setExecutionResult(result);
      if (result.errorDiagnostic || !result.success) {
        setActiveConsoleTab('tests');
      } else {
        setActiveConsoleTab('tests');
        storage.incrementSolvedCount(currentProblem.id);
      }
    } catch (err: any) {
      setExecutionResult({
        success: false,
        stdout: '',
        testResults: [],
        totalDurationMs: 0,
        error: err.message || 'Error executing code',
      });
      setActiveConsoleTab('tests');
    } finally {
      setIsRunning(false);
    }
  };

  // Run Custom Testcase
  const handleRunCustomTestcase = () => {
    try {
      if (!customInputJson.trim()) {
        const defaultInput = currentProblem.testCases[0]?.input || [];
        handleRunCode(code, defaultInput);
        return;
      }
      const parsed = JSON.parse(customInputJson);
      const inputArr = Array.isArray(parsed) ? parsed : [parsed];
      handleRunCode(code, inputArr);
    } catch {
      alert('Custom testcase input must be valid JSON, e.g. [[2,7,11,15], 9]');
    }
  };

  // Auto-Fix Error (1-Click)
  const handleApplyAutoFix = (fixedCode: string) => {
    setCode(fixedCode);
    handleEditorChange(fixedCode);
    setAutoFixSuccessToast(true);
    setTimeout(() => setAutoFixSuccessToast(false), 3000);
    handleRunCode(fixedCode);
  };

  // Copy Room Code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    setIsCopiedCode(true);
    setTimeout(() => setIsCopiedCode(false), 2000);
  };

  // Handle URL change for link importer
  const handleLinkUrlChange = (val: string) => {
    setLinkInputUrl(val);
    setLinkInputError('');
    if (val.trim().startsWith('http')) {
      const { platform } = detectPlatformFromUrl(val.trim());
      setLinkPlatformPreview(platform);
    } else {
      setLinkPlatformPreview(null);
    }
  };

  // Submit and load new problem via link
  const handlePasteProblemLink = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = linkInputUrl.trim();
    if (!trimmed) {
      setLinkInputError('Please enter a problem URL');
      return;
    }
    if (!trimmed.startsWith('http')) {
      setLinkInputError('URL must start with http:// or https://');
      return;
    }

    const newProblem = createProblemFromUrl(trimmed);
    storage.saveImportedProblem(newProblem);

    const starter = newProblem.starterCode[language] || '';
    setCode(starter);
    setCurrentProblem(newProblem);

    const updatedRoom: Room = {
      ...room,
      currentProblemId: newProblem.id,
      codeBuffer: starter,
    };
    storage.saveRoom(updatedRoom);

    // Broadcast system message in room chat
    const alertMsg: Message = {
      id: `sys_${Date.now()}`,
      roomId: room.id,
      senderId: 'system',
      senderName: 'Room Bot',
      senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
      text: `🔗 ${currentUser.name} linked a new challenge: "${newProblem.title}" from ${newProblem.platformName || 'Platform'}!`,
      reactions: {},
      timestamp: Date.now(),
    };
    storage.sendMessage(alertMsg);

    setShowLinkModal(false);
    setLinkInputUrl('');
    setLinkInputError('');
    setLinkPlatformPreview(null);
  };

  // Chat message send
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() && !snippetInput.trim()) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      roomId: room.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: messageInput.trim(),
      codeSnippet: snippetMode && snippetInput.trim()
        ? { code: snippetInput.trim(), language }
        : undefined,
      reactions: {},
      timestamp: Date.now(),
    };

    storage.sendMessage(newMessage);
    setMessageInput('');
    setSnippetInput('');
    setSnippetMode(false);
  };

  // Toggle emoji reaction
  const handleReaction = (messageId: string, emoji: string) => {
    storage.toggleReaction(room.id, messageId, emoji, currentUser.id);
  };

  // Save Snapshot
  const handleSaveSnapshot = () => {
    const title = snapshotTitleInput.trim() || `Snapshot #${snapshots.length + 1}`;
    const snap = storage.saveSnapshot(room.id, title, code, language, currentUser.name);
    setSnapshots((prev) => [snap, ...prev]);
    setSnapshotTitleInput('');
    setSnapshotSuccessToast(true);
    setTimeout(() => setSnapshotSuccessToast(false), 3000);
  };

  const handleRestoreSnapshot = (snap: CodeSnapshot) => {
    setCode(snap.code);
    setLanguage(snap.language);
    storage.saveRoom({ ...room, codeBuffer: snap.code, language: snap.language });
    setShowSnapshotsModal(false);
  };

  // Jitsi Room URL with room code
  const jitsiRoomUrl = `https://meet.jit.si/CodeTogether_${room.code}#config.startWithAudioMuted=${isMicMuted}&config.startWithVideoMuted=${isCameraOff}&interfaceConfig.TOOLBAR_BUTTONS=['microphone','camera','tileview','chat']`;

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] bg-[#090d16] overflow-hidden text-slate-100">
      {/* Top Workspace Header */}
      <div className="h-14 bg-[#0d1424] border-b border-slate-800 px-4 flex items-center justify-between gap-4 shrink-0">
        {/* Left: Room Info & Code */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onLeaveRoom}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Leave Room"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                {room.name}
              </h1>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 font-mono text-xs font-bold text-indigo-400 bg-indigo-950/70 border border-indigo-800/60 px-2 py-0.5 rounded hover:bg-indigo-900/60 transition-colors cursor-pointer"
                title="Click to copy Room Code"
              >
                <span>{room.code}</span>
                {isCopiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 truncate hidden sm:block">
              Solving: <span className="text-slate-300 font-semibold">{currentProblem.title}</span> ({currentProblem.difficulty})
            </p>
          </div>
        </div>

        {/* Center: Controls & Execution Actions */}
        <div className="flex items-center gap-2">
          {/* Language Selector (All 18 Programming Languages) */}
          <select
            value={language}
            onChange={(e) => {
              const newLang = e.target.value as SupportedLanguage;
              setLanguage(newLang);
              const newStarter = getStarterCode(currentProblem, newLang);
              setCode(newStarter);
              handleEditorChange(newStarter);
            }}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500 font-medium cursor-pointer shadow-sm"
          >
            {ALL_SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.id} value={l.id} className="bg-[#0f172a] text-slate-200 py-1">
                {l.name}
              </option>
            ))}
          </select>

          {/* Run Tests Button */}
          <button
            onClick={() => handleRunCode()}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-md shadow-emerald-600/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Running Tests...' : 'Run Code'}</span>
          </button>

          {/* Save Snapshot */}
          <button
            onClick={() => setShowSnapshotsModal(true)}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Snapshots & Version History"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Snapshots ({snapshots.length})</span>
          </button>
        </div>

        {/* Right: Room Capacity & Integrations */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Member Slots Counter with Upgrade CTA */}
          <button
            onClick={onOpenSubscriptions}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium text-slate-300 bg-slate-900 border border-slate-700 hover:border-indigo-500/60 rounded-lg transition-colors cursor-pointer"
            title="Room Capacity & Subscription (₹20/mo per extra member)"
          >
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span className="tabular-nums">
              {room.activeMembers.length}/{room.maxSlots}
            </span>
            {room.maxSlots > 2 ? (
              <span className="text-[10px] text-amber-400 font-bold ml-0.5">PRO</span>
            ) : (
              <span className="text-[10px] text-slate-400 ml-0.5">Free</span>
            )}
          </button>

          {/* Sheets Export */}
          <button
            onClick={onOpenSheets}
            className="hidden md:flex items-center gap-1 px-2.5 py-1 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 rounded-lg hover:bg-emerald-900/40 transition-colors cursor-pointer"
            title="Export session to Google Sheets"
          >
            <Sheet className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Export</span>
          </button>

          {/* Change Problem Modal */}
          <button
            onClick={onOpenProblemLibrary}
            className="px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Browse Library</span>
          </button>

          {/* Direct Link Importer Button */}
          <button
            onClick={() => setShowLinkModal(true)}
            className="px-2.5 py-1 text-xs font-semibold text-cyan-300 hover:text-white bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-700/50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
            title="Paste any problem URL from LeetCode, Codeforces, HackerRank, etc."
          >
            <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Paste Problem URL</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column IDE Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Column: Problem Drawer */}
        {!isProblemCollapsed && (
          <aside className="w-80 lg:w-96 bg-[#0c121e] border-r border-slate-800 flex flex-col shrink-0 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#111827]">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded ${
                    currentProblem.difficulty === 'Easy'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                      : currentProblem.difficulty === 'Medium'
                      ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                      : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {currentProblem.difficulty}
                </span>
                <span className="text-xs text-slate-400 font-medium truncate">
                  {currentProblem.category}
                </span>
              </div>
              <button
                onClick={() => setIsProblemCollapsed(true)}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                title="Collapse Problem"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-slate-300">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-bold text-white">{currentProblem.title}</h2>
                  {currentProblem.platformName && (
                    <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-indigo-950/80 border border-indigo-700/60 text-indigo-300">
                      {currentProblem.platformName}
                    </span>
                  )}
                </div>
                {(currentProblem.platformUrl || currentProblem.leetcodeUrl) && (
                  <a
                    href={currentProblem.platformUrl || currentProblem.leetcodeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
                  >
                    <span>Open on {currentProblem.platformName || 'Platform'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2 whitespace-pre-line leading-relaxed text-slate-300">
                {currentProblem.description}
              </div>

              {/* Examples */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Example Test Cases
                </h4>
                {currentProblem.examples.map((ex, i) => (
                  <div key={i} className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1 font-mono">
                    <div>
                      <strong className="text-slate-400">Input:</strong> {ex.input}
                    </div>
                    <div className="text-emerald-400">
                      <strong className="text-slate-400">Output:</strong> {ex.output}
                    </div>
                    {ex.explanation && (
                      <div className="text-slate-400 font-sans text-[11px] pt-1">
                        <strong className="text-slate-300">Note:</strong> {ex.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Constraints (LeetCode Specification) */}
              {currentProblem.constraints && currentProblem.constraints.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Constraints</span>
                  </h4>
                  <ul className="space-y-1.5 font-mono text-[11px] text-slate-300">
                    {currentProblem.constraints.map((c, idx) => (
                      <li key={idx} className="bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Follow-up */}
              {currentProblem.followUp && (
                <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-700/50 text-[11px] text-indigo-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-300 uppercase tracking-wider text-[10px]">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    <span>Follow-up Question</span>
                  </div>
                  <p>{currentProblem.followUp}</p>
                </div>
              )}

              {/* Hints */}
              {currentProblem.hints.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                    Hints & Strategy
                  </h4>
                  {currentProblem.hints.map((h, idx) => (
                    <div key={idx} className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-slate-300">
                      <span className="text-indigo-400 font-semibold mr-1">Hint {idx + 1}:</span> {h}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Toggle open problem when collapsed */}
        {isProblemCollapsed && (
          <button
            onClick={() => setIsProblemCollapsed(false)}
            className="w-8 bg-[#0c121e] border-r border-slate-800 hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Expand Problem Panel"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Center: Monaco Editor & Output Terminal */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#0d1117] overflow-hidden relative">
          {/* Editor Header Bar */}
          <div className="h-9 bg-[#111827] border-b border-slate-800 px-4 flex items-center justify-between text-xs text-slate-400 shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-indigo-400 font-bold">{getLanguageMeta(language).filename}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${getLanguageMeta(language).badgeColor}`}>
                {getLanguageMeta(language).name}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync Enabled
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenJudge0Config}
                className="hover:text-slate-200 flex items-center gap-1 text-[11px] cursor-pointer"
                title="Configure Judge0 Compiler"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Compiler Settings</span>
              </button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 min-h-[260px] overflow-hidden">
            <Editor
              height="100%"
              theme="vs-dark"
              language={getLanguageMeta(language).monacoLang}
              value={code}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', Consolas, monospace",
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                cursorBlinking: 'smooth',
                renderWhitespace: 'selection',
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>

          {/* Auto-Fix Toast */}
          {autoFixSuccessToast && (
            <div className="absolute top-12 right-6 bg-emerald-950 border border-emerald-500/80 text-emerald-200 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-2xl flex items-center gap-2 z-30 animate-pulse">
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <span>Auto-Fix applied to editor and re-running tests!</span>
            </div>
          )}

          {/* LeetCode Multi-Tab Console (Testcase | Test Results | Error Solver | Stdout) */}
          <div className="h-56 md:h-64 bg-[#0a0f19] border-t border-slate-800 flex flex-col shrink-0">
            {/* Console Tabs Header */}
            <div className="h-9 bg-[#0e1626] border-b border-slate-800 px-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* LeetCode Testcase Tab */}
                <button
                  onClick={() => setActiveConsoleTab('testcase')}
                  className={`font-semibold px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeConsoleTab === 'testcase'
                      ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Testcase</span>
                </button>

                {/* Test Results Tab */}
                <button
                  onClick={() => setActiveConsoleTab('tests')}
                  className={`font-semibold px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeConsoleTab === 'tests'
                      ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Test Results</span>
                </button>

                {/* Error Solver Tab */}
                <button
                  onClick={() => setActiveConsoleTab('error_solver')}
                  className={`font-semibold px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeConsoleTab === 'error_solver'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : executionResult?.error || executionResult?.errorDiagnostic
                      ? 'text-amber-400 animate-pulse'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Error Solver</span>
                  {(executionResult?.error || executionResult?.errorDiagnostic) && (
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                  )}
                </button>

                {/* Stdout Tab */}
                <button
                  onClick={() => setActiveConsoleTab('console')}
                  className={`font-semibold px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeConsoleTab === 'console'
                      ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>Stdout / Logs</span>
                </button>
              </div>

              {/* Execution Summary Tag */}
              {executionResult && (
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span
                    className={`font-bold ${
                      executionResult.success ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {executionResult.success ? 'PASSED ALL TESTS' : 'TESTS FAILED'}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-400 tabular-nums">
                    {executionResult.totalDurationMs}ms
                  </span>
                </div>
              )}
            </div>

            {/* Console Body */}
            <div className="flex-1 p-3 overflow-y-auto font-mono text-xs text-slate-300">
              {/* 1. LeetCode Testcase Tab */}
              {activeConsoleTab === 'testcase' && (
                <div className="space-y-3 font-sans">
                  {/* Case Pill Selector */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {currentProblem.testCases.map((tc, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedTestCaseIdx(idx);
                          setIsCustomMode(false);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          !isCustomMode && selectedTestCaseIdx === idx
                            ? 'bg-slate-700 text-white border border-slate-600 shadow'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        Case {idx + 1}
                        {tc.isHidden && <span className="text-[10px] text-amber-400 ml-1">(Hidden)</span>}
                      </button>
                    ))}
                    <button
                      onClick={() => setIsCustomMode(true)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                        isCustomMode
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-900 text-indigo-400 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      <span>+ Custom Case</span>
                    </button>
                  </div>

                  {/* Selected Case Content */}
                  {!isCustomMode ? (
                    (() => {
                      const tc = currentProblem.testCases[selectedTestCaseIdx] || currentProblem.testCases[0];
                      return (
                        <div className="space-y-2.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs font-mono">
                          <div>
                            <div className="text-slate-400 text-[11px] font-sans font-semibold mb-1">Input:</div>
                            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80 text-slate-200">
                              {JSON.stringify(tc?.input)}
                            </div>
                          </div>
                          <div>
                            <div className="text-slate-400 text-[11px] font-sans font-semibold mb-1">Expected Output:</div>
                            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80 text-emerald-400 font-bold">
                              {JSON.stringify(tc?.expected)}
                            </div>
                          </div>
                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => handleRunCode(code, tc?.input)}
                              disabled={isRunning}
                              className="px-3 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg cursor-pointer flex items-center gap-1.5"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Run This Testcase</span>
                            </button>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="space-y-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-300">Custom Testcase Input (JSON Array)</span>
                        <span className="text-[11px] text-slate-500">e.g. [[2, 7, 11, 15], 9]</span>
                      </div>
                      <textarea
                        value={customInputJson}
                        onChange={(e) => setCustomInputJson(e.target.value)}
                        placeholder={`e.g. ${JSON.stringify(currentProblem.testCases[0]?.input || [])}`}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 font-mono text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        rows={2}
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={handleRunCustomTestcase}
                          disabled={isRunning}
                          className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg cursor-pointer flex items-center gap-1.5 shadow"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Run Custom Testcase</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. Test Results Tab */}
              {activeConsoleTab === 'tests' && (
                executionResult ? (
                  <div className="space-y-3">
                    {/* Error Diagnostic Banner with 1-Click Auto-Fix */}
                    {(executionResult.error || executionResult.errorDiagnostic) && (
                      <div className="bg-rose-950/70 border border-rose-500/50 rounded-xl p-3 text-xs space-y-2 shadow-lg">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                              <strong className="text-rose-200 font-bold text-sm">
                                {executionResult.errorDiagnostic?.title || 'Execution Error Detected'}
                              </strong>
                            </div>
                            <p className="text-rose-300/90 text-xs font-sans leading-relaxed">
                              {executionResult.errorDiagnostic?.description || executionResult.error}
                            </p>
                          </div>

                          {/* 1-Click Auto-Fix Button */}
                          {executionResult.errorDiagnostic?.fixedCode && (
                            <button
                              onClick={() => handleApplyAutoFix(executionResult.errorDiagnostic!.fixedCode!)}
                              className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-md shadow-emerald-900/50 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0"
                              title="Click to automatically apply corrected code to your Monaco editor"
                            >
                              <Wrench className="w-3.5 h-3.5" />
                              <span>Auto-Fix Code</span>
                            </button>
                          )}
                        </div>

                        {executionResult.errorDiagnostic?.suggestedFix && (
                          <div className="text-[11px] bg-black/40 p-2 rounded-lg border border-rose-800/40 text-amber-200 font-sans flex items-center justify-between gap-2">
                            <span>
                              <strong>Suggested Fix: </strong>
                              {executionResult.errorDiagnostic.suggestedFix}
                            </span>
                            <button
                              onClick={() => setActiveConsoleTab('error_solver')}
                              className="text-indigo-400 hover:underline shrink-0 font-semibold"
                            >
                              View Fix Analysis &rarr;
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Test Results Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {executionResult.testResults.map((tr) => (
                        <div
                          key={tr.testIndex}
                          className={`p-2.5 rounded-lg border text-[11px] space-y-1 ${
                            tr.passed
                              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                              : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold">Test Case #{tr.testIndex}</span>
                            <span className="font-semibold uppercase text-[10px]">
                              {tr.passed ? 'Passed' : 'Failed'} ({tr.durationMs}ms)
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Input:</span> {JSON.stringify(tr.input)}
                          </div>
                          <div>
                            <span className="text-slate-400">Expected:</span>{' '}
                            {JSON.stringify(tr.expected)}
                          </div>
                          <div>
                            <span className="text-slate-400">Actual:</span>{' '}
                            {JSON.stringify(tr.actual)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs space-y-2 py-4">
                    <p>Click 'Run Code' above or run individual test cases from the Testcase tab.</p>
                    <button
                      onClick={() => handleRunCode()}
                      disabled={isRunning}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg cursor-pointer flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Run Code Against Suite</span>
                    </button>
                  </div>
                )
              )}

              {/* 3. Error Solver Dedicated Tab */}
              {activeConsoleTab === 'error_solver' && (
                <div className="space-y-3 font-sans text-xs">
                  {executionResult?.errorDiagnostic ? (
                    <div className="bg-[#0f172a] p-4 rounded-xl border border-indigo-900/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-950 text-amber-300 border border-amber-700/50">
                            {executionResult.errorDiagnostic.type}
                          </span>
                          <h3 className="font-bold text-white text-sm">
                            {executionResult.errorDiagnostic.title}
                          </h3>
                        </div>
                        {executionResult.errorDiagnostic.fixedCode && (
                          <button
                            onClick={() => handleApplyAutoFix(executionResult.errorDiagnostic!.fixedCode!)}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow cursor-pointer flex items-center gap-1.5"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            <span>Apply Fix to Monaco Editor</span>
                          </button>
                        )}
                      </div>

                      <div className="space-y-1">
                        <strong className="text-slate-400 text-[11px] uppercase tracking-wider">Root Cause Analysis:</strong>
                        <p className="text-slate-300 leading-relaxed bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                          {executionResult.errorDiagnostic.description}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <strong className="text-slate-400 text-[11px] uppercase tracking-wider">Recommended Solution:</strong>
                        <p className="text-emerald-300 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-800/40 font-mono text-xs">
                          {executionResult.errorDiagnostic.suggestedFix}
                        </p>
                      </div>

                      {executionResult.errorDiagnostic.fixedCode && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <strong className="text-slate-400 text-[11px] uppercase tracking-wider">Corrected Code Solution:</strong>
                            <button
                              onClick={() => handleApplyAutoFix(executionResult.errorDiagnostic!.fixedCode!)}
                              className="text-xs text-emerald-400 hover:underline font-bold"
                            >
                              Click to apply &rarr;
                            </button>
                          </div>
                          <pre className="bg-[#050811] p-3 rounded-lg border border-slate-800 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-40">
                            {executionResult.errorDiagnostic.fixedCode}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-slate-400 space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                      <h4 className="font-bold text-slate-200">No Active Errors Detected</h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        The Error Solver monitors your compiler, runtime, and testcase executions. When an error occurs, it analyzes root causes and provides 1-click automatic fixes.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 4. Stdout / Logs Tab */}
              {activeConsoleTab === 'console' && (
                <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono">
                  {executionResult?.stdout || 'No console.log or standard output recorded.'}
                </pre>
              )}
            </div>
          </div>
        </main>

        {/* Right Column: Tabbed Video, Chat & Members */}
        {!isRightPanelCollapsed && (
          <aside className="w-80 lg:w-96 bg-[#0c121e] border-l border-slate-800 flex flex-col shrink-0 overflow-hidden">
            {/* Tabs Header */}
            <div className="h-10 bg-[#111827] border-b border-slate-800 px-3 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => setRightPanelTab('chat')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    rightPanelTab === 'chat'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat</span>
                </button>
                <button
                  onClick={() => setRightPanelTab('video')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    rightPanelTab === 'video'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Video Call</span>
                </button>
                <button
                  onClick={() => setRightPanelTab('participants')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    rightPanelTab === 'participants'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Members</span>
                </button>
              </div>

              <button
                onClick={() => setIsRightPanelCollapsed(true)}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                title="Collapse Panel"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Tab 1: Video Call Panel (Jitsi Meet) */}
            {rightPanelTab === 'video' && (
              <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Jitsi Meet Video Call
                    </h3>
                    <p className="text-[11px] text-slate-400">Collaborative live audio and video</p>
                  </div>
                  <button
                    onClick={() => setIsVideoFloating(!isVideoFloating)}
                    className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-md cursor-pointer"
                    title={isVideoFloating ? 'Dock to panel' : 'Pop out floating window'}
                  >
                    {isVideoFloating ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {!isVideoActive ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center space-y-4 my-auto">
                    <div className="w-12 h-12 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Join Room Video Call</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Connect with {room.activeMembers.length} team members on room #{room.code}.
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => setIsMicMuted(!isMicMuted)}
                        className={`p-2.5 rounded-lg border transition-colors cursor-pointer ${
                          isMicMuted
                            ? 'bg-rose-950/60 border-rose-500/40 text-rose-400'
                            : 'bg-slate-800 border-slate-700 text-slate-200'
                        }`}
                        title={isMicMuted ? 'Microphone Muted' : 'Microphone Active'}
                      >
                        {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setIsCameraOff(!isCameraOff)}
                        className={`p-2.5 rounded-lg border transition-colors cursor-pointer ${
                          isCameraOff
                            ? 'bg-rose-950/60 border-rose-500/40 text-rose-400'
                            : 'bg-slate-800 border-slate-700 text-slate-200'
                        }`}
                        title={isCameraOff ? 'Camera Off' : 'Camera Active'}
                      >
                        {isCameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                      </button>
                    </div>

                    <button
                      onClick={() => setIsVideoActive(true)}
                      className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-600/20 transition-colors cursor-pointer"
                    >
                      Connect Video Call
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col space-y-3">
                    {/* Embedded Jitsi Meet Frame */}
                    <div className="flex-1 min-h-[320px] rounded-xl overflow-hidden border border-slate-700 bg-black relative">
                      <iframe
                        src={jitsiRoomUrl}
                        allow="camera; microphone; fullscreen; display-capture; autoplay"
                        className="w-full h-full border-0"
                        title="Jitsi Video Call"
                      />
                    </div>

                    {/* Controls Bar */}
                    <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsMicMuted(!isMicMuted)}
                          className={`p-2 rounded-lg cursor-pointer ${
                            isMicMuted ? 'bg-rose-950 text-rose-400' : 'bg-slate-800 text-slate-200'
                          }`}
                        >
                          {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setIsCameraOff(!isCameraOff)}
                          className={`p-2 rounded-lg cursor-pointer ${
                            isCameraOff ? 'bg-rose-950 text-rose-400' : 'bg-slate-800 text-slate-200'
                          }`}
                        >
                          {isCameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                        </button>
                      </div>

                      <button
                        onClick={() => setIsVideoActive(false)}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-400 bg-rose-950/60 border border-rose-500/30 rounded-lg hover:bg-rose-900/40 transition-colors cursor-pointer"
                      >
                        Leave Call
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Live Room Chat */}
            {rightPanelTab === 'chat' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Messages List */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {messages.map((msg) => {
                    const isMe = msg.senderId === currentUser.id;

                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-2.5 text-xs group ${
                          isMe ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <img
                          src={msg.senderAvatar}
                          alt={msg.senderName}
                          className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-700"
                        />
                        <div
                          className={`max-w-[80%] rounded-xl p-3 space-y-1 ${
                            isMe
                              ? 'bg-indigo-600 text-white rounded-tr-none'
                              : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 text-[10px] opacity-80">
                            <span className="font-bold">{msg.senderName}</span>
                            <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>

                          <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                          {/* Code Snippet if attached */}
                          {msg.codeSnippet && (
                            <div className="bg-slate-950/90 rounded p-2 border border-slate-700/60 font-mono text-[11px] text-emerald-300 mt-2 overflow-x-auto">
                              <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">
                                {msg.codeSnippet.language} snippet
                              </span>
                              <code>{msg.codeSnippet.code}</code>
                            </div>
                          )}

                          {/* Reactions Display */}
                          {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1.5">
                              {Object.entries(msg.reactions).map(([emoji, uids]) => (
                                <button
                                  key={emoji}
                                  onClick={() => handleReaction(msg.id, emoji)}
                                  className={`px-1.5 py-0.5 rounded text-[11px] flex items-center gap-1 cursor-pointer ${
                                    uids.includes(currentUser.id)
                                      ? 'bg-indigo-950 border border-indigo-500/50 text-indigo-300'
                                      : 'bg-slate-800 text-slate-400'
                                  }`}
                                >
                                  <span>{emoji}</span>
                                  <span className="text-[9px] font-mono">{uids.length}</span>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Emoji Quick Picker on hover */}
                          <div className="hidden group-hover:flex items-center gap-1 pt-1 text-slate-300">
                            {['👍', '❤️', '🔥', '🚀', '💡', '👏'].map((em) => (
                              <button
                                key={em}
                                onClick={() => handleReaction(msg.id, em)}
                                className="hover:scale-125 transition-transform text-xs cursor-pointer p-0.5"
                              >
                                {em}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatBottomRef} />
                </div>

                {/* Snippet Mode input expansion */}
                {snippetMode && (
                  <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Share Code Snippet:</span>
                      <button
                        onClick={() => setSnippetMode(false)}
                        className="text-rose-400 hover:text-rose-300"
                      >
                        Cancel
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      placeholder="// Paste code snippet to discuss..."
                      value={snippetInput}
                      onChange={(e) => setSnippetInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}

                {/* Message Input Box */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 bg-[#0e1626] border-t border-slate-800 flex items-center gap-2"
                >
                  <button
                    type="button"
                    onClick={() => setSnippetMode(!snippetMode)}
                    className="p-2 text-slate-400 hover:text-indigo-400 bg-slate-900 rounded-lg border border-slate-700 cursor-pointer"
                    title="Attach Code Snippet"
                  >
                    <Code2 className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    placeholder="Type message or hints..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
                  />

                  <button
                    type="submit"
                    className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* Tab 3: Room Participants & Membership */}
            {rightPanelTab === 'participants' && (
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Room Members ({room.activeMembers.length}/{room.maxSlots})
                  </h3>
                  <button
                    onClick={onOpenSubscriptions}
                    className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                  >
                    + Upgrade Slots
                  </button>
                </div>

                <div className="space-y-2">
                  {room.activeMembers.map((member) => (
                    <div
                      key={member.id}
                      className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <span className="text-xs font-bold text-white block">{member.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono capitalize">
                            {member.role}
                          </span>
                        </div>
                      </div>

                      {member.role === 'owner' ? (
                        <span className="text-[10px] font-semibold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30">
                          Host
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          Member
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Upgrade Capacity Banner */}
                <div className="bg-indigo-950/40 border border-indigo-800/40 rounded-xl p-4 space-y-2 text-xs">
                  <span className="font-bold text-white block">Need more than 2 members?</span>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Expand room capacity for ₹20/month per additional member slot via UPI QR code.
                  </p>
                  <button
                    onClick={onOpenSubscriptions}
                    className="w-full py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
                  >
                    Upgrade Capacity
                  </button>
                </div>
              </div>
            )}
          </aside>
        )}

        {/* Toggle open right panel when collapsed */}
        {isRightPanelCollapsed && (
          <button
            onClick={() => setIsRightPanelCollapsed(false)}
            className="w-8 bg-[#0c121e] border-l border-slate-800 hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Expand Side Panel"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Snapshots Modal */}
      {showSnapshotsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e1626] border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Save className="w-4 h-4 text-indigo-400" /> Code Snapshots & History
              </h3>
              <button
                onClick={() => setShowSnapshotsModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Create Snapshot */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Snapshot label (e.g. Working TwoSum Hashmap)..."
                value={snapshotTitleInput}
                onChange={(e) => setSnapshotTitleInput(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleSaveSnapshot}
                className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                Save Current
              </button>
            </div>

            {snapshotSuccessToast && (
              <p className="text-[11px] text-emerald-400 font-medium">Snapshot saved successfully!</p>
            )}

            {/* Snapshots List */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {snapshots.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No snapshots saved yet.</p>
              ) : (
                snapshots.map((s) => (
                  <div
                    key={s.id}
                    className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">{s.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(s.createdAt).toLocaleTimeString()} · by {s.savedBy}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRestoreSnapshot(s)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-indigo-400 bg-indigo-950 border border-indigo-800/50 rounded-md hover:bg-indigo-900 transition-colors cursor-pointer"
                    >
                      Restore
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Paste Problem URL Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e1626] border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Paste Coding Problem Link</h3>
                  <p className="text-[11px] text-slate-400">
                    Import from LeetCode, Codeforces, HackerRank, GeeksforGeeks, or CodeChef
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkInputUrl('');
                  setLinkInputError('');
                  setLinkPlatformPreview(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePasteProblemLink} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">Problem URL</label>
                <input
                  type="url"
                  placeholder="https://leetcode.com/problems/3sum/ or codeforces.com/..."
                  value={linkInputUrl}
                  onChange={(e) => handleLinkUrlChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {linkPlatformPreview && (
                <div className="flex items-center gap-2 text-xs text-cyan-400 bg-cyan-950/60 p-2 rounded-lg border border-cyan-800/40">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>Detected Platform:</span>
                  <strong className="font-mono">{linkPlatformPreview}</strong>
                </div>
              )}

              {linkInputError && <p className="text-xs text-rose-400">{linkInputError}</p>}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 rounded-lg transition-all shadow-md shadow-cyan-600/25 flex items-center gap-1.5"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Load into Room for Everyone</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
