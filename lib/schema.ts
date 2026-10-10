import {z} from 'zod';
export const Modes=['Quick Review','Deep Analysis','Reality Check','Boundary Planner','Credibility Insight'] as const;

const TextItem=z.union([
  z.string(),
  z.record(z.string(),z.unknown()).transform((value)=>Object.entries(value).map(([key,val])=>`${key}: ${typeof val==='string'?val:JSON.stringify(val)}`).join(' — '))
]);

export const ResultSchema=z.object({
  summary:z.string(),
  facts:z.array(TextItem),
  assumptions:z.array(TextItem),
  perspectives:z.array(TextItem),
  evidence:z.array(TextItem),
  unknowns:z.array(TextItem),
  nextSteps:z.array(TextItem),
  calmMessage:z.string(),
  confidence:z.number().min(0).max(100),
  confidenceNote:z.string()
});
export type Analysis=z.infer<typeof ResultSchema>;
