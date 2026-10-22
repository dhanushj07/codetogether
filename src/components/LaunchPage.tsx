import React, { useState } from 'react';
import {
  Code2,
  Users,
  Trophy,
  Video,
  Sheet,
  CreditCard,
  ArrowRight,
  Play,
  Sparkles,
  ExternalLink,
  Shield,
  Zap,
  CheckCircle2,
  Terminal,
  Globe,
  Lock,
  Copy,
  Check,
  Link as LinkIcon,
  Layers,
  ChevronRight,
  Tv,
} from 'lucide-react';
import { INITIAL_PROBLEMS, detectPlatformFromUrl, createProblemFromUrl } from '../data/problemLibrary';
import { runCodeSandboxed } from '../services/codeRunner';
import { UPI_ID, UPI_SUPPORTED_APPS } from '../assets/upiQrCode';

interface LaunchPageProps {
  onEnterWorkspace: () => void;
  onOpenProblems: () => void;
  onOpenSubscriptions: () => void;
  onQuickSolveLink?: (url: string) => void;
  roomsCount?: number;
  problemsCount?: number;
}

export const LaunchPage: React.FC<LaunchPageProps> = ({
  onEnterWorkspace,
  onOpenProblems,
  onOpenSubscriptions,
  onQuickSolveLink,
  roomsCount = 0,
  problemsCount = INITIAL_PROBLEMS.length,
}) => {
  // Quick problem link importer on hero
  const [heroLinkInput, setHeroLinkInput] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState<string | null>(null);
  const [linkError, setLinkError] = useState('');

  // Interactive live code sandbox on the launch page
  const [demoProblemIndex, setDemoProblemIndex] = useState(0);
  const currentDemoProblem = INITIAL_PROBLEMS[demoProblemIndex];
  const [demoCode, setDemoCode] = useState(currentDemoProblem.starterCode.javascript);
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoOutput, setDemoOutput] = useState<string | null>(null);
  const [demoPassed, setDemoPassed] = useState<boolean | null>(null);

  // Pricing calculator state
  const [calcSlots, setCalcSlots] = useState(3);
  const [copiedUpi, setCopiedUpi] = useState(false);

  const extraSlots = Math.max(0, calcSlots - 2);
  const calculatedPrice = extraSlots * 20;

  const handleHeroLinkChange = (val: string) => {
    setHeroLinkInput(val);
    setLinkError('');
    if (val.trim().startsWith('http')) {
      const { platform } = detectPlatformFromUrl(val.trim());
      setDetectedPlatform(platform);
    } else {
      setDetectedPlatform(null);
    }
  };

  const handleHeroLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = heroLinkInput.trim();
    if (!trimmed) {
      setLinkError('Please enter or paste a valid coding problem URL.');
      return;
    }
    if (!trimmed.startsWith('http')) {
      setLinkError('Please include https:// in the link.');
      return;
    }
    if (onQuickSolveLink) {
      onQuickSolveLink(trimmed);
    } else {
      onEnterWorkspace();
    }
  };

  const handleRunDemo = async () => {
    setDemoRunning(true);
    setDemoOutput(null);
    setDemoPassed(null);
    try {
      const result = await runCodeSandboxed(demoCode, currentDemoProblem);
      const passedCount = result.testResults.filter((t) => t.passed).length;
      const totalCount = currentDemoProblem.testCases.length;
      setDemoPassed(result.success);
      setDemoOutput(
        result.success
          ? `All ${totalCount} test cases passed (${result.totalDurationMs}ms)`
          : `${passedCount}/${totalCount} test cases passed. ${result.error || ''}`
      );
    } catch (err: any) {
      setDemoPassed(false);
      setDemoOutput(`Runtime error: ${err.message}`);
    } finally {
      setDemoRunning(false);
    }
  };

  const handleSelectProblem = (idx: number) => {
    setDemoProblemIndex(idx);
    setDemoCode(INITIAL_PROBLEMS[idx].starterCode.javascript);
    setDemoOutput(null);
    setDemoPassed(null);
  };

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2200);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Launch Page Top Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-[#070b14]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-white leading-none">
                CodeTogether
              </span>
              <span className="text-[10px] text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Workspace
              </span>
            </div>
          </div>

          {/* Clean Nav Links */}
          <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-300">
            <a href="#quick-solve" className="hover:text-white transition-colors whitespace-nowrap">
              Solve by Link
            </a>
            <a href="#capabilities" className="hover:text-white transition-colors whitespace-nowrap">
              Features
            </a>
            <a href="#live-demo" className="hover:text-white transition-colors whitespace-nowrap">
              Interactive Editor
            </a>
            <a href="#pricing-upi" className="hover:text-white transition-colors whitespace-nowrap">
              UPI Subscription & QR
            </a>
          </div>

          {/* Primary Action Button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onEnterWorkspace}
              className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/30 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-14 pb-16 px-4 lg:px-8 overflow-hidden">
        {/* Luminous Glow Backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[380px] bg-gradient-to-b from-indigo-600/15 via-cyan-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-indigo-500/30 text-xs text-indigo-300 font-medium shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Social Coding · Shared Monaco Editor · Embedded Video · 1v1 Battle Arena</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
            Solve, Battle, and Learn Code <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
              Together in Real Time
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base leading-relaxed">
            The all-in-one developer workspace. Paste any problem link from{' '}
            <strong className="text-amber-400 font-medium">LeetCode</strong>,{' '}
            <strong className="text-cyan-400 font-medium">Codeforces</strong>,{' '}
            <strong className="text-emerald-400 font-medium">HackerRank</strong>, or{' '}
            <strong className="text-green-400 font-medium">GeeksforGeeks</strong>, code collaboratively with friends, and video call in the same window.
          </p>

          {/* Quick Solve By Link Bar (Prominent in Hero) */}
          <div id="quick-solve" className="max-w-2xl mx-auto pt-2">
            <form
              onSubmit={handleHeroLinkSubmit}
              className="bg-[#0e172a] border border-slate-700/80 hover:border-indigo-500/60 p-2 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-2 transition-all"
            >
              <div className="relative flex-1 w-full flex items-center pl-3">
                <LinkIcon className="w-4 h-4 text-cyan-400 shrink-0 mr-2" />
                <input
                  type="url"
                  placeholder="Paste any LeetCode, Codeforces, HackerRank, or GFG problem URL..."
                  value={heroLinkInput}
                  onChange={(e) => handleHeroLinkChange(e.target.value)}
                  className="w-full bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none font-mono py-1.5"
                />
                {detectedPlatform && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-700/50 uppercase mr-2 whitespace-nowrap">
                    {detectedPlatform}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Import & Solve</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
            {linkError && <p className="text-xs text-rose-400 mt-2 text-left">{linkError}</p>}
          </div>

          {/* Authentic Real-Time Metrics Strip (NO fake numbers) */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-300">
            <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400">Live Active Rooms:</span>
              <strong className="text-white font-mono">{roomsCount}</strong>
            </div>

            <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-400">Platform Problems:</span>
              <strong className="text-white font-mono">{problemsCount}+ Ready</strong>
            </div>

            <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">Execution:</span>
              <strong className="text-cyan-300 font-mono">Isolated Web Worker</strong>
            </div>

            <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">Pricing:</span>
              <strong className="text-emerald-300 font-mono">2 Free · ₹20/slot UPI</strong>
            </div>
          </div>
        </div>

        {/* Live Interactive Code Editor Preview Box */}
        <div id="live-demo" className="max-w-5xl mx-auto mt-12">
          <div className="bg-[#0e1626] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            {/* Window Top Bar */}
            <div className="bg-[#111c30] border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="font-mono text-slate-300 ml-2 font-semibold">
                  interactive_sandbox.js
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-[11px] text-emerald-400 font-mono">Instant Browser Sandbox</span>
              </div>

              {/* Problem Selector Pills */}
              <div className="flex items-center gap-1.5">
                {INITIAL_PROBLEMS.slice(0, 3).map((prob, idx) => (
                  <button
                    key={prob.id}
                    onClick={() => handleSelectProblem(idx)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      demoProblemIndex === idx
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {prob.title}
                  </button>
                ))}
              </div>

              <button
                onClick={handleRunDemo}
                disabled={demoRunning}
                className="px-3.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-md shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Play className={`w-3 h-3 fill-current ${demoRunning ? 'animate-spin' : ''}`} />
                <span>{demoRunning ? 'Running...' : 'Run Test Suite'}</span>
              </button>
            </div>

            {/* Code Body */}
            <div className="p-4 bg-[#090e1a] font-mono text-xs">
              <textarea
                value={demoCode}
                onChange={(e) => setDemoCode(e.target.value)}
                rows={9}
                className="w-full bg-transparent text-slate-200 focus:outline-none resize-none leading-relaxed font-mono"
                spellCheck={false}
              />
            </div>

            {/* Test Feedback Bar */}
            <div className="bg-[#0b1220] border-t border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Execution Output:</span>
              {demoOutput ? (
                <span
                  className={`font-bold flex items-center gap-1.5 ${
                    demoPassed ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {demoPassed ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                  )}
                  {demoOutput}
                </span>
              ) : (
                <span className="text-slate-500 text-[11px]">
                  Click 'Run Test Suite' to execute in isolated Web Worker
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Supported Coding Platforms Strip */}
      <section className="py-6 border-y border-slate-800/80 bg-[#090e1b]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Supported Problem Link Importers:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-md bg-amber-950/60 text-amber-300 border border-amber-600/40 font-mono font-bold">
              LeetCode
            </span>
            <span className="px-2.5 py-1 rounded-md bg-cyan-950/60 text-cyan-300 border border-cyan-600/40 font-mono font-bold">
              Codeforces
            </span>
            <span className="px-2.5 py-1 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-600/40 font-mono font-bold">
              HackerRank
            </span>
            <span className="px-2.5 py-1 rounded-md bg-green-950/60 text-green-300 border border-green-600/40 font-mono font-bold">
              GeeksforGeeks
            </span>
            <span className="px-2.5 py-1 rounded-md bg-orange-950/60 text-orange-300 border border-orange-600/40 font-mono font-bold">
              CodeChef
            </span>
            <span className="px-2.5 py-1 rounded-md bg-purple-950/60 text-purple-300 border border-purple-600/40 font-mono font-bold">
              NeetCode
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-mono font-bold">
              AtCoder & Custom
            </span>
          </div>
        </div>
      </section>

      {/* Core Capabilities Bento Grid */}
      <section id="capabilities" className="py-16 px-4 lg:px-8 bg-[#070b14]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
              Engineered for Developers
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Everything You Need for Collaborative Practice
            </h3>
            <p className="text-slate-400 text-sm">
              Replace disjointed Discord screenshares, separate editors, and manual timers with one integrated workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Bento Card 1: Collaborative Monaco Editor (2 Cols) */}
            <div className="md:col-span-2 bg-[#0e1626] border border-slate-800 rounded-2xl p-6 lg:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <Code2 className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-white">Full Monaco Editor with Live Multi-Tab Sync</h4>
                <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                  Powered by Microsoft's Monaco Editor engine. Syntax highlighting for JavaScript, TypeScript, and Python. Edits sync instantly across participant tabs using real-time broadcast streams.
                </p>
              </div>

              <div className="bg-[#090e1a] border border-slate-800/80 rounded-xl p-3 font-mono text-[11px] text-slate-300 space-y-1">
                <div className="flex items-center justify-between text-slate-500 pb-1 border-b border-slate-800">
                  <span>monaco_engine.ts</span>
                  <span className="text-emerald-400">Sync: Connected</span>
                </div>
                <div className="text-slate-400">// Real-time algorithmic code buffer</div>
                <div><span className="text-indigo-400">function</span> <span className="text-amber-300">solveProblem</span>(nums, target) &#123;</div>
                <div className="pl-4 text-emerald-300">return twoSumHashMap(nums, target);</div>
                <div>&#125;</div>
              </div>
            </div>

            {/* Bento Card 2: Jitsi Video Calling */}
            <div className="bg-[#0e1626] border border-slate-800 rounded-2xl p-6 lg:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-white">Integrated Jitsi Video & Voice</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Discuss solutions face-to-face while looking at the exact same lines of code. Mic and camera controls built right into the room dock.
                </p>
              </div>

              <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-slate-300 font-medium">Jitsi Room Call</span>
                </div>
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                  Zero Config
                </span>
              </div>
            </div>

            {/* Bento Card 3: 1v1 Battle Arena */}
            <div className="bg-[#0e1626] border border-slate-800 rounded-2xl p-6 lg:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-white">1v1 Synchronized Battles</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Blind coding competitions with private editors. A synchronized 3-2-1 countdown, live opponent test progression meters, and confetti victory screens.
                </p>
              </div>

              <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Match Mode:</span>
                <span className="text-amber-400 font-bold font-mono">Head-to-Head Duel</span>
              </div>
            </div>

            {/* Bento Card 4: Universal Link Importer */}
            <div className="bg-[#0e1626] border border-slate-800 rounded-2xl p-6 lg:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-white">Any Platform by URL</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Paste any problem link from LeetCode, Codeforces, HackerRank, GeeksforGeeks, or CodeChef. Auto-creates boilerplate starter code and direct external submission link.
                </p>
              </div>

              <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Direct Link:</span>
                <span className="text-purple-300 font-mono">Auto-Parsed</span>
              </div>
            </div>

            {/* Bento Card 5: Google Sheets Integration */}
            <div className="bg-[#0e1626] border border-slate-800 rounded-2xl p-6 lg:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <Sheet className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-white">Google Sheets Practice Logs</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Export session records, solved problems, battle scores, and solution logs directly to Google Sheets with 1 click.
                </p>
              </div>

              <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Export:</span>
                <span className="text-emerald-400 font-mono">Sheets API & CSV</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing & UPI QR Payment Section (Highlighting User's QR Image) */}
      <section id="pricing-upi" className="py-16 px-4 lg:px-8 border-t border-slate-800/80 bg-[#090d18]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-semibold">
              Transparent Room Capacity
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Simple Pricing with Instant UPI QR Payment
            </h3>
            <p className="text-slate-400 text-sm">
              Free forever for 2-person pair programming. Only pay ₹20/month per additional member if you need bigger group rooms!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Free Tier Card (4 Cols) */}
            <div className="lg:col-span-5 bg-[#0e1626] border border-slate-800 rounded-2xl p-6 lg:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Free Tier</span>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                    Always Free
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">₹0</span>
                  <span className="text-xs text-slate-400">/ forever</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Ideal for 1-on-1 mock technical interviews, pair programming, and coding battles.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-300 pt-3 border-t border-slate-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Up to 2 members per room (Host + 1 Partner)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Full Monaco editor & isolated Web Worker test runner</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Jitsi video calling & real-time live chat</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>1v1 synchronized battle mode</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Import any LeetCode, Codeforces, HackerRank link</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={onEnterWorkspace}
                className="w-full py-3 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Launch Free 2-Member Workspace
              </button>
            </div>

            {/* Extended Room Capacity with UPI QR Showcase (7 Cols) */}
            <div className="lg:col-span-7 bg-gradient-to-b from-[#111c30] to-[#0e1626] border border-indigo-500/40 rounded-2xl p-6 lg:p-8 flex flex-col justify-between space-y-6 shadow-2xl relative">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    Extended Room Capacity
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-500/40">
                    Pay via UPI QR (GPay / PhonePe / Paytm / BHIM)
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white">₹20</span>
                  <span className="text-xs text-slate-300">/ additional member slot / month</span>
                </div>

                <p className="text-xs text-slate-300 font-mono bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  Formula: <span className="text-cyan-300">Monthly Price = max(0, totalSlots − 2) × ₹20</span>
                </p>

                {/* Interactive Slot Stepper */}
                <div className="bg-[#0b1220] p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-semibold">Test Total Room Capacity:</span>
                    <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-slate-700">
                      <button
                        onClick={() => setCalcSlots((p) => Math.max(3, p - 1))}
                        className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer text-xs"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-white px-2">
                        {calcSlots} Members
                      </span>
                      <button
                        onClick={() => setCalcSlots((p) => Math.min(20, p + 1))}
                        className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <span className="text-slate-400">
                      {extraSlots} additional member slot{extraSlots > 1 ? 's' : ''}:
                    </span>
                    <strong className="text-base text-emerald-400 font-mono">
                      ₹{calculatedPrice} / month
                    </strong>
                  </div>
                </div>

                {/* UPI Payment Details Card */}
                <div className="bg-[#080d19] p-5 rounded-xl border border-slate-800 space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-slate-400 block font-medium">Official UPI Payment ID:</span>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono font-bold text-cyan-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 flex-1 break-all select-all">
                        {UPI_ID}
                      </code>
                      <button
                        onClick={handleCopyUpiId}
                        className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-600 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 font-medium"
                        title="Copy UPI ID"
                      >
                        {copiedUpi ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-300" />
                            <span>Copy UPI ID</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-300 space-y-1.5 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                    <div>1. Send payment to <strong className="text-white font-mono">{UPI_ID}</strong> using any UPI banking application.</div>
                    <div>2. Enter the calculated amount (<strong className="text-emerald-400 font-mono font-bold">₹{calculatedPrice}</strong>).</div>
                    <div>3. Submit your 12-digit UTR reference number in the Subscription Manager to unlock room capacity.</div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <span className="text-[11px] text-slate-400">Supported:</span>
                    {UPI_SUPPORTED_APPS.map((app) => (
                      <span key={app} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-medium">
                        {app}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={onOpenSubscriptions}
                className="w-full py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Open UPI Payment & Subscription Manager</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-4 lg:px-8 bg-[#060910] text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-300 font-bold">CodeTogether</span>
            <span>· Social Collaborative Coding Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={onEnterWorkspace}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Workspace
            </button>
            <button
              onClick={onOpenProblems}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Problem Library
            </button>
            <button
              onClick={onOpenSubscriptions}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              UPI Billing & QR
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
