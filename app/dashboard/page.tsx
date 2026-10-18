'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import Link from 'next/link';
import {Modes,type Analysis} from '@/lib/schema';

type Saved={id:string;at:string;mode:string;situation:string;goal?:string;evidenceNotes?:string;tags?:string[];favorite?:boolean;result:Analysis};
const key='parallax-history';

export default function Dashboard(){
  const [items,setItems]=useState<Saved[]>([]);
  const [query,setQuery]=useState('');
  const [mode,setMode]=useState('All');
  const [favoritesOnly,setFavoritesOnly]=useState(false);
  const fileRef=useRef<HTMLInputElement>(null);

  useEffect(()=>{try{const v=JSON.parse(localStorage.getItem(key)||'[]');setItems(Array.isArray(v)?v:[])}catch{setItems([])}},[]);
  const persist=(next:Saved[])=>{setItems(next);localStorage.setItem(key,JSON.stringify(next))};
  const filtered=useMemo(()=>items.filter(x=>{
    const hay=[x.situation,x.result?.summary,x.mode,...(x.tags||[])].join(' ').toLowerCase();
    return (!query||hay.includes(query.toLowerCase()))&&(mode==='All'||x.mode===mode)&&(!favoritesOnly||x.favorite);
  }),[items,query,mode,favoritesOnly]);
  const favoriteCount=items.filter(x=>x.favorite).length;
  const mostUsed=useMemo(()=>{
    const counts=new Map<string,number>();items.forEach(x=>counts.set(x.mode,(counts.get(x.mode)||0)+1));
    return [...counts.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]||'—';
  },[items]);

  function clear(){if(confirm('Clear all analyses saved on this device?'))persist([])}
  function remove(id:string){persist(items.filter(x=>x.id!==id))}
  function toggle(id:string){persist(items.map(x=>x.id===id?{...x,favorite:!x.favorite}:x))}
  function reopen(x:Saved){
    localStorage.setItem('parallax-draft',JSON.stringify({situation:x.situation,goal:x.goal||'',evidenceNotes:x.evidenceNotes||'',tagText:(x.tags||[]).join(', '),mode:x.mode,physiology:''}));
    window.location.href='/analyze';
  }
  function exportHistory(){
    const blob=new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),history:items},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='parallax-history.json';a.click();URL.revokeObjectURL(url);
  }
  async function importHistory(file:File){
    try{
      const parsed=JSON.parse(await file.text());
      const raw=Array.isArray(parsed)?parsed:parsed?.history;
      if(!Array.isArray(raw))throw new Error('No history array found');
      const safe=raw.filter((x:unknown):x is Saved=>{
        if(!x||typeof x!=='object')return false;
        const v=x as Partial<Saved>;
        return typeof v.id==='string'&&typeof v.at==='string'&&typeof v.mode==='string'&&typeof v.situation==='string'&&!!v.result&&typeof v.result==='object';
      }).slice(0,50);
      if(!safe.length)throw new Error('No valid analyses found');
      const merged=[...safe,...items].filter((x,i,a)=>a.findIndex(y=>y.id===x.id)===i).slice(0,50);
      persist(merged);
    }catch(e){alert(e instanceof Error?e.message:'Could not import history')}
    finally{if(fileRef.current)fileRef.current.value=''}
  }

  return <main className="wrap">
    <span className="pill">Local intelligence vault</span>
    <h1 style={{fontSize:'3.4rem'}}>Dashboard</h1>
    <p className="muted">Your recent analyses stay in this browser unless you explicitly export or share them.</p>

    <div className="grid feature-grid" style={{margin:'28px 0'}}>
      <div className="card"><div className="metric">{items.length}</div><div className="muted">saved analyses</div></div>
      <div className="card"><div className="metric">{favoriteCount}</div><div className="muted">favorites</div></div>
      <div className="card"><div className="metric" style={{fontSize:'1.35rem'}}>{mostUsed}</div><div className="muted">most-used mode</div></div>
    </div>

    <div className="card grid" style={{marginBottom:24}}>
      <label>Search history<input className="text-input" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search situations, summaries, modes, or tags"/></label>
      <div className="grid two-col">
        <label>Filter by mode<select value={mode} onChange={e=>setMode(e.target.value)}><option>All</option>{Modes.map(m=><option key={m}>{m}</option>)}</select></label>
        <label className="check-label"><input type="checkbox" checked={favoritesOnly} onChange={e=>setFavoritesOnly(e.target.checked)}/> Favorites only</label>
      </div>
      <div className="action-row">
        <button className="btn secondary" type="button" disabled={!items.length} onClick={exportHistory}>Export JSON</button>
        <button className="btn secondary" type="button" onClick={()=>fileRef.current?.click()}>Import JSON</button>
        <input ref={fileRef} hidden type="file" accept="application/json,.json" onChange={e=>{const f=e.target.files?.[0];if(f)void importHistory(f)}}/>
      </div>
    </div>

    {items.length===0?<div className="card"><h2>No analyses yet</h2><p className="muted">Run your first situation through the analysis studio.</p><Link className="btn" href="/analyze">Open studio</Link></div>:
      <div className="grid">
        <p className="muted">{filtered.length} of {items.length} analyses shown</p>
        {filtered.map(x=><article className="card" key={x.id}>
          <div className="split-row"><span className="pill">{x.mode}</span><button className="icon-btn" aria-label={x.favorite?'Remove favorite':'Add favorite'} onClick={()=>toggle(x.id)}>{x.favorite?'★':'☆'}</button></div>
          <h2 style={{marginTop:18}}>{x.result?.summary||'Saved analysis'}</h2>
          <p className="muted">{x.situation}</p>
          {(x.tags||[]).length>0&&<div className="action-row">{x.tags!.map(t=><span className="tag" key={t}>{t}</span>)}</div>}
          <small className="muted">{new Date(x.at).toLocaleString()}</small>
          <div className="action-row" style={{marginTop:15}}>
            <button className="chip" onClick={()=>reopen(x)}>Open in studio</button>
            <button className="chip danger" onClick={()=>remove(x.id)}>Delete</button>
          </div>
        </article>)}
        {filtered.length===0&&<div className="card"><b>No matches</b><p className="muted">Change the search or filters.</p></div>}
        <button className="btn danger-btn" onClick={clear}>Clear local history</button>
      </div>}
  </main>
}
