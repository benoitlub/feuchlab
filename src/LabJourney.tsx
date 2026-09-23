import {useEffect,useState} from 'react';
import {exportLabSessions,loadLabSessions,type LabSession} from './lab-memory';
const labels:Record<string,string>={zener:"What's Behind?",stop:'Feel It Now',flash:'Did You See It?',marty:"Marty's Button",dice:'Feuch Dice'};
export default function LabJourney({archive=false}:{archive?:boolean}){
 const [sessions,setSessions]=useState<LabSession[]>(loadLabSessions);
 useEffect(()=>{const refresh=()=>setSessions(loadLabSessions());window.addEventListener('fli-memory-updated',refresh);window.addEventListener('focus',refresh);return()=>{window.removeEventListener('fli-memory-updated',refresh);window.removeEventListener('focus',refresh)}},[]);
 const distinct=new Set(sessions.map(x=>x.protocol)).size;
 const days=new Set(sessions.map(x=>new Date(x.date).toLocaleDateString('sv-SE'))).size;
 const points=sessions.map((_,i)=>({x:16+i*(288/Math.max(1,sessions.length-1)),y:104-(i+1)/Math.max(1,sessions.length)*84}));
 const path=points.map((p,i)=>(i?'L':'M')+p.x.toFixed(1)+' '+p.y.toFixed(1)).join(' ');
 const counts=Object.entries(sessions.reduce<Record<string,number>>((acc,s)=>{acc[s.protocol]=(acc[s.protocol]||0)+1;return acc},{})).sort((a,b)=>b[1]-a[1]);
 const max=Math.max(1,...counts.map(x=>x[1]));
 return <section className="fli-memory">
 <div className="fli-memory-stats"><div><strong>{sessions.length}</strong><small>SESSIONS</small></div><div><strong>{distinct}/14</strong><small>PROTOCOLES EXPLORÉS</small></div><div><strong>{days}</strong><small>JOURS ACTIFS</small></div></div>
 {!archive&&<><h3>LE CHEMIN PARCOURU</h3><p>Chaque session terminée trace un pas de plus dans le laboratoire.</p><svg className="fli-memory-chart" viewBox="0 0 320 130" role="img" aria-label={'Progression cumulée : '+sessions.length+' sessions'}><path d="M16 110H304 M16 65H304 M16 20H304" stroke="currentColor" opacity=".18" strokeDasharray="3 5"/>{points.length>0&&<><path d={path} fill="none" stroke="#65ff98" strokeWidth="2.5" strokeLinecap="round"/>{points.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="3" fill="#65ff98"/>)}</>}<text x="16" y="125" fill="currentColor" fontSize="9">DÉPART</text><text x="304" y="125" textAnchor="end" fill="currentColor" fontSize="9">AUJOURD'HUI</text></svg><h3>EXPÉRIENCES EXPLORÉES</h3>{counts.length?counts.map(([name,count])=><div className="fli-memory-bar" key={name}><span>{labels[name]||name} · {count}</span><div><i style={{width:count/max*100+'%'}}/></div></div>):<p>Ton parcours apparaîtra après ta première session terminée.</p>}<h3>ÉTAPES DU LABORATOIRE</h3>{[[1,'Premier protocole'],[3,'Trois expériences'],[10,'Dix sessions'],[5,'Cinq protocoles différents']].map(([n,label],i)=><div className="fli-memory-milestone" key={i}><span>{(i===3?distinct:sessions.length)>=Number(n)?'◆':'◇'}</span><strong>{label}</strong><small>{Math.min(i===3?distinct:sessions.length,Number(n))}/{n}</small></div>)}</>}
 {archive&&<><h3>JOURNAL DES SESSIONS</h3>{sessions.length===0?<p>Aucune session enregistrée pour le moment.</p>:sessions.slice().reverse().map(s=><article className="fli-memory-entry" key={s.id}><strong>{labels[s.protocol]||s.protocol}</strong><time>{new Date(s.date).toLocaleString()}</time><span>{s.score!==null&&s.total!==null?s.score+' / '+s.total:s.detail||'Session terminée'}</span></article>)}<button onClick={exportLabSessions} disabled={!sessions.length}>Exporter ma mémoire (JSON)</button></>}
 <small>Historique enregistré sur cet appareil uniquement. Les données des autres jeux ne sont pas encore synchronisées.</small>
 </section>;
}
