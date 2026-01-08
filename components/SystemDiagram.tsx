import React from 'react';

export const SystemDiagram: React.FC = () => {
  // Helper to generate small drop lines
  const renderDrops = (yPos: number, count: number, startX: number, endX: number) => {
    const lines = [];
    const width = endX - startX;
    const step = width / (count + 1);
    
    for (let i = 1; i <= count; i++) {
      const x = startX + i * step;
      // Draw a small vertical line downwards from the pipe
      lines.push(
        <g key={i}>
          <line x1={x} y1={yPos} x2={x} y2={yPos + 8} stroke="#94a3b8" strokeWidth="1" />
          <circle cx={x} cy={yPos + 8} r="1" fill="#64748b" />
        </g>
      );
    }
    return lines;
  };

  // We visualize a subset of the 20 drops to keep it clean, or draw a pattern
  // Let's draw about 10 lines to represent the "Many drops" concept
  const visualDropsCount = 10;

  return (
    <div className="w-full h-48 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-3 left-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">System Schematic (Loop + Drops)</div>
      
      <svg viewBox="0 0 400 150" className="w-full h-full">
        {/* Defs for markers */}
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#2563eb" />
          </marker>
        </defs>

        {/* Top Supply Source (GN2 NO1) */}
        <path d="M20,35 L60,35" stroke="#64748b" strokeWidth="4" />
        <text x="20" y="25" fill="#475569" fontSize="10" fontWeight="bold">GN2 NO1</text>
        <circle cx="20" cy="35" r="3" fill="#64748b" />

        {/* Top Leg (Pipe A) */}
        <path d="M60,35 L320,35 L340,75" stroke="#3b82f6" strokeWidth="2" fill="none" />
        <text x="190" y="25" fill="#2563eb" fontSize="10" textAnchor="middle" fontWeight="500">Pipe A (40m)</text>
        <path d="M180,35 L200,35" stroke="transparent" markerEnd="url(#arrow)" />

        {/* Drops for Pipe A */}
        {renderDrops(35, visualDropsCount, 60, 320)}
        <text x="250" y="52" fill="#64748b" fontSize="8" fontStyle="italic">20x 3/4" Outlets</text>


        {/* Bottom Supply Source (GN2 NO2) */}
        <path d="M20,115 L60,115" stroke="#64748b" strokeWidth="4" />
        <text x="20" y="135" fill="#475569" fontSize="10" fontWeight="bold">GN2 NO2</text>
        <circle cx="20" cy="115" r="3" fill="#64748b" />

        {/* Bottom Leg (Pipe B) */}
        <path d="M60,115 L320,115 L340,75" stroke="#3b82f6" strokeWidth="2" fill="none" />
        <text x="190" y="135" fill="#2563eb" fontSize="10" textAnchor="middle" fontWeight="500">Pipe B (40m)</text>
        <path d="M180,115 L200,115" stroke="transparent" markerEnd="url(#arrow)" />

        {/* Drops for Pipe B */}
        {renderDrops(115, visualDropsCount, 60, 320)}
        <text x="250" y="132" fill="#64748b" fontSize="8" fontStyle="italic">20x 3/4" Outlets</text>

        {/* Merge Point / Load */}
        <circle cx="340" cy="75" r="6" fill="#ef4444" />
        <text x="350" y="78" fill="#ef4444" fontSize="12" fontWeight="bold">Load</text>
        
        {/* Flow indicators */}
        <text x="70" y="50" fill="#94a3b8" fontSize="9" fontWeight="500">Q/2</text>
        <text x="70" y="105" fill="#94a3b8" fontSize="9" fontWeight="500">Q/2</text>

      </svg>
    </div>
  );
};