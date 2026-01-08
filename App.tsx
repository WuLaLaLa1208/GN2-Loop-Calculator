import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Gauge, 
  Settings2, 
  Cpu, 
  RefreshCw, 
  FileText, 
  GitFork, 
  Scale, 
  Zap, 
  ArrowRight 
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { InputGroup } from './components/InputGroup';
import { ResultCard } from './components/ResultCard';
import { SystemDiagram } from './components/SystemDiagram';
import { DropList } from './components/DropList';
import { calculateGN2System } from './utils/physics';
import { generateEngineeringReport } from './services/geminiService';
import { DEFAULT_PARAMS } from './constants';
import { SystemParams, SimulationResults } from './types';

const App: React.FC = () => {
  const [params, setParams] = useState<SystemParams>(DEFAULT_PARAMS);
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [report, setReport] = useState<string>('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);

  // Calculate physics whenever params change
  useEffect(() => {
    const res = calculateGN2System(params);
    setResults(res);

    // Generate Chart Data (Pressure Gradient along the pipe)
    const points = 10;
    const data = [];
    for (let i = 0; i <= points; i++) {
      const distance = (params.pipeLength / points) * i;
      const dropFraction = i / points;
      const currentPressure = params.inletPressure - (res.pressureDrop * dropFraction);
      data.push({
        distance: distance.toFixed(1),
        pressure: currentPressure.toFixed(3)
      });
    }
    setChartData(data);
  }, [params]);

  const handleParamChange = (key: keyof SystemParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
    setReport(''); 
  };

  const handleUpdateDropA = (index: number, value: number) => {
    const newDrops = [...params.dropsPipeA];
    newDrops[index] = value;
    setParams(prev => ({ ...prev, dropsPipeA: newDrops }));
    setReport('');
  };

  const handleUpdateDropB = (index: number, value: number) => {
    const newDrops = [...params.dropsPipeB];
    newDrops[index] = value;
    setParams(prev => ({ ...prev, dropsPipeB: newDrops }));
    setReport('');
  };

  const syncTotalFlow = () => {
    if (results) {
      handleParamChange('flowRate', results.totalConnectedLoad);
    }
  };

  const handleGenerateReport = async () => {
    if (!results) return;
    setIsGeneratingReport(true);
    const text = await generateEngineeringReport(params, results);
    setReport(text);
    setIsGeneratingReport(false);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans text-slate-900 bg-slate-50 selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-6 bg-white p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
              GN2 Loop Simulator
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-medium ml-1">
              E5F氮氣GN2環管系統計算
            </p>
          </div>
          <div className="mt-4 md:mt-0">
             <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
               Ver 2.3 Individual Loads
             </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Inputs (4 cols) */}
          <div className="lg:col-span-4 space-y-6 flex flex-col">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-slate-800 font-bold border-b border-slate-100 pb-4">
                <Settings2 className="w-5 h-5 text-blue-600" />
                系統參數設定 (Parameters)
              </div>
              
              <div className="space-y-5">
                <div>
                   <InputGroup 
                    label="模擬總流量 (Simulation Flow)" 
                    value={params.flowRate} 
                    unit="CMH" 
                    onChange={(v) => handleParamChange('flowRate', v)}
                  />
                  <div className="flex justify-end mt-1">
                     <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200" title="1 CMH ≈ 16.67 L/min">
                       ≈ {(params.flowRate * 1000 / 60).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} L/min
                     </span>
                  </div>
                  {results && Math.abs(results.totalConnectedLoad - params.flowRate) > 1 && (
                    <div className="mt-2 flex items-center justify-between bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                      <div className="text-xs text-amber-700">
                        <span className="font-bold">Total Load:</span> {results.totalConnectedLoad.toFixed(0)} CMH
                      </div>
                      <button 
                        onClick={syncTotalFlow}
                        className="text-[10px] bg-white border border-amber-200 hover:bg-amber-100 text-amber-700 px-2 py-1 rounded font-medium transition-colors"
                      >
                        Set as Flow
                      </button>
                    </div>
                  )}
                </div>

                <InputGroup 
                  label="入口壓力 (Inlet Pressure)" 
                  value={params.inletPressure} 
                  unit="kg/cm²G" 
                  step={0.1}
                  onChange={(v) => handleParamChange('inletPressure', v)}
                />
                
                <div className="grid grid-cols-2 gap-4">
                   <InputGroup 
                    label="單邊管長" 
                    value={params.pipeLength} 
                    unit="m" 
                    onChange={(v) => handleParamChange('pipeLength', v)}
                  />
                  <InputGroup 
                    label="氣體溫度" 
                    value={params.temperature} 
                    unit="°C" 
                    onChange={(v) => handleParamChange('temperature', v)}
                  />
                </div>
                
                <div className="pt-5 mt-2 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Main Pipe Spec</div>
                  <div className="grid grid-cols-2 gap-4">
                     <InputGroup 
                      label="外徑 (OD)" 
                      value={params.pipeOD} 
                      unit="mm" 
                      onChange={(v) => handleParamChange('pipeOD', v)}
                    />
                    <InputGroup 
                      label="壁厚 (Thk)" 
                      value={params.pipeThickness} 
                      unit="mm" 
                      onChange={(v) => handleParamChange('pipeThickness', v)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Drop Configuration (New Component) */}
            <DropList 
              dropsA={params.dropsPipeA}
              dropsB={params.dropsPipeB}
              onUpdateA={handleUpdateDropA}
              onUpdateB={handleUpdateDropB}
            />

          </div>

          {/* Right Column: Results (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            <SystemDiagram />

            {/* 1. Main Loop KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ResultCard 
                title="主管流速 (Main Loop)"
                value={results?.velocity.toFixed(2) || '-'}
                unit="m/s"
                isSafe={results?.isVelocitySafe}
                details="Target: < 15 m/s"
              />
              <ResultCard 
                title="總壓力降 (Pressure Drop)"
                value={results?.pressureDrop.toFixed(3) || '-'}
                unit="kg/cm²"
                isSafe={results?.isPressureSafe}
                details="Target: < 0.5 kg/cm²"
              />
               <ResultCard 
                title="末端壓力 (Terminal)"
                value={results?.terminalPressure.toFixed(2) || '-'}
                unit="kg/cm²G"
                details={`Inlet: ${params.inletPressure} kg`}
              />
            </div>

            {/* 2. Branch Capacity Analysis */}
            <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100">
               <div className="flex justify-between items-end mb-4">
                 <h3 className="text-blue-900 font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                   <Scale className="w-4 h-4" /> 3/4" 支管裕度分析 (Peak Drop Analysis)
                 </h3>
                 <div className="text-xs font-mono text-blue-600 bg-white px-2 py-1 rounded border border-blue-100">
                   Worst Case: {results?.maxSingleDropRate.toFixed(1)} CMH 
                   <span className="text-slate-400 mx-1">/</span>
                   {results ? (results.maxSingleDropRate * 1000 / 60).toFixed(0) : '-'} L/min
                 </div>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100/50">
                    <div className="text-xs text-slate-500 font-medium mb-1">最嚴苛單點流速</div>
                    <div className={`text-xl font-bold font-mono ${results && results.isBranchSafe ? 'text-slate-700' : 'text-red-600'}`}>
                      {results?.branchVelocity.toFixed(2)} <span className="text-xs text-slate-400">m/s</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Based on highest entered value</div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100/50">
                    <div className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-500" />
                      單點物理極限 (Max)
                    </div>
                    <div className="text-xl font-bold text-slate-900 font-mono">
                      {results?.maxSafeFlowPerBranch.toFixed(1)} <span className="text-xs text-slate-400">CMH</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Limited by 20m/s velocity</div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100/50">
                     <div className="text-xs text-slate-500 font-medium mb-1">流量裕度倍數 (Margin)</div>
                     <div className={`text-xl font-bold font-mono ${results && results.marginRatio > 1.5 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {results?.marginRatio.toFixed(1)}x
                     </div>
                     <div className="text-[10px] text-slate-400 mt-1">Capacity / Max Load</div>
                  </div>
               </div>
               <p className="text-xs text-blue-800/60 mt-4 leading-relaxed">
                 說明：此分析基於您在左側填寫的 40 個出口中的「最大值」。若 Margin > 1.0x，表示即使是需求最大的該機台，其 3/4" 支管也能安全供氣。
               </p>
            </div>

            {/* 3. Main Content Area: Chart & Report */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Chart Section */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm min-h-[350px] flex flex-col">
                <h3 className="text-slate-800 font-bold mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                  <Gauge className="w-5 h-5 text-blue-600" /> 主管壓力梯度 (Pressure)
                </h3>
                <div className="flex-1 w-full min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis 
                        dataKey="distance" 
                        stroke="#64748b"
                        tick={{fill: '#64748b', fontSize: 12}}
                        tickLine={{stroke: '#cbd5e1'}}
                        axisLine={{stroke: '#cbd5e1'}}
                        label={{ value: '距離 (m)', position: 'insideBottomRight', offset: -5, fill: '#94a3b8', fontSize: 12 }} 
                      />
                      <YAxis 
                        stroke="#64748b"
                        tick={{fill: '#64748b', fontSize: 12}}
                        tickLine={{stroke: '#cbd5e1'}}
                        axisLine={{stroke: '#cbd5e1'}}
                        domain={['auto', 'auto']}
                        label={{ value: '壓力 (kg/cm²G)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#0f172a' }}
                        itemStyle={{ color: '#2563eb', fontWeight: 600 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="pressure" 
                        stroke="#3b82f6" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: '#3b82f6', stroke: '#eff6ff', strokeWidth: 2 }} 
                        activeDot={{ r: 6, fill: '#2563eb' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI Report Section */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col min-h-[350px]">
                <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
                  <h3 className="text-slate-800 font-bold flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-purple-600" /> AI 資深工程師評估
                  </h3>
                  <button
                    onClick={handleGenerateReport}
                    disabled={isGeneratingReport}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold rounded-lg transition-all shadow-sm hover:shadow"
                  >
                    {isGeneratingReport ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                    {isGeneratingReport ? '分析中...' : '產生報告'}
                  </button>
                </div>
                
                <div className="flex-1 bg-slate-50/80 rounded-lg p-5 text-sm text-slate-700 leading-relaxed overflow-y-auto max-h-[300px] border border-slate-100 shadow-inner">
                  {report ? (
                    <div className="whitespace-pre-line prose prose-slate prose-sm max-w-none">
                      {report}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                      <div className="p-4 bg-white rounded-full shadow-sm">
                        <Scale className="w-8 h-8 opacity-40 text-slate-500" />
                      </div>
                      <p className="font-medium">分析「單點最大負載」</p>
                      <p className="text-xs text-slate-400 text-center max-w-[200px]">請更新左側各機台 CMH 用量，AI 將評估最嚴苛情況下的安全裕度。</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;