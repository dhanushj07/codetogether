import React, { useState } from 'react';
import { Problem, Difficulty, CodingPlatform } from '../types';
import { INITIAL_PROBLEMS, detectPlatformFromUrl, createProblemFromUrl } from '../data/problemLibrary';
import { storage } from '../services/storageService';
import {
  X,
  BookOpen,
  Search,
  ExternalLink,
  Share2,
  Check,
  ChevronRight,
  Code2,
  Lightbulb,
  Globe,
  Link,
  Sparkles,
  Play,
  Plus,
} from 'lucide-react';

interface ProblemLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProblem: (problem: Problem) => void;
  currentProblemId?: string;
}

export const ProblemLibraryModal: React.FC<ProblemLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectProblem,
  currentProblemId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');

  // Universal URL link importer state
  const [customUrl, setCustomUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customDifficulty, setCustomDifficulty] = useState<Difficulty>('Medium');
  const [urlError, setUrlError] = useState('');
  const [importedSuccess, setImportedSuccess] = useState(false);
  const [detectedPlatformPreview, setDetectedPlatformPreview] = useState<CodingPlatform | null>(null);

  // Local storage for user imported problems
  const [importedProblems, setImportedProblems] = useState<Problem[]>(() => {
    return storage.getImportedProblems();
  });

  const allProblems = [...importedProblems, ...INITIAL_PROBLEMS];

  const [activeProblemDetail, setActiveProblemDetail] = useState<Problem | null>(() => {
    if (currentProblemId) {
      const match = allProblems.find((p) => p.id === currentProblemId);
      if (match) return match;
    }
    return allProblems[0];
  });

  if (!isOpen) return null;

  // Handle URL change to auto-fill title & detect platform
  const handleUrlChange = (val: string) => {
    setCustomUrl(val);
    setUrlError('');
    setImportedSuccess(false);
    if (val.trim().startsWith('http')) {
      const { platform, suggestedTitle } = detectPlatformFromUrl(val.trim());
      setDetectedPlatformPreview(platform);
      if (!customTitle || customTitle === 'Custom Coding Challenge') {
        setCustomTitle(suggestedTitle);
      }
    } else {
      setDetectedPlatformPreview(null);
    }
  };

  // Handle Import & Link
  const handleImportProblem = (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError('');
    setImportedSuccess(false);

    const trimmed = customUrl.trim();
    if (!trimmed) {
      setUrlError('Please paste a valid problem URL.');
      return;
    }

    try {
      new URL(trimmed);
    } catch {
      setUrlError('Invalid URL format. Please include http:// or https://');
      return;
    }

    const newProblem = createProblemFromUrl(trimmed, customTitle, customDifficulty);

    storage.saveImportedProblem(newProblem);
    const updated = storage.getImportedProblems();
    setImportedProblems(updated);

    setActiveProblemDetail(newProblem);
    setImportedSuccess(true);
    setCustomUrl('');
    setCustomTitle('');
    setDetectedPlatformPreview(null);
  };

  // Filtering
  const filteredProblems = allProblems.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.platformName && p.platformName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDiff =
      selectedDifficulty === 'All' || p.difficulty === selectedDifficulty;

    const matchesPlatform =
      selectedPlatform === 'All' ||
      (selectedPlatform === 'Linked by URL'
        ? Boolean(p.platformUrl || p.id.startsWith('ext_'))
        : p.platformName === selectedPlatform);

    return matchesSearch && matchesDiff && matchesPlatform;
  });

  const getPlatformBadgeColor = (plat?: string) => {
    switch (plat) {
      case 'LeetCode':
        return 'text-amber-400 bg-amber-950/70 border-amber-500/50';
      case 'Codeforces':
        return 'text-cyan-400 bg-cyan-950/70 border-cyan-500/50';
      case 'HackerRank':
        return 'text-emerald-400 bg-emerald-950/70 border-emerald-500/50';
      case 'GeeksforGeeks':
        return 'text-green-400 bg-green-950/70 border-green-500/50';
      case 'CodeChef':
        return 'text-orange-400 bg-orange-950/70 border-orange-500/50';
      case 'NeetCode':
        return 'text-violet-400 bg-violet-950/70 border-violet-500/50';
      default:
        return 'text-slate-400 bg-slate-900 border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0e1626] border border-slate-800 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl relative my-6 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#131d31] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Universal Coding Problem Library & Link Importer
              </h2>
              <p className="text-xs text-slate-400">
                Paste any problem link from LeetCode, Codeforces, HackerRank, GeeksforGeeks, or CodeChef
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Universal URL Importer Bar */}
        <div className="px-6 py-3.5 bg-[#101b2d] border-b border-slate-800 shrink-0">
          <form onSubmit={handleImportProblem} className="space-y-2">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Link className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="Paste problem URL (e.g. https://leetcode.com/problems/..., https://codeforces.com/..., HackerRank, GFG)"
                  value={customUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <input
                type="text"
                placeholder="Problem title (optional auto-detected)"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full sm:w-48 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={customDifficulty}
                  onChange={(e) => setCustomDifficulty(e.target.value as Difficulty)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>

                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0 shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Import by Link</span>
                </button>
              </div>
            </div>

            {detectedPlatformPreview && (
              <div className="flex items-center gap-2 text-[11px] text-cyan-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>Detected Platform:</span>
                <span className="font-bold font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700/60 text-cyan-300">
                  {detectedPlatformPreview}
                </span>
              </div>
            )}

            {urlError && <p className="text-[11px] text-rose-400">{urlError}</p>}
            {importedSuccess && (
              <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                <Check className="w-3.5 h-3.5" /> Problem successfully linked and saved in your catalog!
              </p>
            )}
          </form>
        </div>

        {/* Search & Platform Filter Toolbar */}
        <div className="px-6 py-3 bg-[#0d1422] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search problem, platform, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
            />
          </div>

          {/* Platform Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
            {['All', 'LeetCode', 'Codeforces', 'HackerRank', 'GeeksforGeeks', 'CodeChef', 'NeetCode', 'Linked by URL'].map((plat) => (
              <button
                key={plat}
                onClick={() => setSelectedPlatform(plat)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  selectedPlatform === plat
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white bg-slate-900/60'
                }`}
              >
                {plat}
              </button>
            ))}

            <div className="h-4 w-px bg-slate-800 mx-1" />

            {/* Difficulty Filters */}
            {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  selectedDifficulty === diff
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Two-Column Problem Viewer & Selection Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* Left Column: Problem List */}
          <div className="w-full md:w-5/12 border-b md:border-b-0 md:border-r border-slate-800 overflow-y-auto p-4 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 px-1">
              <span>Showing {filteredProblems.length} Problems</span>
              <span className="font-mono text-emerald-400">Live Ready</span>
            </div>

            {filteredProblems.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No problems found matching filters.
                <div className="mt-2 text-indigo-400 font-medium">Paste any link above to add it instantly!</div>
              </div>
            ) : (
              filteredProblems.map((p) => {
                const isSelected = activeProblemDetail?.id === p.id;
                const isCurrentActive = currentProblemId === p.id;

                return (
                  <div
                    key={p.id}
                    onClick={() => setActiveProblemDetail(p)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#152037] border-indigo-500 shadow-md shadow-indigo-500/10'
                        : 'bg-slate-900/50 hover:bg-slate-900 border-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold text-white">{p.title}</h4>
                          {isCurrentActive && (
                            <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono">
                              Active Room
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          {p.platformName && (
                            <span
                              className={`px-1.5 py-0.2 rounded font-mono font-bold uppercase border ${getPlatformBadgeColor(
                                p.platformName
                              )}`}
                            >
                              {p.platformName}
                            </span>
                          )}
                          <span
                            className={`font-semibold ${
                              p.difficulty === 'Easy'
                                ? 'text-emerald-400'
                                : p.difficulty === 'Medium'
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {p.difficulty}
                          </span>
                          <span>·</span>
                          <span>{p.category}</span>
                        </div>
                      </div>

                      {(p.platformUrl || p.leetcodeUrl) && (
                        <a
                          href={p.platformUrl || p.leetcodeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors shrink-0"
                          title={`Open on ${p.platformName || 'Platform'}`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Detailed View & Action to Select */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#0a0f1c] flex flex-col justify-between space-y-6">
            {activeProblemDetail ? (
              <div className="space-y-5">
                {/* Title & Platform Link Bar */}
                <div className="space-y-2 pb-4 border-b border-slate-800">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-lg font-bold text-white">{activeProblemDetail.title}</h3>
                      {activeProblemDetail.platformName && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-mono font-bold uppercase border ${getPlatformBadgeColor(
                            activeProblemDetail.platformName
                          )}`}
                        >
                          {activeProblemDetail.platformName}
                        </span>
                      )}
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          activeProblemDetail.difficulty === 'Easy'
                            ? 'text-emerald-400 bg-emerald-950/80 border border-emerald-800/40'
                            : activeProblemDetail.difficulty === 'Medium'
                            ? 'text-amber-400 bg-amber-950/80 border border-amber-800/40'
                            : 'text-rose-400 bg-rose-950/80 border border-rose-800/40'
                        }`}
                      >
                        {activeProblemDetail.difficulty}
                      </span>
                    </div>

                    {(activeProblemDetail.platformUrl || activeProblemDetail.leetcodeUrl) && (
                      <a
                        href={activeProblemDetail.platformUrl || activeProblemDetail.leetcodeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 text-xs font-semibold text-amber-400 hover:text-white bg-amber-950/60 hover:bg-amber-900 border border-amber-500/40 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <span>Open on {activeProblemDetail.platformName || 'Platform'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <p className="text-xs text-slate-400">{activeProblemDetail.category}</p>
                </div>

                {/* Problem Description */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Problem Description
                  </h4>
                  <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                    {activeProblemDetail.description}
                  </div>
                </div>

                {/* Examples */}
                {activeProblemDetail.examples && activeProblemDetail.examples.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Example Test Cases
                    </h4>
                    <div className="space-y-2">
                      {activeProblemDetail.examples.map((ex, i) => (
                        <div
                          key={i}
                          className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs font-mono space-y-1"
                        >
                          <div>
                            <span className="text-slate-400">Input:</span> {ex.input}
                          </div>
                          <div className="text-emerald-400">
                            <span className="text-slate-400">Output:</span> {ex.output}
                          </div>
                          {ex.explanation && (
                            <div className="text-slate-400 font-sans text-[11px] pt-1">
                              <span className="text-slate-300">Explanation:</span> {ex.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Constraints */}
                {activeProblemDetail.constraints && activeProblemDetail.constraints.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Constraints</span>
                    </h4>
                    <ul className="space-y-1 font-mono text-[11px]">
                      {activeProblemDetail.constraints.map((c, i) => (
                        <li key={i} className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-slate-300 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Hints */}
                {activeProblemDetail.hints && activeProblemDetail.hints.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Hints & Discussion
                    </h4>
                    <div className="space-y-1.5">
                      {activeProblemDetail.hints.map((hint, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-start gap-2"
                        >
                          <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{hint}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 text-slate-500 text-xs">
                Select a problem from the list or paste a new link above.
              </div>
            )}

            {/* Action Bar */}
            {activeProblemDetail && (
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4 shrink-0">
                <span className="text-xs text-slate-400 font-mono">
                  ID: {activeProblemDetail.id}
                </span>

                <button
                  onClick={() => {
                    onSelectProblem(activeProblemDetail);
                    onClose();
                  }}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Load into Active Coding Room</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
