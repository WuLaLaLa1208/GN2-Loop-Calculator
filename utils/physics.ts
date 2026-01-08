import { SystemParams, SimulationResults } from '../types';
import { CONSTANTS } from '../constants';

export const calculateGN2System = (params: SystemParams): SimulationResults => {
  const {
    flowRate,
    temperature,
    inletPressure,
    pipeLength,
    pipeOD,
    pipeThickness,
    roughness,
    dropsPipeA,
    dropsPipeB
  } = params;

  // --- 0. Load Analysis ---
  // Inputs are in L/min. Need to convert to CMH for system calculation.
  // 1 L/min = 60 L/hr = 0.06 m3/hr
  const LMIN_TO_CMH = 0.06;

  // Sum up all connected loads (L/min -> CMH)
  const sumA_Lmin = dropsPipeA.reduce((a, b) => a + b, 0);
  const sumB_Lmin = dropsPipeB.reduce((a, b) => a + b, 0);
  const totalConnectedLoad = (sumA_Lmin + sumB_Lmin) * LMIN_TO_CMH;

  // Find the WORST CASE single drop (Highest Flow)
  const maxSingleDropRateLmin = Math.max(...dropsPipeA, ...dropsPipeB, 1); // Avoid 0 div
  const maxSingleDropRate = maxSingleDropRateLmin * LMIN_TO_CMH; // Convert to CMH for velocity calc

  // --- Main Loop Calculation ---

  // 1. Geometry & Loop Logic
  const flowPerLegCMH = flowRate / 2; // Simulation Flow is used here, not connected load
  const innerDiameterMm = pipeOD - 2 * pipeThickness;
  const innerDiameterM = innerDiameterMm / 1000;
  const area = Math.PI * Math.pow(innerDiameterM / 2, 2);

  // 2. State Conversion
  const tempK = temperature + 273.15;
  const inletPressureAbsKg = inletPressure + 1.03323; 
  const inletPressurePa = inletPressureAbsKg * CONSTANTS.KG_CM2_TO_PA;

  // 3. Density
  const density = inletPressurePa / (CONSTANTS.R_GAS_N2 * tempK);

  // 4. Actual Flow Rate Conversion (Main Pipe)
  // Assuming Input CMH is Normal Flow
  const flowPerLegM3s_Normal = flowPerLegCMH / 3600;
  
  const flowPerLegM3s_Actual =
    flowPerLegM3s_Normal *
    (CONSTANTS.STD_PRES / inletPressurePa) *
    (tempK / CONSTANTS.STD_TEMP);

  // 5. Velocity (Main Pipe)
  const velocity = flowPerLegM3s_Actual / area;

  // 6. Reynolds Number
  const reynoldsNumber =
    (density * velocity * innerDiameterM) / CONSTANTS.VISCOSITY_N2_25C;

  // 7. Friction Factor (Swamee-Jain)
  let f = 0.02; 
  if (reynoldsNumber < 2000) {
    f = 64 / reynoldsNumber; 
  } else {
    const epsilon = roughness / 1000; 
    const relativeRoughness = epsilon / innerDiameterM;
    const term1 = relativeRoughness / 3.7;
    const term2 = 5.74 / Math.pow(reynoldsNumber, 0.9);
    f = 0.25 / Math.pow(Math.log10(term1 + term2), 2);
  }

  // 8. Pressure Drop
  const pressureDropPa =
    f * (pipeLength / innerDiameterM) * ((density * Math.pow(velocity, 2)) / 2);

  const pressureDropKg = pressureDropPa * CONSTANTS.PA_TO_KG_CM2;
  const terminalPressure = inletPressure - pressureDropKg;


  // --- Branch (Drop) Calculation ---
  // We use the MAX SINGLE DROP RATE to determine if the branch pipe size is adequate.
  
  const branchID_M = CONSTANTS.BRANCH_ID_MM / 1000;
  const branchArea = Math.PI * Math.pow(branchID_M / 2, 2);

  // A. Max Peak Velocity Calculation
  const maxDropFlowM3s_Normal = maxSingleDropRate / 3600;
  
  // Use average pressure of main loop for approximation
  const avgLoopPressurePa = inletPressurePa - (pressureDropPa / 2);
  
  const maxDropFlowM3s_Actual = 
    maxDropFlowM3s_Normal * 
    (CONSTANTS.STD_PRES / avgLoopPressurePa) * 
    (tempK / CONSTANTS.STD_TEMP);

  const branchVelocity = maxDropFlowM3s_Actual / branchArea;

  // B. Max Capacity Calculation (Margin)
  // How much Normal Flow (CMH) results in MAX_SAFE_BRANCH_VELOCITY (20 m/s)?
  // v = Q_act / A  => Q_act_max = v_max * A
  const maxSafeActualFlowM3s = CONSTANTS.MAX_SAFE_BRANCH_VELOCITY * branchArea;
  
  // Convert Q_act_max back to Q_std (CMH)
  const maxSafeNormalFlowM3s = maxSafeActualFlowM3s * (avgLoopPressurePa / CONSTANTS.STD_PRES) * (CONSTANTS.STD_TEMP / tempK);
  const maxSafeFlowPerBranchCMH = maxSafeNormalFlowM3s * 3600;

  // Margin is Ratio of Capacity / Max Used
  const marginRatio = maxSafeFlowPerBranchCMH / maxSingleDropRate;

  return {
    velocity,
    reynoldsNumber,
    pressureDrop: pressureDropKg,
    terminalPressure,
    density,
    viscosity: CONSTANTS.VISCOSITY_N2_25C,
    isVelocitySafe: velocity < 15,
    isPressureSafe: pressureDropKg < 0.5,
    flowPerLeg: flowPerLegCMH,
    branchVelocity, // This is now the Peak Velocity of the busiest drop
    isBranchSafe: branchVelocity < CONSTANTS.MAX_SAFE_BRANCH_VELOCITY,
    totalConnectedLoad,
    maxSingleDropRate,
    maxSafeFlowPerBranch: maxSafeFlowPerBranchCMH,
    marginRatio
  };
};