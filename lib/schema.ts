import {z} from 'zod';
export const Modes=['Quick Review','Deep Analysis','Reality Check','Boundary Planner','Credibility Insight','Relationship Coach','Repair Conversation','Decision Support'] as const;
const TextItem=z.union([z.string(),z.record(z.string(),z.unknown()).transform(v=>Object.entries(v).map(([k,x])=>`${k}: ${typeof x==='string'?x:JSON.stringify(x)}`).join(' — '))]);
export const PhysiologySchema=z.object({signalQuality:z.enum(['Low','Moderate','High']),arousalScore:z.number().min(0).max(100),anomalyConfidence:z.number().min(0).max(100),interpretation:z.string(),observedSignals:z.array(TextItem),alternativeExplanations:z.array(z.string()),limitation:z.string()}).optional();
export const RelationshipSchema=z.object({
 emotions:z.array(z.string()),needsAndValues:z.array(TextItem),interactionPattern:z.array(TextItem),repairOpportunities:z.array(z.string()),boundaries:z.array(z.string()),conversationPlan:z.array(z.string()),sharedGround:z.array(z.string()),decisionFactors:z.array(TextItem),
 healthSignals:z.object({communication:z.number().min(0).max(100),trust:z.number().min(0).max(100),respect:z.number().min(0).max(100),repair:z.number().min(0).max(100),mutuality:z.number().min(0).max(100),note:z.string()}).optional(),
 safetyNote:z.string().optional()
}).optional();
export const ResultSchema=z.object({
 summary:z.string(),facts:z.array(TextItem),assumptions:z.array(TextItem),perspectives:z.array(TextItem),evidence:z.array(TextItem),unknowns:z.array(TextItem),contradictions:z.array(TextItem).default([]),alternativeHypotheses:z.array(TextItem).default([]),followUpQuestions:z.array(z.string()).default([]),verificationPlan:z.array(z.string()).default([]),nextSteps:z.array(TextItem),calmMessage:z.string(),confidence:z.number().min(0).max(100),confidenceNote:z.string(),physiology:PhysiologySchema,relationship:RelationshipSchema
});
export type Analysis=z.infer<typeof ResultSchema>;
