import React, { useState } from 'react';
import { Room, User } from '../types';
import { googleSheetsService, CodingLogEntry } from '../services/googleSheetsService';
import { INITIAL_PROBLEMS } from '../data/problemLibrary';
import {
  X,
  Sheet,
  Download,
  ExternalLink,
  CheckCircle2,
  Table,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  activeRoom?: Room;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  activeRoom,
}) => {
  const [sheetTitle, setSheetTitle] = useState(
    `CodeTogether Practice Log - ${currentUser.name}`
  );
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  // Build sample entries to export based on current user's history and active room
  const entries: CodingLogEntry[] = [
    {
      timestamp: new Date().toISOString(),
      roomCode: activeRoom ? activeRoom.code : 'ALGO99',
      roomName: activeRoom ? activeRoom.name : 'Interview Practice Session',
      problemTitle: activeRoom
        ? INITIAL_PROBLEMS.find((p) => p.id === activeRoom.currentProblemId)?.title || 'Pair With Target Sum'
        : 'Pair With Target Sum',
      difficulty: 'Easy',
      category: 'Arrays & Hashing',
      language: activeRoom ? activeRoom.language : 'javascript',
      testCasesPassed: '5/5 Passed (100%)',
      participants: activeRoom ? activeRoom.activeMembers.map((m) => m.name).join(', ') : currentUser.name,
      solutionNotes: 'Solved with single-pass hash map in O(n) time and O(n) space.',
    },
    {
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      roomCode: 'DPFOCU',
      roomName: 'Dynamic Programming Workshop',
      problemTitle: 'Maximum Subarray Sum',
      difficulty: 'Medium',
      category: 'Dynamic Programming',
      language: 'javascript',
      testCasesPassed: '5/5 Passed (100%)',
      participants: `${currentUser.name}, Priya Sharma`,
      solutionNotes: "Kadane's algorithm computing maximum contiguous subarray sum in O(n).",
    },
    {
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      roomCode: 'BATTLE01',
      roomName: '1v1 Coding Battle Showdown',
      problemTitle: 'Balanced Bracket Sequence',
      difficulty: 'Easy',
      category: 'Stack',
      language: 'javascript',
      testCasesPassed: '5/5 Passed (100%)',
      participants: `${currentUser.name} vs Alex Chen`,
      solutionNotes: 'Battle Victory in 02:45. Validated bracket matching using LIFO stack.',
    },
  ];

  const handleDownloadCsv = () => {
    googleSheetsService.downloadCsv(entries, `${sheetTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}.csv`);
    setExportStatus('CSV file successfully generated! Open sheets.new and import file.');
  };

  const handleOpenGoogleSheetsDirect = () => {
    // Generate CSV and open Google Sheets creation page
    handleDownloadCsv();
    window.open('https://sheets.new', '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0e1626] border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#131d31]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Sheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Google Sheets Practice Exporter</h2>
              <p className="text-xs text-slate-400">
                Log algorithmic solutions, battle scores, and room sessions into Google Sheets
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

        <div className="p-6 space-y-5">
          {exportStatus && (
            <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-3 flex items-center gap-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{exportStatus}</span>
            </div>
          )}

          {/* Sheet Title Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Spreadsheet Title</label>
            <input
              type="text"
              value={sheetTitle}
              onChange={(e) => setSheetTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Preview of Columns & Data Rows */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5 text-emerald-400" /> Export Data Preview ({entries.length} Rows)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">10 Columns</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto max-h-48 text-xs font-mono">
              <table className="w-full text-left">
                <thead className="bg-[#111827] text-slate-400 border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="p-2.5">Problem Title</th>
                    <th className="p-2.5">Room</th>
                    <th className="p-2.5">Difficulty</th>
                    <th className="p-2.5">Tests</th>
                    <th className="p-2.5">Collaborators</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300 text-[11px]">
                  {entries.map((e, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/50">
                      <td className="p-2.5 font-bold text-white whitespace-nowrap">{e.problemTitle}</td>
                      <td className="p-2.5 text-indigo-400">{e.roomCode}</td>
                      <td className="p-2.5">{e.difficulty}</td>
                      <td className="p-2.5 text-emerald-400">{e.testCasesPassed}</td>
                      <td className="p-2.5 truncate max-w-[140px]">{e.participants}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Export Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={handleOpenGoogleSheetsDirect}
              className="w-full sm:flex-1 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-lg shadow-emerald-600/20 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export & Open in Google Sheets</span>
            </button>

            <button
              onClick={handleDownloadCsv}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
