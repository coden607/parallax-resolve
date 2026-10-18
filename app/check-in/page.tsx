'use client';
import {useEffect,useMemo,useState} from 'react';

type Entry={id:string;at:string;connection:number;trust:number;communication:number;stress:number;note:string};
const key='parallax-checkins';
const prompts=[
  'What helped you feel understood today?',
  'What interaction felt harder than it needed to be?',
  'Was there a repair attempt, apology, or moment of reconnection?',
  'What do you need more clearly expressed next time?',
  'What assumption could you verify instead of carrying forward?',
  'What boundary or request would make the next conversation clearer?'
];

function avg(items:Entry[],field:'connection'|'trust'|'communication'|'stress'){
  if(!items.length)return null;
  return items.reduce((sum,x)=>sum+x[field],0)/items.length;
}
function fmt(n:number|null){return n===null?'—':n.toFixed(1)}
function delta(now:number|null,before:number|null){if(now===null||before===null)return '—';const d=now-before;return (d>0?'+':'')+d.toFixed(1)}

export default function CheckIn(){
  const [items,setItems]=useState<Entry[]>([]);
  const [form,setForm]=useState<Omit<Entry,'id'|'at'>>({connection:5,trust:5,communication:5,stress:5,note:''});
  const [promptIndex,setPromptIndex]=useState(0);

  useEffect(()=>{try{const raw=JSON.parse(localStorage.getItem(key)||'[]');const migrated=Array.isArray(raw)?raw.map((x:Partial<Entry>,i:number)=>({...x,id:typeof x.id==='string'?x.id:'legacy-'+i+'-'+String(x.at||'')} as Entry)):[];setItems(migrated)}catch{}},[]);
  const persist=(next:Entry[])=>{setItems(next);localStorage.setItem(key,JSON.stringify(next))};
  const windows=useMemo(()=>{
    const now=Date.now(),day=86400000;
    const recent=items.filter(x=>now-new Date(x.at).getTime()<7*day);
    const previous=items.filter(x=>{const age=now-new Date(x.at).getTime();return age>=7*day&&age<14*day});
    return {recent,previous};
  },[items]);

  function save(){
    const x:Entry={...form,id:crypto.randomUUID(),at:new Date().toISOString()};
    persist([x,...items].slice(0,90));
    setForm({...form,note:''});
    setPromptIndex((promptIndex+1)%prompts.length);
  }
  function remove(id:string){persist(items.filter(x=>x.id!==id))}
  function exportCheckins(){
    const blob=new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),checkins:items},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='parallax-checkins.json';a.click();URL.revokeObjectURL(url);
  }

  const metrics=(['connection','trust','communication','stress'] as const);
  return <main className="wrap">
    <span className="pill">Private relationship pulse</span>
    <h1 style={{fontSize:'3.4rem'}}>Check-in</h1>
    <p className="muted">Track your own perception over time. These scores are reflection prompts, not clinical measurements.</p>

    <div className="card grid">
      {metrics.map(k=><label key={k}>{k[0].toUpperCase()+k.slice(1)}: {form[k]}/10
        <input style={{width:'100%'}} type="range" min="1" max="10" value={form[k]} onChange={e=>setForm({...form,[k]:Number(e.target.value)})}/>
      </label>)}
      <div className="prompt-box"><b>Reflection prompt</b><p>{prompts[promptIndex]}</p><button className="chip" type="button" onClick={()=>setPromptIndex((promptIndex+1)%prompts.length)}>Another prompt</button></div>
      <label>What felt important today?<textarea rows={4} value={form.note} onChange={e=>setForm({...form,note:e.target.value})}/></label>
      <button className="btn" onClick={save}>Save check-in</button>
    </div>

    <h2 style={{marginTop:36}}>7-day pulse</h2>
    <div className="grid feature-grid">
      {metrics.map(k=>{const current=avg(windows.recent,k),before=avg(windows.previous,k);return <div className="card" key={k}>
        <div className="metric">{fmt(current)}</div>
        <div>{k[0].toUpperCase()+k.slice(1)}</div>
        <small className="muted">vs prior 7 days: {delta(current,before)}</small>
      </div>})}
    </div>
    <p className="muted">Trend deltas compare your own recent entries with the preceding seven-day window. They are descriptive, not diagnostic.</p>

    <div className="split-row" style={{marginTop:36}}>
      <h2 style={{margin:0}}>Recent pulse</h2>
      <button className="chip" disabled={!items.length} onClick={exportCheckins}>Export check-ins</button>
    </div>
    <div className="grid" style={{marginTop:18}}>
      {items.slice(0,14).map(x=><div className="card" key={x.id}>
        <div className="split-row"><b>{new Date(x.at).toLocaleDateString()}</b><button className="icon-btn danger" aria-label="Delete check-in" onClick={()=>remove(x.id)}>×</button></div>
        <p>Connection {x.connection}/10 · Trust {x.trust}/10 · Communication {x.communication}/10 · Stress {x.stress}/10</p>
        {x.note&&<p className="muted">{x.note}</p>}
      </div>)}
      {!items.length&&<p className="muted">No check-ins saved yet.</p>}
    </div>
  </main>
}
