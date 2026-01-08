import React from 'react';
import { Settings2 } from 'lucide-react';

interface DropListProps {
  dropsA: number[];
  dropsB: number[];
  onUpdateA: (index: number, value: number) => void;
  onUpdateB: (index: number, value: number) => void;
}

export const DropList: React.FC<DropListProps> = ({ dropsA, dropsB, onUpdateA, onUpdateB }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase tracking-wide">
          <Settings2 className="w-4 h-4" />
          各點用量設定 (Drop Config)
        </h3>
        <span className="text-xs text-slate-400 font-mono">Unit: L/MIN</span>
      </div>
      
      <div className="flex-1 overflow-y-auto max-h-[400px] p-2">
        <div className="flex gap-2">
          {/* Column A */}
          <div className="flex-1 space-y-2">
            <div className="text-center text-xs font-bold text-blue-600 uppercase py-1 sticky top-0 bg-white/95 backdrop-blur z-10 border-b border-blue-100">
              Pipe A (20)
            </div>
            {dropsA.map((val, idx) => (
              <div key={`a-${idx}`} className="flex items-center gap-2 group">
                <span className="text-[10px] text-slate-400 w-4 text-right font-mono">{idx + 1}</span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={val}
                  onChange={(e) => onUpdateA(idx, parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono text-center group-hover:bg-white group-hover:border-blue-200 transition-colors"
                />
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px bg-slate-100 my-2"></div>

          {/* Column B */}
          <div className="flex-1 space-y-2">
            <div className="text-center text-xs font-bold text-blue-600 uppercase py-1 sticky top-0 bg-white/95 backdrop-blur z-10 border-b border-blue-100">
              Pipe B (20)
            </div>
            {dropsB.map((val, idx) => (
              <div key={`b-${idx}`} className="flex items-center gap-2 group">
                <span className="text-[10px] text-slate-400 w-4 text-right font-mono">{idx + 1}</span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={val}
                  onChange={(e) => onUpdateB(idx, parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono text-center group-hover:bg-white group-hover:border-blue-200 transition-colors"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};