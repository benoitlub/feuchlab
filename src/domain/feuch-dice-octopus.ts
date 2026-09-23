const API = 'https://octopus-engine-app.benoitlubert.workers.dev';
// Shared across alias and challenge requests. A 429 stops further calls for this session.
let rateLimited = false;
export function isDiceAiRateLimited(): boolean { return rateLimited; }
export type DiceFlavor = { title: string; instruction: string };
function parseJson(text: string): unknown {
 const clean=text.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'').trim();
 try{return JSON.parse(clean);}catch { const start=clean.indexOf('{'),end=clean.lastIndexOf('}');if(start<0||end<=start)throw new Error('No JSON');return JSON.parse(clean.slice(start,end+1)); }
}
async function mission(prompt:string):Promise<unknown>{
 if(rateLimited)throw new Error('Limite Mistral atteinte · IA en pause pour cette session');
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),6500);
 try{
  const response=await fetch(API+'/mission',{method:'POST',headers:{'content-type':'application/json'},signal:controller.signal,body:JSON.stringify({operationId:'feuch_dice_'+crypto.randomUUID(),title:'Feuch Dice — habillage de manigances',objective:'Produire des textes humoristiques courts sans modifier les règles des dés.',requiredCapabilities:['game.challenge.suggest'],context:{id:'feuch-dice',label:'Feuch Dice',metadata:{source:'feuchlab'}},prompt})});
  if(response.status===429){rateLimited=true;throw new Error('Limite Mistral atteinte · IA en pause pour cette session');}
  if(!response.ok)throw new Error('Octopus HTTP '+response.status);
  const data=await response.json() as {status?:string;summary?:string;output?:{text?:unknown};resourceResult?:{message?:string}};
  if(data.status!=='completed'){
   const details=[data.summary,data.resourceResult?.message].filter((v):v is string=>typeof v==='string'&&Boolean(v));
   const reason=[...new Set(details)].join(' · ')||'Mission '+(data.status??'sans statut');
   if(/(?:429|rate_limited|rate limit exceeded)/i.test(reason)){
    rateLimited=true;
    throw new Error('Limite Mistral atteinte · IA en pause pour cette session');
   }
   throw new Error(reason);
  }
  if(typeof data.output?.text!=='string')throw new Error('Réponse Octopus sans texte');
  return parseJson(data.output.text);
 }finally{clearTimeout(timer);}
}
export async function improveDiceChallenges(category:string,values:number[],base:DiceFlavor[],names:string[]):Promise<DiceFlavor[]>{
 const result=await mission(`Réponds UNIQUEMENT en JSON valide, sans markdown : {"options":[{"title":"..."},{"title":"..."},{"title":"..."}]}. FEUCH DICE utilise exactement trois dés numérotés de 1 à 6. Le moteur local a déjà choisi trois objectifs DIFFÉRENTS et vérifiables, pour la combinaison ${category}, dés ${values.join('-')}, joueurs ${names.join(' et ')}. Invente seulement un titre humoristique court et distinct (65 caractères maximum) pour chacun, dans le même ordre. Ne modifie JAMAIS les consignes, valeurs, nombres de lancers, conditions de réussite ou règles. Objectifs immuables : ${JSON.stringify(base)}`);
 if(!result||typeof result!=='object'||!('options' in result)||!Array.isArray(result.options)||result.options.length!==3)throw new Error('Invalid options');
 return result.options.map((v:unknown,i:number)=>{if(!v||typeof v!=='object'||!('title'in v)||typeof v.title!=='string'||!v.title.trim()||v.title.length>65)throw new Error('Invalid challenge title');return {title:v.title.trim(),instruction:base[i]!.instruction};});
}
export async function generateDiceAliases():Promise<string[]>{
 const result=await mission('Réponds UNIQUEMENT en JSON valide : {"aliases":["...","..."]}. Deux surnoms DIFFÉRENTS, ridicules, courts (max 28 caractères chacun), en français, sans vrais prénoms, sans insultes discriminatoires, style Baron du Slip ou Capitaine Claquette. Aucun autre champ.');
 if(!result||typeof result!=='object'||!('aliases'in result)||!Array.isArray(result.aliases)||result.aliases.length!==2||result.aliases.some((v:unknown)=>typeof v!=='string'||!v.trim()||v.length>28)||result.aliases[0].toLowerCase()===result.aliases[1].toLowerCase())throw new Error('Invalid aliases');
 return result.aliases.map((v:string)=>v.trim().toUpperCase());
}
