import { GoogleGenAI } from "@google/genai";
import { SimulationResults, SystemParams } from "../types";

const GEMINI_API_KEY = process.env.API_KEY || '';

export const generateEngineeringReport = async (
  params: SystemParams,
  results: SimulationResults
): Promise<string> => {
  if (!GEMINI_API_KEY) {
    return "錯誤：找不到 API Key。請確保環境變數已設定。";
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  
  const prompt = `
    你現在是一位資深的半導體廠務氣體工程師。
    請根據以下的 GN2 環管系統模擬數據，用繁體中文撰寫一份簡短專業的工程評估報告。
    
    使用者已經詳細列出了 40 個 3/4" 出口的個別機台需求流量 (Connected Load)。
    
    系統參數:
    - 主管路: 2" Sch5s SUS316 Loop
    - 模擬總流量: ${params.flowRate} CMH (這是環管目前的供給設定)
    - 總連接負載 (Sum of all tools): ${results.totalConnectedLoad.toFixed(1)} CMH
    
    最嚴苛條件 (Worst Case Drop):
    - 40 個出口中，單點需求最大為: ${results.maxSingleDropRate.toFixed(1)} CMH
    - 該點流速: ${results.branchVelocity.toFixed(2)} m/s (Target < 20 m/s)
    - 該點物理極限容量: ${results.maxSafeFlowPerBranch.toFixed(1)} CMH
    - 裕度 (Capacity / Max Load): ${results.marginRatio.toFixed(1)}x
    
    主管結果:
    - 總壓降: ${results.pressureDrop.toFixed(3)} kg/cm²
    - 主管流速: ${results.velocity.toFixed(2)} m/s

    請在報告中包含：
    1. 結果摘要：比較「模擬供給流量」與「總連接負載」，評估目前設定是否能滿足所有機台同時全開 (100% Loading)。
    2. 支管適用性：針對那個「需求最大」的機台，評估 3/4" 配管是否足夠？裕度是否安全？
    3. Feasibility 結論。
    4. 建議：如果 Margin 小於 1.5 倍，是否有擴管建議？或是 Diversity Factor 的考量。
    
    語氣請保持專業、權威但易懂。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "無法產生報告。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "產生報告時發生錯誤，請稍後再試。";
  }
};