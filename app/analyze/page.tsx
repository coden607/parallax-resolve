'use client';
import {useEffect,useMemo,useState} from 'react';
import {Modes,type Analysis} from '@/lib/schema';

type Saved={id:string;at:string;mode:string;situation:string;goal?:string;evidenceNotes?:string;tags?:string[];favorite?:boolean;result:Analysis};
const modeHelp:Record<(typeof Modes)[number],string>={
  'Quick Review':'Fast separation of facts, assumptions, unknowns, and next steps.',
  'Deep Analysis':'More exhaustive perspectives, contradictions, hypotheses, and verification steps.',
  'Reality Check':'Stress-test interpretations against the available evidence and plausible alternatives.',
  'Boundary Planner':'Turn concerns into specific, enforceable boundaries and behavioral requests.',
  'Credibility Insight':'Evaluate consistency, corroboration, contradictions, and optional physiological arousal data without claiming lie detection.',
  'Relationship Coach':'Focus on needs, interaction cycles, shared ground, repair, and constructive communication.',
  'Repair Conversation':'Build a calm, concrete plan for repairing a rupture after conflict.',
  'Decision Support':'Clarify options, tradeoffs, uncertainties, and decision factors.'
};
const templates=[
  ['Miscommunication','We had a disagreement where we seem to remember the same conversation differently. I want to separate what is known from what each of us inferred.'],
  ['Trust concern','Something happened that affected trust. I want to examine the evidence, possible explanations, what is still unknown, and what would fairly verify the situation.'],
  ['Recurring conflict','We keep having the same argument. I want to identify the interaction pattern, each person’s needs, repair opportunities, and a better conversation plan.'],
  ['Boundary issue','A repeated behavior is bothering me. I want help defining a clear boundary, a specific request, and what I can control if the behavior continues.'],
  ['Hard decision','I need to make a relationship decision and want to compare the options, evidence, risks, uncertainties, and values involved without being pushed toward one answer.']
] as const;
const draftKey='parallax-draft';
const historyKey='parallax-history';

export default function Analyze(){
  const [situation,setSituation]=useState('');
  const [goal,setGoal]=useState('');
  const [evidenceNotes,setEvidenceNotes]=useState('');
  const [tagText,setTagText]=useState('');
  const [mode,setMode]=useState<(typeof Modes)[number]>('Quick Review');
  const [physiology,setPhysiology]=useState('');
  const [result,setResult]=useState<Analysis|null>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [history,setHistory]=useState<Saved[]>([]);
  const tags=useMemo(()=>tagText.split(',').map(x=>x.trim()).filter(Boolean).slice(0,6),[tagText]);

  useEffect(()=>{
    try{
      const saved=JSON.parse(localStorage.getItem(historyKey)||'[]');
      setHistory(Array.isArray(saved)?saved:[]);
      const draft=JSON.parse(localStorage.getItem(draftKey)||'{}');
      if(draft&&typeof draft==='object'){
        if(typeof draft.situation==='string')setSituation(draft.situation);
        if(typeof draft.goal==='string')setGoal(draft.goal);
        if(typeof draft.evidenceNotes==='string')setEvidenceNotes(draft.evidenceNotes);
        if(typeof draft.physiology==='string')setPhysiology(draft.physiology);
        if(typeof draft.tagText==='string')setTagText(draft.tagText);
        if(Modes.includes(draft.mode))setMode(draft.mode);
      }
    }catch{}
  },[]);

  useEffect(()=>{
    localStorage.setItem(draftKey,JSON.stringify({situation,goal,evidenceNotes,physiology,tagText,mode}));
  },[situation,goal,evidenceNotes,physiology,tagText,mode]);

  function persist(next:Saved[]){setHistory(next);localStorage.setItem(historyKey,JSON.stringify(next))}
  function clearDraft(){setSituation('');setGoal('');setEvidenceNotes('');setPhysiology('');setTagText('');setResult(null);setError('');localStorage.removeItem(draftKey)}
  function loadSaved(x:Saved){setSituation(x.situation);setGoal(x.goal||'');setEvidenceNotes(x.evidenceNotes||'');setTagText((x.tags||[]).join(', '));setMode(x.mode as typeof mode);setResult(x.result);window.scrollTo({top:0,behavior:'smooth'})}
  function toggleFavorite(id:string){persist(history.map(x=>x.id===id?{...x,favorite:!x.favorite}:x))}
  function removeSaved(id:string){persist(history.filter(x=>x.id!==id))}
  async function run(){
    setLoading(true);setError('');
    try{
      const r=await fetch('/api/analyze',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({situation,goal,evidenceNotes,mode,physiology:mode==='Credibility Insight'?physiology:undefined})});
      const d=await r.json();
      if(!r.ok)throw new Error(d.error||'Request failed');
      setResult(d);
      const item:Saved={id:crypto.randomUUID(),at:new Date().toISOString(),mode,situation,goal,evidenceNotes,tags,result:d};
      persist([item,...history].slice(0,50));
    }catch(e){setError(e instanceof Error?e.message:'Request failed')}
    finally{setLoading(false)}
  }

  return <main className="wrap">
    <span className="pill">Private analysis workspace</span>
    <h1 style={{fontSize:'3rem'}}>Analyze</h1>
    <div className="card grid">
      <section>
        <b>Start from a template</b>
        <div className="action-row" style={{marginTop:10}}>{templates.map(([name,text])=><button className="chip" key={name} type="button" onClick={()=>setSituation(text)}>{name}</button>)}</div>
      </section>
      <label>What happened?
        <textarea maxLength={12000} rows={9} value={situation} onChange={e=>setSituation(e.target.value)} placeholder="Describe the situation, what each person said or did, and what you directly observed."/>
        <small className="muted">{situation.length.toLocaleString()} / 12,000 characters</small>
      </label>
      <label>What do you want help with? <span className="muted">(optional)</span>
        <textarea maxLength={2000} rows={3} value={goal} onChange={e=>setGoal(e.target.value)} placeholder="Example: decide what to ask next, plan a repair conversation, or define a boundary."/>
      </label>
      <label>Evidence or records you already have <span className="muted">(optional)</span>
        <textarea maxLength={4000} rows={4} value={evidenceNotes} onChange={e=>setEvidenceNotes(e.target.value)} placeholder="Messages, timestamps, receipts, witnesses, agreements, or other independently checkable information."/>
      </label>
      <label>Mode
        <select value={mode} onChange={e=>setMode(e.target.value as typeof mode)}>{Modes.map(m=><option key={m}>{m}</option>)}</select>
        <small className="muted">{modeHelp[mode]}</small>
      </label>
      <label>Tags <span className="muted">(optional, comma separated)</span>
        <input className="text-input" value={tagText} onChange={e=>setTagText(e.target.value)} placeholder="trust, communication, boundary"/>
        {tags.length>0&&<small className="muted">Saved as: {tags.join(' · ')}</small>}
      </label>
      {mode==='Credibility Insight'&&<label>Physiological signals <span className="muted">(optional)</span>
        <textarea maxLength={6000} rows={6} value={physiology} onChange={e=>setPhysiology(e.target.value)} placeholder="Enter baseline and relevant readings, e.g. resting HR 72, relevant-question HR 91; HRV 48→31 ms; EDA 2.1→4.0 µS; respiration 14→21/min; note movement, caffeine, anxiety, medications, pain, or sensor artifacts."/>
        <small className="muted">This can estimate physiological arousal or anomaly only. It cannot establish whether someone is truthful.</small>
      </label>}
      <div className="action-row">
        <button className="btn" disabled={loading||situation.trim().length<10} onClick={run}>{loading?'Analyzing…':'Analyze'}</button>
        <button className="btn secondary" type="button" onClick={clearDraft}>Clear draft</button>
      </div>
      {error&&<p className="error-text">{error}</p>}
    </div>

    {result&&<Result r={result}/>}
    <h2 style={{marginTop:40}}>Recent analyses</h2>
    {history.length===0?<p className="muted">Saved locally on this device.</p>:history.slice(0,8).map(x=><article key={x.id} className="card" style={{marginBottom:10}}>
      <div className="split-row"><b>{x.mode}</b><span className="muted">{new Date(x.at).toLocaleDateString()}</span></div>
      <p className="muted">{x.situation.slice(0,160)}{x.situation.length>160?'…':''}</p>
      {(x.tags||[]).length>0&&<div className="action-row">{x.tags!.map(t=><span className="tag" key={t}>{t}</span>)}</div>}
      <div className="action-row" style={{marginTop:12}}>
        <button className="chip" type="button" onClick={()=>loadSaved(x)}>Open</button>
        <button className="chip" type="button" aria-label={x.favorite?'Remove favorite':'Add favorite'} onClick={()=>toggleFavorite(x.id)}>{x.favorite?'★ Favorite':'☆ Favorite'}</button>
        <button className="chip danger" type="button" onClick={()=>removeSaved(x.id)}>Delete</button>
      </div>
    </article>)}
  </main>
}

function toMarkdown(r:Analysis){
  const sections:[string,string[]][]=[
    ['Facts',r.facts],['Assumptions / Inferences',r.assumptions],['Perspectives',r.perspectives],['Evidence',r.evidence],['Unknowns',r.unknowns],['Contradictions / Tensions',r.contradictions],['Alternative hypotheses',r.alternativeHypotheses],['Neutral follow-up questions',r.followUpQuestions],['Verification plan',r.verificationPlan],['Next steps',r.nextSteps]
  ];
  return ['# Parallax Resolve Analysis','',r.summary,'',...sections.flatMap(([h,a])=>['## '+h,...a.map(x=>'- '+x),'']),'## Calm message',r.calmMessage,'','## Evidence confidence',r.confidence+'% — '+r.confidenceNote].join('\n');
}

function Result({r}:{r:Analysis}){
  const groups:[string,string[]][]=[['Facts',r.facts],['Assumptions / Inferences',r.assumptions],['Perspectives',r.perspectives],['Evidence',r.evidence],['Unknowns',r.unknowns],['Contradictions / Tensions',r.contradictions],['Alternative hypotheses',r.alternativeHypotheses],['Neutral follow-up questions',r.followUpQuestions],['Verification plan',r.verificationPlan],['Next steps',r.nextSteps]];
  return <div className="card result" style={{marginTop:20}}>
    <h2>{r.summary}</h2>
    <div className="action-row">
      <button className="btn secondary" onClick={()=>navigator.clipboard.writeText(JSON.stringify(r,null,2))}>Copy JSON</button>
      <button className="btn secondary" onClick={()=>navigator.clipboard.writeText(toMarkdown(r))}>Copy Markdown</button>
    </div>
    {groups.map(([h,a])=><section key={h}><b>{h}</b><ul>{a.map((x,i)=><li key={i}>{x}</li>)}</ul></section>)}
    {r.relationship&&<section>
      <h3>Relationship Coach</h3>
      {r.relationship.healthSignals&&<div className="grid feature-grid">{Object.entries(r.relationship.healthSignals).filter(([k])=>k!=='note').map(([k,v])=><div className="card" key={k}><div className="metric">{String(v)}</div><div className="muted">{k}</div></div>)}</div>}
      {r.relationship.healthSignals&&<p className="muted">{r.relationship.healthSignals.note}</p>}
      <b>Emotions</b><ul>{r.relationship.emotions.map((x,i)=><li key={i}>{x}</li>)}</ul>
      <b>Needs & values</b><ul>{r.relationship.needsAndValues.map((x,i)=><li key={i}>{x}</li>)}</ul>
      <b>Interaction pattern</b><ul>{r.relationship.interactionPattern.map((x,i)=><li key={i}>{x}</li>)}</ul>
      <b>Shared ground</b><ul>{r.relationship.sharedGround.map((x,i)=><li key={i}>{x}</li>)}</ul>
      <b>Repair opportunities</b><ul>{r.relationship.repairOpportunities.map((x,i)=><li key={i}>{x}</li>)}</ul>
      <b>Boundaries</b><ul>{r.relationship.boundaries.map((x,i)=><li key={i}>{x}</li>)}</ul>
      <b>Conversation plan</b><ol>{r.relationship.conversationPlan.map((x,i)=><li key={i}>{x}</li>)}</ol>
      <b>Decision factors</b><ul>{r.relationship.decisionFactors.map((x,i)=><li key={i}>{x}</li>)}</ul>
      {r.relationship.safetyNote&&<p className="muted"><b>Safety:</b> {r.relationship.safetyNote}</p>}
    </section>}
    <section><b>Calm message</b><p>{r.calmMessage}</p><button className="btn" onClick={()=>navigator.clipboard.writeText(r.calmMessage)}>Copy message</button></section>
    <section><b>Evidence confidence: {r.confidence}%</b><p className="muted">{r.confidenceNote}</p></section>
    {r.physiology&&<section><h3>Physiological Signal Assessment</h3><p><b>Signal quality:</b> {r.physiology.signalQuality}</p><p><b>Arousal score:</b> {r.physiology.arousalScore}/100</p><p><b>Anomaly confidence:</b> {r.physiology.anomalyConfidence}%</p><p>{r.physiology.interpretation}</p><b>Observed signals</b><ul>{r.physiology.observedSignals.map((x,i)=><li key={i}>{x}</li>)}</ul><b>Alternative explanations</b><ul>{r.physiology.alternativeExplanations.map((x,i)=><li key={i}>{x}</li>)}</ul><p className="muted"><b>Limitation:</b> {r.physiology.limitation} Physiological arousal cannot establish truth or deception.</p></section>}
  </div>
}
