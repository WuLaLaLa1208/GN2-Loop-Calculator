// Helper to create initial drops (e.g., 400 L/min each = 24 CMH)
const INITIAL_DROPS = Array(20).fill(400);

export const DEFAULT_PARAMS = {
  flowRate: 960, // CMH
  temperature: 25, // C
  inletPressure: 8.3, // kg/cm2G
  pipeLength: 40, // meters
  pipeOD: 60.3, // mm (2" Sch5s)
  pipeThickness: 1.65, // mm (Sch5s)
  roughness: 0.015, // mm (Stainless Steel)
  dropsPipeA: [...INITIAL_DROPS],
  dropsPipeB: [...INITIAL_DROPS],
};

export const CONSTANTS = {
  R_GAS_N2: 296.8, // J/(kg·K)
  STD_TEMP: 273.15, // K (0°C)
  STD_PRES: 101325, // Pa (1 atm)
  ATM_TO_PA: 101325,
  KG_CM2_TO_PA: 98066.5,
  PA_TO_KG_CM2: 1 / 98066.5,
  VISCOSITY_N2_25C: 1.78e-5, // Pa·s
  
  // Branch configuration
  BRANCH_COUNT_PER_LEG: 20,
  BRANCH_ID_MM: 21.0, // Approx ID for 3/4" Pipe
  MAX_SAFE_BRANCH_VELOCITY: 20.0, // m/s (Engineering standard for flexible drops/tool hookups)
};