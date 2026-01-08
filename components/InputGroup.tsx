import React from 'react';

interface InputGroupProps {
  label: string;
  value: number;
  unit: string;
  onChange: (val: number) => void;
  step?: number;
  min?: number;
}

export const InputGroup: React.FC<InputGroupProps> = ({
  label,
  value,
  unit,
  onChange,
  step = 1,
  min = 0,
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative group">
        <input
          type="number"
          value={value}
          step={step}
          min={min}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono transition-all shadow-sm group-hover:border-slate-300"
        />
        <span className="absolute right-3 top-2.5 text-slate-400 text-sm font-medium select-none pointer-events-none">
          {unit}
        </span>
      </div>
    </div>
  );
};