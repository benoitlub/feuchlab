const API = 'https://octopus-engine-app.benoitlubert.workers.dev';
export type DiceFlavor = { title: string; instruction: string };
function parseJson(text: string): unknown {
 const clean=text.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'').trim();
 try{return JSON.parse(clean);}catch { const start=clean.indexOf('{'),end=clean.lastIndexOf('}');if(start<0||end<=start)throw new Error('No JSON');return JSON.parse(clean.slice(start,end+1)); }
}
async function mission(prompt:string):Promise<unknown>{
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),6500);
 try{
  const response=await fetch(API+'/mission',{method:'POST',headers:{'content-type':'application/json'},signal:controller.signal,body:JSON.stringify({operationId:'feuch_dice_'+crypto.randomUUID(),title:'Feuch Dice — habillage de manigances',objective:'Produire des textes humoristiques courts sans modifier les règles des dés.',requiredCapabilities:['game.challenge.suggest'],context:{id:'feuch-dice',label:'Feuch Dice',metadata:{source:'feuchlab'}},prompt})});
  if(!response.ok)throw new Error('Octopus HTTP '+response.status);
  const data=await response.json() as {status?:string;summary?:string;output?:{text?:unknown};resourceResult?:{message?:string}};
  if(data.status!=='completed')throw new Error([data.summary,data.resourceResult?.message].filter(Boolean).join(' · ')||'Mission '+(data.status??'sans statut'));
  if(typeof data.output?.text!=='string')throw new Error('Réponse Octopus sans texte');
  return parseJson(data.output.text);
 }finally{clearTimeout(timer);}
}
export async function improveDiceChallenges(category:string,values:number[],base:DiceFlavor[],names:string[]):Promise<DiceFlavor[]>{
 const result=await mission(`Réponds UNIQUEMENT en JSON valide, sans markdown, sous la forme {"options":[{"title":"...","instruction":"..."},...]} avec exactement 3 options dans le même ordre. Jeu humoristique FEUCH DICE, joueurs ${names.join(' et ')}, combinaison ${category}, dés ${values.join('-')}. Améliore les titres et formulations des trois manigances suivantes, style absurde et taquin, sans vulgarité agressive. IMPORTANT : conserve STRICTEMENT les conditions de victoire, valeurs, nombres de lancers, possibilités de garder les dés, et ne rajoute aucune mécanique, aucun gage physique. Les règles sont vérifiées par le code, tu ne fournis QUE du texte. Options : ${JSON.stringify(base)}`);
 if(!result||typeof result!=='object'||!('options' in result)||!Array.isArray(result.options)||result.options.length!==3)throw new Error('Invalid options');
 return result.options.map((v:unknown)=>{if(!v||typeof v!=='object'||!('title'in v)||!('instruction'in v)||typeof v.title!=='string'||typeof v.instruction!=='string'||!v.title.trim()||!v.instruction.trim()||v.title.length>65||v.instruction.length>210)throw new Error('Invalid challenge');return {title:v.title.trim(),instruction:v.instruction.trim()};});
}
export async function generateDiceAliases():Promise<string[]>{
 const result=await mission('Réponds UNIQUEMENT en JSON valide : {"aliases":["...","..."]}. Deux surnoms DIFFÉRENTS, ridicules, courts (max 28 caractères chacun), en français, sans vrais prénoms, sans insultes discriminatoires, style Baron du Slip ou Capitaine Claquette. Aucun autre champ.');
 if(!result||typeof result!=='object'||!('aliases'in result)||!Array.isArray(result.aliases)||result.aliases.length!==2||result.aliases.some((v:unknown)=>typeof v!=='string'||!v.trim()||v.length>28)||result.aliases[0].toLowerCase()===result.aliases[1].toLowerCase())throw new Error('Invalid aliases');
 return result.aliases.map((v:string)=>v.trim().toUpperCase());
}
