export interface SystemParams {
  flowRate: number; // CMH (Simulation Flow)
  temperature: number; // Celsius
  inletPressure: number; // kg/cm2G
  pipeLength: number; // meters (per leg)
  pipeOD: number; // mm
  pipeThickness: number; // mm
  roughness: number; // mm
  
  // Specific Drop Configuration
  dropsPipeA: number[]; // Array of 20 flow rates (L/min)
  dropsPipeB: number[]; // Array of 20 flow rates (L/min)
}

export interface SimulationResults {
  velocity: number; // m/s (Main Loop)
  reynoldsNumber: number;
  pressureDrop: number; // kg/cm2
  terminalPressure: number; // kg/cm2G
  density: number; // kg/m3
  viscosity: number; // Pa.s
  isVelocitySafe: boolean;
  isPressureSafe: boolean;
  flowPerLeg: number; // CMH
  
  // New Branch Results
  branchVelocity: number; // m/s (Based on Max Drop)
  isBranchSafe: boolean;
  
  // Capacity & Margin Analysis
  totalConnectedLoad: number; // Sum of all 40 drops (Converted to CMH)
  maxSingleDropRate: number; // The highest flow value (Converted to CMH)
  maxSafeFlowPerBranch: number; // CMH (Physical limit at max velocity)
  marginRatio: number; // Factor (Max Capacity / Max Used)
}

export enum CalculationStatus {
  IDLE = 'IDLE',
  CALCULATING = 'CALCULATING',
  COMPLETE = 'COMPLETE',
}