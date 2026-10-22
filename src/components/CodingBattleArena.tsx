import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import { User, Problem, BattleSession, BattleParticipant, ExecutionResult, SupportedLanguage } from '../types';
import { INITIAL_PROBLEMS } from '../data/problemLibrary';
import { ALL_SUPPORTED_LANGUAGES, getLanguageMeta, getStarterCode } from '../services/languageHelper';
import { runCodeSandboxed } from '../services/codeRunner';
import { storage } from '../services/storageService';
import {
  Trophy,
  Swords,
  Timer,
  Play,
  Lock,
  RotateCcw,
  ArrowRight,
  Shield,
  FileText,
} from 'lucide-react';

const DEFAULT_OPPONENT: User = {
  id: 'challenger_peer',
  name: 'Code Challenger',
  email: 'challenger@codetogether.dev',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  rating: 1000,
  rankTier: 'Bronze',
  solvedCount: 0,
  battleWins: 0,
  battleLosses: 0,
  friends: [],
  isOnline: true,
};

interface CodingBattleArenaProps {
  currentUser: User;
  onExitBattle: () => void;
}

export const CodingBattleArena: React.FC<CodingBattleArenaProps> = ({
  currentUser,
  onExitBattle,
}) => {
  // Battle state
  const [selectedProblem, setSelectedProblem] = useState<Problem>(INITIAL_PROBLEMS[0]);
  const [language, setLanguage] = useState<SupportedLanguage>('python');
  const [opponent, setOpponent] = useState<User>(DEFAULT_OPPONENT);
  const [battleState, setBattleState] = useState<'lobby' | 'countdown' | 'in_progress' | 'finished'>('lobby');
  const [countdown, setCountdown] = useState<number>(3);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [showProblemDetails, setShowProblemDetails] = useState<boolean>(true);

  // Player code & progress
  const [myCode, setMyCode] = useState<string>(() => getStarterCode(INITIAL_PROBLEMS[0], 'python'));
  const [myPassedTests, setMyPassedTests] = useState<number>(0);
  const [opponentPassedTests, setOpponentPassedTests] = useState<number>(0);
  const [winner, setWinner] = useState<User | null>(null);

  // Execution feedback
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<ExecutionResult | null>(null);

  const totalTests = selectedProblem.testCases.length;

  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (battleState === 'countdown') {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      } else {
        setBattleState('in_progress');
        setElapsedSeconds(0);
      }
    }
    return () => clearTimeout(timer);
  }, [battleState, countdown]);

  // In-progress match stopwatch & simulated opponent test progression
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let botProgressionInterval: NodeJS.Timeout;

    if (battleState === 'in_progress') {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);

      // Opponent simulated algorithmic progression
      botProgressionInterval = setInterval(() => {
        setOpponentPassedTests((prev) => {
          if (prev >= totalTests) return prev;
          // Random chance of passing next test
          const shouldPassNext = Math.random() > 0.65;
          const next = shouldPassNext ? prev + 1 : prev;
          if (next >= totalTests && battleState === 'in_progress') {
            handleEndBattle(opponent);
          }
          return next;
        });
      }, 3500);
    }

    return () => {
      clearInterval(interval);
      clearInterval(botProgressionInterval);
    };
  }, [battleState, totalTests, opponent]);

  // Start Battle
  const handleStartMatch = () => {
    setMyCode(getStarterCode(selectedProblem, language));
    setMyPassedTests(0);
    setOpponentPassedTests(0);
    setWinner(null);
    setCountdown(3);
    setLastResult(null);
    setBattleState('countdown');
  };

  // Run and Submit code in battle
  const handleSubmitBattleCode = async () => {
    if (battleState !== 'in_progress') return;
    setIsSubmitting(true);
    try {
      const result = await runCodeSandboxed(myCode, selectedProblem, language);
      setLastResult(result);
      const passed = result.testResults.filter((t) => t.passed).length;
      setMyPassedTests(passed);

      if (passed === totalTests) {
        handleEndBattle(currentUser);
      }
    } catch (err: any) {
      console.error('Battle execution error', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndBattle = (winningUser: User) => {
    setWinner(winningUser);
    setBattleState('finished');

    if (winningUser.id === currentUser.id) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });

      storage.recordBattleResult(true);
    } else {
      storage.recordBattleResult(false);
    }
  };

  // Format MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
      {/* Lobby View */}
      {battleState === 'lobby' && (
        <div className="max-w-3xl mx-auto bg-[#0d1424] border border-slate-800 rounded-2xl p-6 lg:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">1v1 Synchronized Coding Battle</h1>
              <p className="text-xs text-slate-400">
                Compete on the same algorithmic problem with private editors and blind code masking.
              </p>
            </div>
          </div>

          {/* Versus Header */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-slate-900/60 p-5 rounded-xl border border-slate-800">
            {/* Player 1 */}
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-12 h-12 rounded-full border-2 border-indigo-500 object-cover"
              />
              <div>
                <span className="text-sm font-bold text-white block">{currentUser.name}</span>
                <span className="text-xs text-indigo-400 font-mono">
                  {currentUser.rankTier} · {currentUser.rating} pts
                </span>
              </div>
            </div>

            {/* Player 2 Selection */}
            <div className="flex items-center gap-3 sm:border-l sm:border-slate-800 sm:pl-4">
              <img
                src={opponent.avatar}
                alt={opponent.name}
                className="w-12 h-12 rounded-full border-2 border-rose-500 object-cover"
              />
              <div className="flex-1">
                <label className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Select Opponent
                </label>
                <select
                  value={opponent.id}
                  onChange={(e) => {
                    const all = [DEFAULT_OPPONENT, ...storage.getAllUsers().filter((u) => u.id !== currentUser.id)];
                    const found = all.find((u) => u.id === e.target.value);
                    if (found) setOpponent(found);
                  }}
                  className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded px-2 py-1 focus:outline-none w-full mt-0.5"
                >
                  <option value={DEFAULT_OPPONENT.id}>
                    {DEFAULT_OPPONENT.name} ({DEFAULT_OPPONENT.rating} pts - {DEFAULT_OPPONENT.rankTier})
                  </option>
                  {storage
                    .getAllUsers()
                    .filter((u) => u.id !== currentUser.id)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.rating} pts - {u.rankTier})
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Problem Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Battle Challenge Problem
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-h-56 overflow-y-auto p-1">
              {storage.getAllProblems().map((prob) => (
                <div
                  key={prob.id}
                  onClick={() => setSelectedProblem(prob)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedProblem.id === prob.id
                      ? 'bg-amber-950/50 border-amber-500 shadow-md shadow-amber-500/20'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-white block truncate">{prob.title}</span>
                    {prob.platformName && (
                      <span className="text-[9px] font-mono font-bold px-1 rounded bg-slate-800 text-amber-300">
                        {prob.platformName}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-semibold mt-1 block ${
                      prob.difficulty === 'Easy'
                        ? 'text-emerald-400'
                        : prob.difficulty === 'Medium'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {prob.difficulty} · {prob.category}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={onExitBattle}
              className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleStartMatch}
              className="px-6 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-lg shadow-amber-600/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Start 1v1 Battle</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Synchronized Countdown Overlay */}
      {battleState === 'countdown' && (
        <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
          <div className="text-6xl sm:text-8xl font-extrabold font-mono text-amber-400 animate-bounce">
            {countdown > 0 ? countdown : 'GO!'}
          </div>
          <p className="text-sm text-slate-400 font-mono">Get ready to code...</p>
        </div>
      )}

      {/* In-Progress Battle Interface */}
      {(battleState === 'in_progress' || battleState === 'finished') && (
        <div className="space-y-4">
          {/* Battle Header with Timer and Live Progress Strips */}
          <div className="bg-[#0e1626] border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Player 1 Progress */}
            <div className="flex items-center gap-3 flex-1 w-full">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full border border-indigo-500 object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white truncate">{currentUser.name} (You)</span>
                  <span className="font-mono text-indigo-400 font-bold tabular-nums">
                    {myPassedTests}/{totalTests} Tests
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-indigo-500 h-full transition-all duration-300"
                    style={{ width: `${(myPassedTests / totalTests) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Stopwatch Badge */}
            <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-amber-400 font-mono font-bold text-sm shrink-0">
              <Timer className="w-4 h-4" />
              <span>{formatTime(elapsedSeconds)}</span>
            </div>

            {/* Opponent Progress */}
            <div className="flex items-center gap-3 flex-1 w-full justify-end">
              <div className="flex-1 min-w-0 text-right">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-rose-400 font-bold tabular-nums">
                    {opponentPassedTests}/{totalTests} Tests
                  </span>
                  <span className="font-bold text-white truncate">{opponent.name}</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-rose-500 h-full transition-all duration-300 ml-auto"
                    style={{ width: `${(opponentPassedTests / totalTests) * 100}%` }}
                  />
                </div>
              </div>
              <img
                src={opponent.avatar}
                alt={opponent.name}
                className="w-9 h-9 rounded-full border border-rose-500 object-cover"
              />
            </div>
          </div>

          {/* Collapsible Problem Description & Testcases Drawer */}
          <div className="bg-[#0e1626] border border-slate-800 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowProblemDetails((p) => !p)}
              className="w-full px-4 py-2.5 bg-[#111827] flex items-center justify-between text-xs font-semibold text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span className="font-bold">{selectedProblem.title}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] ${
                    selectedProblem.difficulty === 'Easy'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                      : selectedProblem.difficulty === 'Medium'
                      ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                      : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {selectedProblem.difficulty}
                </span>
                <span className="text-slate-400">· {selectedProblem.category}</span>
              </div>
              <span className="text-[11px] text-indigo-400 font-medium">
                {showProblemDetails ? 'Hide Problem Details ▲' : 'Show Problem & Testcases ▼'}
              </span>
            </button>

            {showProblemDetails && (
              <div className="p-4 space-y-3 text-xs border-t border-slate-800/80 max-h-60 overflow-y-auto">
                <div className="text-slate-300 whitespace-pre-line leading-relaxed">
                  {selectedProblem.description}
                </div>

                {/* Examples */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                  {selectedProblem.examples.slice(0, 2).map((ex, i) => (
                    <div
                      key={i}
                      className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] space-y-1"
                    >
                      <div className="text-slate-400 font-semibold font-sans">Example {i + 1}:</div>
                      <div>
                        <span className="text-slate-400">Input: </span>
                        <span className="text-slate-200">{ex.input}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Output: </span>
                        <span className="text-emerald-400 font-bold">{ex.output}</span>
                      </div>
                      {ex.explanation && (
                        <div className="text-slate-400 font-sans text-[10px]">
                          <span className="text-slate-500">Explanation: </span>
                          {ex.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                {selectedProblem.constraints && selectedProblem.constraints.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 text-[11px]">
                    <span className="font-semibold text-slate-400 block mb-1">Constraints:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-300 font-mono text-[10px]">
                      {selectedProblem.constraints.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Two-Column Editor Arena: Your Editor vs Opponent Masked Screen */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[500px]">
            {/* Left: Your Private Editor */}
            <div className="bg-[#0b101b] border border-slate-800 rounded-xl flex flex-col overflow-hidden">
              <div className="h-10 bg-[#111827] border-b border-slate-800 px-3 flex items-center justify-between text-xs gap-2">
                <span className="font-bold text-white flex items-center gap-1.5 truncate">
                  <Shield className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Editor ({getLanguageMeta(language).name})</span>
                </span>
                <div className="flex items-center gap-2">
                  <select
                    value={language}
                    onChange={(e) => {
                      const newLang = e.target.value as SupportedLanguage;
                      setLanguage(newLang);
                      const starter = getStarterCode(selectedProblem, newLang);
                      setMyCode(starter);
                    }}
                    className="bg-slate-900 border border-slate-700 text-[11px] text-slate-200 px-2 py-1 rounded cursor-pointer"
                  >
                    {ALL_SUPPORTED_LANGUAGES.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleSubmitBattleCode}
                    disabled={isSubmitting || battleState === 'finished'}
                    className="px-3 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-md transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{isSubmitting ? 'Testing...' : 'Submit & Test'}</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-[360px]">
                <Editor
                  height="100%"
                  theme="vs-dark"
                  language={getLanguageMeta(language).monacoLang}
                  value={myCode}
                  onChange={(val) => setMyCode(val || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', monospace",
                    automaticLayout: true,
                  }}
                />
              </div>

              {/* Instant Test Output strip */}
              {lastResult && (
                <div className="p-3 bg-slate-900 border-t border-slate-800 text-xs font-mono space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Results:</span>
                    <span
                      className={`font-bold ${
                        lastResult.success ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {lastResult.testResults.filter((t) => t.passed).length}/{totalTests} Tests
                      Passing ({lastResult.totalDurationMs}ms)
                    </span>
                  </div>

                  {/* Error Solver Diagnostic & 1-Click Auto-Fix Banner */}
                  {lastResult.errorDiagnostic && (
                    <div className="p-2.5 rounded-lg bg-rose-950/50 border border-rose-500/40 text-[11px] font-sans space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-rose-300 flex items-center gap-1">
                          ⚠️ Error Solver: {lastResult.errorDiagnostic.title}
                        </span>
                        {lastResult.errorDiagnostic.fixedCode && (
                          <button
                            onClick={() => {
                              if (lastResult.errorDiagnostic?.fixedCode) {
                                setMyCode(lastResult.errorDiagnostic.fixedCode);
                              }
                            }}
                            className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] cursor-pointer"
                          >
                            1-Click Auto-Fix
                          </button>
                        )}
                      </div>
                      <p className="text-slate-300">{lastResult.errorDiagnostic.description}</p>
                      <p className="text-amber-300 font-mono text-[10px]">
                        Fix: {lastResult.errorDiagnostic.suggestedFix}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Opponent Masked Screen (Strict anti-cheat policy) */}
            <div className="bg-[#0b101b] border border-slate-800 rounded-xl flex flex-col overflow-hidden">
              <div className="h-10 bg-[#111827] border-b border-slate-800 px-4 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                  Opponent's Private Screen ({opponent.name})
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Anti-Cheat Masked</span>
              </div>

              <div className="flex-1 min-h-[360px] bg-slate-950 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                  <Lock className="w-8 h-8 text-rose-500/80" />
                </div>
                <div className="max-w-xs space-y-1">
                  <h4 className="text-sm font-bold text-slate-200">Opponent Code Obfuscated</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Per CodeTogether battle rules, live opponent code is strictly hidden to prevent
                    copying.
                  </p>
                </div>
                <div className="bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-800 text-xs font-mono text-slate-300">
                  Opponent Progress:{' '}
                  <span className="text-rose-400 font-bold">{opponentPassedTests}/{totalTests} tests</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Finished Victory / Defeat Modal */}
      {battleState === 'finished' && winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e1626] border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-5 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
              <Trophy className="w-8 h-8 text-amber-400" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-white">
                {winner.id === currentUser.id ? 'VICTORY!' : 'DEFEAT'}
              </h3>
              <p className="text-xs text-slate-400">
                {winner.id === currentUser.id
                  ? `You solved all ${totalTests} test cases in ${formatTime(elapsedSeconds)}!`
                  : `${opponent.name} solved the problem first in ${formatTime(elapsedSeconds)}.`}
              </p>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Rating Delta</span>
                <span
                  className={`text-lg font-bold font-mono mt-0.5 block ${
                    winner.id === currentUser.id ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {winner.id === currentUser.id ? '+25 pts' : '-15 pts'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Time Elapsed</span>
                <span className="text-lg font-bold font-mono text-white mt-0.5 block">
                  {formatTime(elapsedSeconds)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onExitBattle}
                className="flex-1 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Back to Dashboard
              </button>
              <button
                onClick={handleStartMatch}
                className="flex-1 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Rematch</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
