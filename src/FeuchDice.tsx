import { useEffect, useRef, useState } from 'react';
import { generateDiceAliases, improveDiceChallenges } from './domain/feuch-dice-octopus';
import './feuch-dice.css';

type Player = { name: string; dignity: number };
type Challenge = { title: string; instruction: string; kind: 'sum'|'pair'|'value'|'odd'|'sequence'|'triple'; target?: number; rolls: number };
const aliases = ['SAUCISSE SUPRÊME','BARON DU SLIP','CAPITAINE CLAQUETTE','JEAN-MICHEL SEUM','DUC DE LA LOOSE','GÉNÉRAL FLANBY','MAÎTRE BOULETTE','COMTE DE LA CHAUSSETTE'];
const rand = () => crypto.getRandomValues(new Uint32Array(1))[0]! % 6 + 1;
function category(d: number[]) { const s=[...d].sort((a,b)=>a-b); return s[0]===s[2]?'BRELAN':s[0]===s[1]||s[1]===s[2]?'PAIRE':s[0]!+1===s[1]&&s[1]!+1===s[2]?'SUITE':'BAZAR'; }
function challenges(cat:string, d:number[]):Challenge[] {
 const v=d[0]!;
 if(cat==='BRELAN') return [{title:'LE TRIPLE RIDICULE',instruction:'Obtiens un brelan en trois lancers. Tu peux garder des dés.',kind:'triple',rolls:3},{title:'LA GRANDE GUEULE',instruction:`Annonce le ${v}, puis fais apparaître ce chiffre en deux lancers.`,kind:'value',target:v,rolls:2},{title:'LE COMPTE EST MAUVAIS',instruction:'Obtiens au moins 13 avec trois dés, en deux lancers.',kind:'sum',target:13,rolls:2}];
 if(cat==='SUITE') return [{title:'LE DOMINO',instruction:'Obtiens trois chiffres consécutifs en trois lancers.',kind:'sequence',rolls:3},{title:'LA GRANDE GUEULE',instruction:`Fais apparaître le ${v} en deux lancers.`,kind:'value',target:v,rolls:2},{title:'LA PARITÉ DU SEUM',instruction:'Obtiens trois dés de même parité en deux lancers.',kind:'odd',rolls:2}];
 if(cat==='PAIRE') return [{title:'LE DÉ DE TROP',instruction:'Obtiens une paire en deux lancers.',kind:'pair',rolls:2},{title:'LA GRANDE GUEULE',instruction:`Fais apparaître le ${v} en deux lancers.`,kind:'value',target:v,rolls:2},{title:'LE COMPTE EST MAUVAIS',instruction:'Obtiens au moins 12 avec trois dés en deux lancers.',kind:'sum',target:12,rolls:2}];
 return [{title:'LA GRANDE GUEULE',instruction:`Fais apparaître le ${v} en deux lancers.`,kind:'value',target:v,rolls:2},{title:'LA PARITÉ DU SEUM',instruction:'Obtiens trois dés de même parité en deux lancers.',kind:'odd',rolls:2},{title:'LE COMPTE EST MAUVAIS',instruction:'Obtiens au moins 11 avec trois dés en deux lancers.',kind:'sum',target:11,rolls:2}];
}
function succeeds(c:Challenge,d:number[]) { const s=[...d].sort((a,b)=>a-b); switch(c.kind){case 'sum':return d.reduce((a,b)=>a+b,0)>=c.target!;case 'pair':return s[0]===s[1]||s[1]===s[2];case 'value':return d.includes(c.target!);case 'odd':return d.every(x=>x%2===d[0]!%2);case 'sequence':return s[0]!+1===s[1]&&s[1]!+1===s[2];case 'triple':return s[0]===s[2];} }
type Phase='attack'|'choose'|'handoff'|'defend'|'verdict'|'end';
export default function FeuchDice({onBack}:{onBack:()=>void}) {
 const [players,setPlayers]=useState<Player[]>([{name:aliases[0]!,dignity:3},{name:aliases[1]!,dignity:3}]);
 const [attacker,setAttacker]=useState(0);
 const [phase,setPhase]=useState<Phase>('attack');
 const [values,setValues]=useState<number[]>([1,2,3]);
 const [held,setHeld]=useState<boolean[]>([false,false,false]);
 const [rolls,setRolls]=useState(0);
 const [rolling,setRolling]=useState(false);
 const rollTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>()=>{if(rollTimer.current)clearTimeout(rollTimer.current);},[]);
 const [challenge,setChallenge]=useState<Challenge|null>(null);
 const [comment,setComment]=useState('Trois dés. Trois dignités. Aucune garantie de les conserver.');
 const [won,setWon]=useState(false);
 const [options,setOptions]=useState<Challenge[]>([]);
 const [octopusState,setOctopusState]=useState<'loading'|'live'|'local'>('loading');
 const [octopusDetail,setOctopusDetail]=useState('Attribution des surnoms en cours…');
 const requestId=useRef(0);
 useEffect(()=>{let active=true;generateDiceAliases().then(names=>{if(active){setPlayers(prev=>prev.map((p,i)=>({...p,name:names[i]!})));setOctopusState('live');setOctopusDetail('Surnoms générés par Octopus.');}}).catch((error:unknown)=>{if(active){setOctopusState('local');setOctopusDetail('Surnoms locaux · '+(error instanceof Error?error.message:'erreur inconnue'));}});return()=>{active=false;};},[]);
 const defender=1-attacker;
 const current=players[phase==='defend'||phase==='handoff'?defender:attacker]!;
 const maxRolls=phase==='defend'?challenge?.rolls??2:3;
 const roll=()=>{if(rolling||rolls>=maxRolls||held.every(Boolean))return;const result=values.map((v,i)=>held[i]?v:rand());setRolling(true);rollTimer.current=setTimeout(()=>{setValues(result);setRolls(n=>n+1);setRolling(false);rollTimer.current=null;setComment(phase==='defend'?'Marty : « La dignité est en cours de vérification. »':'Marty : « Le hasard refuse de commenter. »');},700);};
 const resetDice=()=>{if(rollTimer.current)clearTimeout(rollTimer.current);rollTimer.current=null;setRolling(false);setValues([1,2,3]);setHeld([false,false,false]);setRolls(0);};
 const finishAttack=()=>{if(!rolls||rolling)return;const base=challenges(category(values),values);setOptions(base);setPhase('choose');setOctopusState('loading');setOctopusDetail('Amélioration des trois manigances en cours…');setComment('Marty : « Trois propositions, une amitié en moins. »');const id=++requestId.current;improveDiceChallenges(category(values),values,base,players.map(p=>p.name)).then(flavor=>{if(id!==requestId.current)return;setOptions(base.map((item,i)=>({...item,title:flavor[i]!.title,instruction:item.instruction})));setOctopusState('live');setOctopusDetail('Titres générés par Octopus ; règles locales vérifiables.');}).catch((error:unknown)=>{if(id===requestId.current){setOctopusState('local');setOctopusDetail('Manigances locales · '+(error instanceof Error?error.message:'erreur inconnue'));}});};
 const choose=(c:Challenge)=>{requestId.current++;setChallenge(c);resetDice();setPhase('handoff');setComment(`Marty : « ${players[defender]!.name}, votre réputation est convoquée. »`);};
 const judge=()=>{if(!challenge||!rolls||rolling)return;const success=succeeds(challenge,values);setWon(success);if(!success)setPlayers(prev=>prev.map((p,i)=>i===defender?{...p,dignity:Math.max(0,p.dignity-1)}:p));setComment(success?'Marty : « La honte a raté sa correspondance. »':'Marty : « Une brique de dignité vient de demander sa mutation. »');setPhase('verdict');};
 const next=()=>{if(!won&&players[defender]!.dignity===0){setPhase('end');return;}setAttacker(defender);setChallenge(null);resetDice();setPhase('attack');setComment('Marty : « À votre tour de gâcher cette belle amitié. »');};
 const restart=()=>{requestId.current++;const shuffled=[...aliases].sort(()=>Math.random()-.5);setPlayers([{name:shuffled[0]!,dignity:3},{name:shuffled[1]!,dignity:3}]);setAttacker(0);setChallenge(null);resetDice();setPhase('attack');setComment('Marty : « Nouveau départ. Même erreur de jugement. »');generateDiceAliases().then(names=>setPlayers(prev=>prev.map((p,i)=>({...p,name:names[i]!})))).catch(()=>{});};
 return <main className="fd-screen"><header className="fd-header"><button onClick={onBack}>← LABO</button><strong>FEUCH DICE</strong><span>3 DÉS · 0 DIGNITÉ</span></header>
 <div className={'fd-octopus fd-octopus-'+octopusState} role="status" aria-live="polite"><strong>🐙 OCTOPUS {octopusState==='loading'?'· CONNEXION…':octopusState==='live'?'· ACTIF':'· SECOURS LOCAL'}</strong><span>{octopusDetail}</span></div><section className="fd-players">{players.map((p,i)=><div className={'fd-player '+(i===attacker?'active':'')} key={i}><small>{p.name}</small><div className="fd-bricks" aria-label={p.dignity+' points de dignité'}>{[0,1,2].map(n=><i key={n} className={n<p.dignity?'full':'empty'}/>)}</div></div>)}</section>
 <section className="fd-led"><small>{phase==='attack'?'ATTAQUE · '+current.name:phase==='choose'?'COMBINAISON : '+category(values):phase==='end'?'FIN DE PARTIE':phase==='verdict'?'VERDICT':challenge?'DÉFI RIDICULE':'FEUCH DICE'}</small><h1>{phase==='attack'?'FABRIQUE TON COUP BAS':phase==='choose'?'CHOISIS TA MANIGANCE':phase==='handoff'?'PASSE LE TÉLÉPHONE':phase==='defend'?challenge?.title:phase==='verdict'?(won?'DIGNITÉ SAUVÉE':'TU TE TAPES LA HONTE'):players[attacker]!.name+' GAGNE'}</h1><p>{phase==='attack'?'Trois lancers maximum. Garde les dés qui t’arrangent.':phase==='choose'?'Une combinaison, trois façons de lui nuire.':phase==='handoff'?`À ${players[defender]!.name} de relever le défi.`:phase==='defend'?challenge?.instruction:phase==='verdict'?(won?'Aucune brique perdue. Cette fois.':'−1 brique de dignité.'): 'Le seum est officiellement attribué.'}</p></section>
 <section className="fd-comment"><small>MARTY // COMMENTAIRES</small><p>{comment}</p></section>
 {phase==='choose'&&<section className="fd-options"><small className="fd-ai-status" aria-live="polite">{octopusState==='loading'?'🐙 OCTOPUS RÉFLÉCHIT · OPTIONS LOCALES JOUABLES':octopusState==='live'?'🐙 OCTOPUS · TITRES AMÉLIORÉS':'MODE LOCAL · MANIGANCES DE SECOURS'}</small>{options.map((c,i)=><button key={i} onClick={()=>choose(c)}><small>MANIGANCE 0{i+1}</small><strong>{c.title}</strong><span>{c.instruction}</span><b>CHOISIR ↗</b></button>)}</section>}
 {phase==='verdict'&&<button className="fd-main fd-continue" onClick={next}>{!won&&players[defender]!.dignity===0?'VOIR LE SEUM':'À TON TOUR DE L’ATTAQUER →'}</button>}
 {phase==='handoff'&&<button className="fd-main fd-continue" onClick={()=>setPhase('defend')}>J’ASSUME LE DÉFI →</button>}
 {phase==='end'&&<button className="fd-main fd-continue" onClick={restart}>ÇA VA PAS SE PASSER COMME ÇA ↻</button>}
 {(phase==='attack'||phase==='defend')&&<div className="fd-controls"><small>LANCER {rolls} / {maxRolls} · TOUCHE UN DÉ POUR LE GARDER</small>{(rolls>0||rolling)&&<div className="fd-dice" aria-live="polite">{values.map((v,i)=><button key={i} disabled={rolling} className={(held[i]?'held ':'')+(rolling&&!held[i]?'rolling':'')} onClick={()=>setHeld(h=>h.map((b,j)=>j===i?!b:b))} aria-label={`Dé ${i+1}, ${rolling&&!held[i]?'en cours de lancer':`valeur ${v}, ${held[i]?'gardé':'libre'}`}`}><span>{rolling&&!held[i]?'⚄':['','⚀','⚁','⚂','⚃','⚄','⚅'][v]}</span><small>{held[i]?'GARDÉ':rolling?'LANCEMENT…':'LIBRE'}</small></button>)}</div>}<button className="fd-main" disabled={rolling||rolls>=maxRolls||held.every(Boolean)} onClick={roll}>{rolling?'🎲 LES DÉS ROULENT…':'🎲 LANCER LES DÉS'}</button><button className="fd-secondary" disabled={!rolls||rolling} onClick={phase==='attack'?finishAttack:judge}>{phase==='attack'?'CHOISIR UNE MANIGANCE →':'VALIDER LE DÉFI →'}</button></div>}
 </main>;
}
