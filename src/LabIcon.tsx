import type { ReactNode } from 'react';

// Blacklace Dice-inspired line pictograms, drawn for Feuch Lab's own protocols.
const drawings: Record<string, ReactNode> = {
 predict:<><path d="M4 12h16M9 7l-5 5 5 5M15 7l5 5-5 5"/><path d="M12 3v3m0 12v3"/></>,
 zener:<><path d="m12 2 2.9 6.5 7.1.8-5.3 4.8 1.5 7-6.2-3.6-6.2 3.6 1.5-7L2 9.3l7.1-.8z"/></>,
 stop:<><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 1v4m0 14v4M1 12h4m14 0h4"/></>,
 flash:<><path d="m13 2-9 12h7l-1 8 10-13h-7z"/></>,
 marty:<><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3"/></>,
 feel:<><path d="M4 12a8 8 0 0 1 16 0M4 12a8 8 0 0 0 16 0"/><path d="M12 7v10m-5-5h10"/></>,
 ghost:<><path d="M5 20V10a7 7 0 0 1 14 0v10l-3-2-4 2-4-2z"/><path d="M9 11h.01M15 11h.01"/></>,
 hands:<><path d="M8 21 4 16V9a2 2 0 0 1 4 0v4-8a2 2 0 0 1 4 0v7-6a2 2 0 0 1 4 0v6-3a2 2 0 0 1 4 0v7l-4 5z"/></>,
 walk:<><circle cx="13" cy="4" r="2"/><path d="m9 21 3-6-2-4-4 3-3 1m9 0 5 2 3 4m-10-10 4-3 4 2"/></>,
 dice:<><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="8" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="8" cy="16" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="16" r="1" fill="currentColor" stroke="none"/></>,
 silent:<><rect x="2" y="4" width="7" height="16" rx="2"/><rect x="15" y="4" width="7" height="16" rx="2"/><path d="M11 9h2m-2 6h2M5 17h1m12 0h1"/></>,
 stereo:<><circle cx="7" cy="12" r="5"/><circle cx="17" cy="12" r="5"/><path d="M10 12h4"/></>,
 pineal:<><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2"/></>,
 oculus:<><path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>,
};
export default function LabIcon({name}:{name:string}) {
 return <svg className="fli-symbol" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{drawings[name] ?? drawings.dice}</svg>;
}
