import React, { useState } from 'react';
import { Judge0Config } from '../types';
import { X, SlidersHorizontal, CheckCircle2, Server, HelpCircle, ShieldAlert } from 'lucide-react';

interface Judge0ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Judge0ConfigModal: React.FC<Judge0ConfigModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<Judge0Config>(() => {
    const saved = localStorage.getItem('codetogether_judge0');
    return saved
      ? JSON.parse(saved)
      : {
          endpoint: 'https://judge0-ce.p.rapidapi.com',
          apiKey: '',
          useRapidApi: true,
          enabled: false,
        };
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('codetogether_judge0', JSON.stringify(config));
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0e1626] border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Execution Engine Configuration</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-indigo-950/40 border border-indigo-800/40 rounded-xl p-3 text-xs text-indigo-300 space-y-1">
          <span className="font-bold block">Zero-Config Browser Sandbox Active</span>
          <p className="text-slate-400 leading-relaxed">
            By default, CodeTogether runs your JavaScript & TypeScript solutions in a secure isolated Web Worker sandbox with 3000ms timeout protection.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
            <div>
              <span className="font-bold text-white block">Enable External Judge0 Compiler</span>
              <span className="text-[11px] text-slate-400">
                Execute C++, Java, and Python via remote sandboxed Judge0 runner
              </span>
            </div>
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-slate-700 cursor-pointer"
            />
          </div>

          {config.enabled && (
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Judge0 API Endpoint</label>
                <input
                  type="text"
                  value={config.endpoint}
                  onChange={(e) => setConfig({ ...config, endpoint: e.target.value })}
                  placeholder="https://judge0-ce.p.rapidapi.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">API Key (Optional / RapidAPI)</label>
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="Enter RapidAPI Key or X-Auth-Token"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>
            </div>
          )}

          {savedSuccess && (
            <p className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Compiler configuration saved!
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
