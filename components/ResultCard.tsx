import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface ResultCardProps {
  title: string;
  value: string;
  unit: string;
  isSafe?: boolean; // undefined if not a safety metric
  details?: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  title,
  value,
  unit,
  isSafe,
  details,
}) => {
  let valueColor = "text-slate-900";
  let borderColor = "border-slate-200";
  let bgColor = "bg-white";
  let icon = null;
  
  if (isSafe === true) {
    valueColor = "text-emerald-600";
    borderColor = "border-emerald-100";
    bgColor = "bg-emerald-50/30";
    icon = <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
  } else if (isSafe === false) {
    valueColor = "text-red-600";
    borderColor = "border-red-100";
    bgColor = "bg-red-50/30";
    icon = <AlertTriangle className="w-5 h-5 text-red-500" />;
  }

  return (
    <div className={`${bgColor} rounded-xl p-5 border ${borderColor} shadow-sm flex flex-col justify-between h-full transition-shadow hover:shadow-md`}>
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wide">{title}</h3>
          {icon}
        </div>
        <div className={`text-3xl font-bold font-mono tracking-tight ${valueColor}`}>
          {value} <span className="text-sm text-slate-400 font-medium ml-0.5">{unit}</span>
        </div>
      </div>
      {details && (
        <div className="mt-3 pt-3 border-t border-slate-100">
           <p className="text-xs text-slate-500 font-medium">{details}</p>
        </div>
      )}
    </div>
  );
};