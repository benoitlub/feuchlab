import { useEffect, useState } from 'react';
import type { Lang } from './LabPortal';

const ENDPOINT = 'https://blacklace-sherlock.benoitlubert.workers.dev/api/sherlock/public-feed';
type FeedState = { status: 'checking' | 'connected' | 'unavailable'; cycle?: number; count?: number };
const COPY = {
 fr: { phase:'PHASE', signal:'SHERLOCK CONNECTÉ', waiting:'CONNEXION SHERLOCK…', offline:'FLUX INDISPONIBLE', events:'ÉVÉNEMENTS', open:'Ouvrir Blacklace Echo' },
 en: { phase:'PHASE', signal:'SHERLOCK CONNECTED', waiting:'CONNECTING TO SHERLOCK…', offline:'FEED UNAVAILABLE', events:'EVENTS', open:'Open Blacklace Echo' },
 es: { phase:'FASE', signal:'SHERLOCK CONECTADO', waiting:'CONECTANDO SHERLOCK…', offline:'FLUJO NO DISPONIBLE', events:'EVENTOS', open:'Abrir Blacklace Echo' },
} satisfies Record<Lang,Record<string,string>>;

function parseFeed(payload: unknown): Pick<FeedState,'cycle'|'count'> {
 if (!payload || typeof payload !== 'object' || !('entries' in payload)) throw new Error('Missing Sherlock entries');
 const entries = (payload as { entries?: unknown }).entries;
 if (!Array.isArray(entries)) throw new Error('Invalid Sherlock entries');
 const valid = entries.filter((e): e is { cycle: number } =>
   !!e && typeof e === 'object' && Number.isSafeInteger((e as {cycle?:unknown}).cycle) &&
   (e as {cycle:number}).cycle >= 1);
 return {count:valid.length,cycle:valid.length ? Math.max(...valid.map(e=>e.cycle)) : undefined};
}

export default function SatorMonitor({ lang }: { lang: Lang }) {
 const [feed,setFeed] = useState<FeedState>({status:'checking'});
 useEffect(()=>{
   let active=true;
   const controller = new AbortController();
   const refresh = async()=>{
     try {
       const response=await fetch(ENDPOINT,{credentials:'omit',cache:'no-store',signal:controller.signal});
       if(!response.ok)throw new Error('Sherlock feed unavailable');
       const data=parseFeed(await response.json());
       if(active)setFeed({status:'connected',...data});
     }catch{
       if(active)setFeed({status:'unavailable'});
     }
   };
   void refresh();
   const interval=window.setInterval(()=>{if(document.visibilityState==='visible')void refresh()},60000);
   return()=>{active=false;window.clearInterval(interval);controller.abort()};
 },[]);
 const t=COPY[lang];
 const stateLabel=feed.status==='connected' ? t.signal : feed.status==='checking' ? t.waiting : t.offline;
 return <a className={'feuch-sator-monitor is-'+feed.status} href="https://benoitlub.github.io/blacklace-echo/"
    target="_blank" rel="noopener noreferrer" aria-label={'Blacklace Island — '+stateLabel+' — '+t.open}>
    <span className="feuch-sator-heading">BLACKLACE ISLAND</span>
    <span className="feuch-sator-phase">{t.phase} : <b>SATOR</b>{feed.cycle!==undefined&&<span className="feuch-sator-cycle"> · {feed.cycle}</span>}</span>
    <svg className="feuch-sator-signal" viewBox="0 0 220 54" role="img" aria-label="Oscillogramme décoratif">
      <path d="M0 27H220" stroke="#9a55c9" opacity=".42" strokeWidth="1" />
      <path className="feuch-sator-wave" d="M0 27 L9 25 13 28 17 24 21 29 26 26 31 27 35 14 38 39 41 24 45 27 49 9 52 44 56 28 62 26 68 32 72 21 76 27 81 24 84 30 88 26 93 6 97 45 101 27 105 31 109 14 113 40 117 26 123 23 127 31 131 26 137 27 142 16 145 38 150 25 156 29 160 8 164 45 168 28 175 25 179 31 183 17 187 37 191 25 196 29 201 15 205 37 210 27 220 27"
       fill="none" stroke="#df74ff" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
    <span className="feuch-sator-bottom"><span className="feuch-sator-cube" aria-hidden="true">◇</span><span>{stateLabel}{feed.status==='connected'&&feed.count!==undefined?' · '+feed.count+' '+t.events:''}</span><span className="feuch-sator-arrow" aria-hidden="true">↗</span></span>
  </a>;
}
