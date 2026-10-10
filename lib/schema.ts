import {z} from 'zod';
export const Modes=['Quick Review','Deep Analysis','Reality Check','Boundary Planner','Credibility Insight'] as const;
const TextItem=z.union([z.string(),z.record(z.string(),z.unknown()).transform(v=>Object.entries(v).map(([k,x])=>`${k}: ${typeof x==='string'?x:JSON.stringify(x)}`).join(' — '))]);
export const PhysiologySchema=z.object({
  signalQuality:z.enum(['Low','Moderate','High']),
  arousalScore:z.number().min(0).max(100),
  anomalyConfidence:z.number().min(0).max(100),
  interpretation:z.string(),
  observedSignals:z.array(TextItem),
  alternativeExplanations:z.array(z.string()),
  limitation:z.string()
}).optional();
export const ResultSchema=z.object({
 summary:z.string(),facts:z.array(TextItem),assumptions:z.array(TextItem),perspectives:z.array(TextItem),evidence:z.array(TextItem),unknowns:z.array(TextItem),nextSteps:z.array(TextItem),calmMessage:z.string(),confidence:z.number().min(0).max(100),confidenceNote:z.string(),physiology:PhysiologySchema
});
export type Analysis=z.infer<typeof ResultSchema>;
