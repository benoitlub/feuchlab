import type { Lang } from './LabPortal';

const COPY: Record<Lang, { phase: string; status: string; open: string; title: string }> = {
  fr: { phase: 'PHASE', status: 'OUVRIR LE FLUX BLACKLACE', open: 'Explorer le flux', title: 'Moniteur Blacklace Island' },
  en: { phase: 'PHASE', status: 'OPEN BLACKLACE FEED', open: 'Explore the feed', title: 'Blacklace Island monitor' },
  es: { phase: 'FASE', status: 'ABRIR FLUJO BLACKLACE', open: 'Explorar el flujo', title: 'Monitor Blacklace Island' },
};

/** Decorative local animation; deliberately not presented as live telemetry. */
export default function SatorMonitor({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  return <a className="feuch-sator-monitor" href="https://benoitlub.github.io/blacklace-echo/"
    target="_blank" rel="noopener noreferrer" aria-label={t.title + ' — ' + t.open}>
    <span className="feuch-sator-heading">BLACKLACE ISLAND</span>
    <span className="feuch-sator-phase">{t.phase} : <b>SATOR</b></span>
    <svg className="feuch-sator-signal" viewBox="0 0 220 54" role="img" aria-label="Signal illustratif">
      <path d="M0 27H220" stroke="#9a55c9" opacity=".42" strokeWidth="1" />
      <path className="feuch-sator-wave" d="M0 27 L9 25 13 28 17 24 21 29 26 26 31 27 35 14 38 39 41 24 45 27 49 9 52 44 56 28 62 26 68 32 72 21 76 27 81 24 84 30 88 26 93 6 97 45 101 27 105 31 109 14 113 40 117 26 123 23 127 31 131 26 137 27 142 16 145 38 150 25 156 29 160 8 164 45 168 28 175 25 179 31 183 17 187 37 191 25 196 29 201 15 205 37 210 27 220 27"
       fill="none" stroke="#df74ff" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
    <span className="feuch-sator-bottom"><span className="feuch-sator-cube" aria-hidden="true">◇</span><span>{t.status}</span><span className="feuch-sator-arrow" aria-hidden="true">↗</span></span>
  </a>;
}
