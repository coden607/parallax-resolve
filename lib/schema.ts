import {z} from 'zod';
export const Modes=['Quick Review','Deep Analysis','Reality Check','Boundary Planner','Credibility Insight'] as const;
export const ResultSchema=z.object({summary:z.string(),facts:z.array(z.string()),assumptions:z.array(z.string()),perspectives:z.array(z.string()),evidence:z.array(z.string()),unknowns:z.array(z.string()),nextSteps:z.array(z.string()),calmMessage:z.string(),confidence:z.number().min(0).max(100),confidenceNote:z.string()});
export type Analysis=z.infer<typeof ResultSchema>;
