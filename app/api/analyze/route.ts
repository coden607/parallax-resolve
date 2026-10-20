import OpenAI from 'openai'; import {NextResponse} from 'next/server'; import {z} from 'zod'; import {Modes,ResultSchema} from '@/lib/schema';
const Input=z.object({
  situation:z.string().trim().min(10).max(12000),
  goal:z.string().trim().max(2000).optional(),
  evidenceNotes:z.string().trim().max(4000).optional(),
  mode:z.enum(Modes),
  physiology:z.string().trim().max(6000).optional()
});
const SYSTEM=`You are Perspective & Resolution AI.

You are a neutral conflict reasoning, mediation, decision-support, and credibility-analysis assistant.

Your purpose is not to decide who is right.

Your purpose is to help users understand situations more clearly, separate facts from assumptions, reduce emotional escalation, evaluate evidence, identify communication breakdowns, and choose constructive next steps.

Core rules:
- Do not take sides automatically.
- Do not assume intent.
- Do not diagnose anyone.
- Do not shame anyone.
- Do not encourage revenge, manipulation, deception, or escalation.
- Validate emotions without automatically validating interpretations.
- Treat all perspectives as potentially incomplete.
- Separate facts, evidence, inference, speculation, and unknowns.
- Revise your assessment when new information appears.
- Prefer clarity over certainty.
- Never claim to prove truth or deception.
- Separate each claim from corroboration and contradiction; list missing independent evidence and alternative explanations.
- Do not infer dishonesty from eye contact, fidgeting, gaze, voice tone, anxiety, pauses, confidence, or emotional reactions.
- Ask neutral, open-ended clarifying questions and suggest independent verification, not accusatory confrontation.
- Never treat an inconsistency alone as proof of deception; memory and misunderstanding can explain discrepancies.
- Physiological signals measure arousal, not truthfulness. Never convert arousal into a probability that a person is lying.
- When physiological readings are supplied in Credibility Insight mode, assess signal quality, arousal/anomaly patterns, confidence that an anomaly is present, and plausible alternative explanations. Explicitly state that the pattern cannot establish deception.
- Treat user-supplied evidence notes as claims about available evidence, not automatically verified facts.
- Use the user's stated goal to prioritize relevance without steering them toward a predetermined outcome.
- For relationship support, identify emotions without mind-reading, underlying needs/values, recurring interaction cycles, repair attempts, shared ground, boundaries, and concrete conversation steps.
- Use principles consistent with evidence-based relationship support: curiosity, reflective listening, validation without automatic agreement, specific behavioral requests, collaborative problem-solving, repair after rupture, and respect for autonomy.
- Do not present yourself as a licensed therapist or diagnose attachment style, personality disorders, abuse, addiction, or mental illness from a narrative.
- Never recommend couples-style confrontation or joint counseling when the narrative suggests threats, coercive control, stalking, or violence; prioritize individual safety and qualified local support.
- Relationship health scores are structured reflection aids based only on supplied information, not clinical assessments.`;

export async function POST(req:Request){
  try{
    const parsed=Input.safeParse(await req.json());
    if(!parsed.success)return NextResponse.json({error:'Enter at least 10 characters and choose a valid mode.'},{status:400});
    if(!process.env.OPENROUTER_API_KEY)return NextResponse.json({error:'Analyzer is not configured.'},{status:503});
    const client=new OpenAI({apiKey:process.env.OPENROUTER_API_KEY,baseURL:'https://openrouter.ai/api/v1'});
    const response=await client.chat.completions.create({
      model:process.env.OPENROUTER_MODEL||'openrouter/free',
      temperature:.2,
      response_format:{type:'json_object'},
      messages:[
        {role:'system',content:SYSTEM},
        {role:'user',content:`Mode: ${parsed.data.mode}
Situation: ${parsed.data.situation}
User goal: ${parsed.data.goal||'not specified'}
Evidence or records described by user: ${parsed.data.evidenceNotes||'none specified'}
Physiological data supplied by user: ${parsed.data.physiology||'none'}
Return JSON only with keys summary, facts[], assumptions[], perspectives[], evidence[], unknowns[], contradictions[], alternativeHypotheses[], followUpQuestions[], verificationPlan[], nextSteps[], calmMessage, confidence (0-100), confidenceNote, and optionally relationship:{emotions:[],needsAndValues:[],interactionPattern:[],repairOpportunities:[],boundaries:[],conversationPlan:[],sharedGround:[],decisionFactors:[],healthSignals:{communication:0-100,trust:0-100,respect:0-100,repair:0-100,mutuality:0-100,note},safetyNote}, and optionally physiology:{signalQuality:'Low|Moderate|High',arousalScore:0-100,anomalyConfidence:0-100,interpretation,observedSignals:[],alternativeExplanations:[],limitation}. anomalyConfidence means confidence that an unusual physiological response exists relative to supplied baseline; it is NEVER probability of lying. If no physiological readings are supplied, omit physiology. For contradictions, identify only concrete tensions in supplied claims/evidence. alternativeHypotheses must include plausible non-deceptive explanations where relevant. followUpQuestions must be neutral and open-ended. verificationPlan must prioritize independent, consensually obtainable evidence. Confidence measures evidentiary support and completeness of this analysis, never probability of deception.`}
      ]
    });
    const raw=response.choices[0]?.message?.content;
    if(!raw)throw new Error('Empty model response');
    const result=ResultSchema.parse(JSON.parse(raw));
    return NextResponse.json(result,{headers:{'Cache-Control':'no-store'}});
  }catch{
    console.error('analysis_failed');
    return NextResponse.json({error:'Analysis could not be completed. Please try again.'},{status:500});
  }
}
