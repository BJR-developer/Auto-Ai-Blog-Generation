import React, { useEffect, useState } from 'react';
import { Loader2, Play, Pause, Zap, Clock, Terminal } from 'lucide-react';
import { GeneratorState } from '../types';

interface AutoPilotStatusProps {
  state: GeneratorState;
  onToggle: () => void;
  onForceRun: () => void;
}

const AutoPilotStatus: React.FC<AutoPilotStatusProps> = ({ state, onToggle, onForceRun }) => {
  const [countdown, setCountdown] = useState<number>(0);

  useEffect(() => {
    if (!state.isActive || !state.nextRunTime) {
      setCountdown(0);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((state.nextRunTime! - Date.now()) / 1000));
      setCountdown(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isActive, state.nextRunTime]);

  const progress = state.intervalSeconds > 0 
    ? Math.min(100, ((state.intervalSeconds - countdown) / state.intervalSeconds) * 100) 
    : 0;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Logs Window (Only visible when active or generating) */}
      {(state.isActive || state.isGenerating) && (
        <div className="w-80 bg-gray-900 text-green-400 p-4 rounded-lg shadow-2xl font-mono text-xs border border-gray-700 opacity-90 mb-2 transition-all duration-300">
          <div className="flex items-center gap-2 mb-2 text-gray-400 border-b border-gray-800 pb-2">
            <Terminal size={12} />
            <span>SYSTEM LOGS</span>
          </div>
          <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
            {state.logs.slice(-5).map((log, i) => (
              <div key={i} className="truncate">
                <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString()}]</span>
                {log}
              </div>
            ))}
            {state.isGenerating && (
              <div className="flex items-center gap-2 animate-pulse text-yellow-400">
                <Loader2 size={10} className="animate-spin" />
                Processing...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Control Pill */}
      <div className="flex items-center bg-white border border-gray-200 shadow-xl rounded-full p-1.5 pr-6 gap-3 transition-all hover:shadow-2xl">
        <button
          onClick={onToggle}
          className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
            state.isActive ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {state.isActive ? (
            <>
               <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                 <circle
                   cx="24"
                   cy="24"
                   r="22"
                   fill="none"
                   stroke="currentColor"
                   strokeWidth="3"
                   strokeDasharray="138" // 2 * pi * 22
                   strokeDashoffset={138 - (138 * progress) / 100}
                   className="opacity-50 transition-all duration-1000 ease-linear"
                 />
               </svg>
              <Pause size={20} fill="currentColor" />
            </>
          ) : (
            <Play size={20} fill="currentColor" className="ml-1" />
          )}
        </button>

        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {state.isActive ? 'Auto-Pilot Active' : 'Auto-Pilot Paused'}
          </span>
          <div className="flex items-center gap-2 h-5">
            {state.isGenerating ? (
              <span className="text-sm font-medium text-indigo-600 animate-pulse">Generating Content...</span>
            ) : state.isActive ? (
               <span className="text-sm font-medium text-gray-900 flex items-center gap-1">
                 Next post in {countdown}s
               </span>
            ) : (
              <span className="text-sm text-gray-400">Waiting for command</span>
            )}
          </div>
        </div>

        {!state.isActive && (
          <button
            onClick={onForceRun}
            disabled={state.isGenerating}
            className="ml-2 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-md hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Zap size={14} />
            Generate Now
          </button>
        )}
      </div>
    </div>
  );
};

export default AutoPilotStatus;
