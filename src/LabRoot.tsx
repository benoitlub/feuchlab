import { useEffect, useMemo, useRef, useState } from 'react';
import App from './App';
import SilentLink from './SilentLink';
import GhostFrame from './GhostFrame';
import InstantExperiment from './InstantExperiments';
import TrainingLab from './TrainingLab';
import Pineal from './Pineal';
import QuickGames from './QuickGames';
import FeuchDice from './FeuchDice';
import LabIcon from './LabIcon';
import LabPortal, { type Lang, type Page } from './LabPortal';

type Protocol = 'library' | 'walk' | 'silent' | 'ghost' | 'predict' | 'feel' | 'stereo' | 'oculus' | 'hands' | 'pineal' | 'zener' | 'stop' | 'flash' | 'marty' | 'dice';
type Card = { protocol: Exclude<Protocol, 'library'>; id: string; title: string; description: Record<Lang, string>; meta: Record<Lang, string>; art: string };

const copy = {
  fr: { eyebrow: 'BLACKLACE ISLAND · SECTEUR EXPÉRIMENTAL', title: 'Bienvenue au Feuch Lab', subtitle: 'Jeux, perception, intuition et autres états du réel.', enter: 'Explorer les expériences', games: 'Nos jeux expérimentaux', available: 'protocoles disponibles', lab: 'Recherche & prototypes', labHint: 'Expériences visuelles en laboratoire', featured: 'Expérience à deux', featureTitle: 'Silent Link', featureText: 'Deux téléphones, une cible secrète, vingt essais.', open: 'Ouvrir', local: 'Fonctionne dans ce navigateur' },
  en: { eyebrow: 'BLACKLACE ISLAND · EXPERIMENTAL SECTOR', title: 'Welcome to Feuch Lab', subtitle: 'Games, perception, intuition and other states of reality.', enter: 'Explore the experiments', games: 'Our experimental games', available: 'available protocols', lab: 'Research & prototypes', labHint: 'Visual studies from the laboratory', featured: 'Two-player experience', featureTitle: 'Silent Link', featureText: 'Two phones, one secret target, twenty trials.', open: 'Open', local: 'Runs in this browser' },
  es: { eyebrow: 'BLACKLACE ISLAND · SECTOR EXPERIMENTAL', title: 'Bienvenido a Feuch Lab', subtitle: 'Juegos, percepción, intuición y otros estados de la realidad.', enter: 'Explorar los experimentos', games: 'Nuestros juegos experimentales', available: 'protocolos disponibles', lab: 'Investigación y prototipos', labHint: 'Experiencias visuales del laboratorio', featured: 'Experiencia para dos', featureTitle: 'Silent Link', featureText: 'Dos teléfonos, un objetivo secreto, veinte intentos.', open: 'Abrir', local: 'Funciona en este navegador' },
} satisfies Record<Lang, Record<string, string>>;

const cards: Card[] = [
  { protocol: 'dice', id: 'FLI-DICE-03', title: 'Feuch Dice', art: 'dice', description: { fr: 'Trois dés, des manigances et trois briques de dignité.', en: 'Three dice, dirty tricks and three dignity bricks.', es: 'Tres dados, trucos y tres bloques de dignidad.' }, meta: { fr: 'DUEL LOCAL', en: 'LOCAL DUEL', es: 'DUELO LOCAL' } },
  { protocol: 'predict', id: 'FLI-PREDICT-10', title: 'Before It Happens', art: 'future', description: { fr: 'Choisis avant la révélation.', en: 'Choose before the reveal.', es: 'Elige antes de la revelación.' }, meta: { fr: 'INTUITION', en: 'INTUITION', es: 'INTUICIÓN' } },
  { protocol: 'ghost', id: 'FLI-GHOST-02', title: 'Ghost Frame', art: 'ghost', description: { fr: 'Détecte les stimuli furtifs.', en: 'Detect fleeting stimuli.', es: 'Detecta estímulos fugaces.' }, meta: { fr: 'PERCEPTION', en: 'PERCEPTION', es: 'PERCEPCIÓN' } },
  { protocol: 'silent', id: 'FLI-B2B-20', title: 'Silent Link', art: 'signal', description: { fr: 'Une connexion entre deux écrans.', en: 'A connection between two screens.', es: 'Una conexión entre dos pantallas.' }, meta: { fr: 'DUO', en: 'TWO PLAYERS', es: 'DÚO' } },
  { protocol: 'zener', id: 'FLI-ZENER-20', title: "What's Behind?", art: 'zener', description: { fr: 'Devine le symbole caché.', en: 'Guess the hidden symbol.', es: 'Adivina el símbolo oculto.' }, meta: { fr: 'HASARD', en: 'CHANCE', es: 'AZAR' } },
  { protocol: 'stop', id: 'FLI-STOP-10', title: 'Feel It Now', art: 'timing', description: { fr: 'Trouve le moment précis.', en: 'Find the precise moment.', es: 'Encuentra el momento exacto.' }, meta: { fr: 'TIMING', en: 'TIMING', es: 'RITMO' } },
  { protocol: 'flash', id: 'FLI-FLASH-12', title: 'Did You See It?', art: 'flash', description: { fr: 'Un symbole dans un éclair.', en: 'A symbol in a flash.', es: 'Un símbolo en un destello.' }, meta: { fr: 'VISION', en: 'VISION', es: 'VISIÓN' } },
  { protocol: 'marty', id: 'FLI-MARTY-10', title: "Marty's Button", art: 'marty', description: { fr: 'Ne touche pas au bouton. Enfin, presque.', en: "Don't push the button. Well, almost.", es: 'No pulses el botón. Bueno, casi.' }, meta: { fr: 'FEUCH', en: 'FEUCH', es: 'FEUCH' } },
  { protocol: 'feel', id: 'FLI-FEEL-10', title: 'Something / Nothing', art: 'feel', description: { fr: 'Quelque chose, ou rien ?', en: 'Something, or nothing?', es: '¿Algo, o nada?' }, meta: { fr: 'INSTANT', en: 'INSTANT', es: 'INSTANTE' } },
  { protocol: 'hands', id: 'FLI-HAND', title: 'Hand Codex', art: 'hands', description: { fr: 'Mémorise la suite de sigils.', en: 'Remember the sigil sequence.', es: 'Memoriza la secuencia de sigilos.' }, meta: { fr: 'MÉMOIRE', en: 'MEMORY', es: 'MEMORIA' } },
  { protocol: 'walk', id: 'FLI-MW-06', title: 'Marty Walk', art: 'walk', description: { fr: 'Six pas et un débrief Blacklace.', en: 'Six steps and a Blacklace debrief.', es: 'Seis pasos y un análisis Blacklace.' }, meta: { fr: 'CAPTEURS', en: 'SENSORS', es: 'SENSORES' } },
];

const researchCards: Card[] = [
  { protocol: 'stereo', id: 'FLI-STEREO', title: 'Third Eye', art: 'stereo', description: { fr: 'Explore un stéréogramme en relief.', en: 'Explore a stereogram in 3D.', es: 'Explora un estereograma en relieve.' }, meta: { fr: 'VISION 3D', en: '3D VISION', es: 'VISIÓN 3D' } },
  { protocol: 'pineal', id: 'FLI-PINEAL', title: 'Third Eye / Pineal', art: 'pineal', description: { fr: 'Observe tes perceptions visuelles.', en: 'Observe your visual perceptions.', es: 'Observa tus percepciones visuales.' }, meta: { fr: 'PERCEPTION', en: 'PERCEPTION', es: 'PERCEPCIÓN' } },
  { protocol: 'oculus', id: 'FLI-OCULUS', title: 'Oculus', art: 'oculus', description: { fr: 'Poursuite visuelle douce.', en: 'Gentle visual tracking.', es: 'Seguimiento visual suave.' }, meta: { fr: 'PROTOTYPE', en: 'PROTOTYPE', es: 'PROTOTIPO' } },
];

export default function LabRoot() {
  const initial = useMemo<Protocol>(() => {
    const query = new URLSearchParams(location.search);
    if (query.has('room') || query.get('protocol') === 'silent') return 'silent';
    const requested = query.get('protocol') as Protocol;
    return [...cards, ...researchCards].some(({ protocol }) => protocol === requested) ? requested : 'library';
  }, []);
  const [protocol, setProtocol] = useState<Protocol>(initial);
  const [page, setPage] = useState<Page>('home');
  const [lang, setLang] = useState<Lang>(() => { const saved = localStorage.getItem('fli_lang'); return saved === 'en' || saved === 'es' ? saved : 'fr'; });
  const [theme, setTheme] = useState<'dark' | 'light'>(() => localStorage.getItem('fli_theme') === 'dark' ? 'dark' : 'light');
  const [closing, setClosing] = useState(false);
  const navigationTimer = useRef<number | null>(null);
  const t = copy[lang];

  const navigate = (destination: Protocol) => {
    if (destination === protocol || closing) return;
    const finish = () => { history.replaceState(null, '', destination === 'library' ? location.pathname : `${location.pathname}?protocol=${destination}`); setProtocol(destination); setClosing(false); window.scrollTo({ top: 0 }); };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return finish();
    setClosing(true); navigationTimer.current = window.setTimeout(finish, 220);
  };

  useEffect(() => () => { if (navigationTimer.current !== null) window.clearTimeout(navigationTimer.current); }, []);
  useEffect(() => {
    if (protocol !== 'library') return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('feuch-in-view'); observer.unobserve(entry.target); } }), { rootMargin: '0px 0px -24px 0px', threshold: .08 });
    document.querySelectorAll('.feuch-scroll-reveal').forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, [protocol, page]);

  const home = () => navigate('library');
  const frame = (node: React.ReactNode) => <main className={`feuch-protocol-world ${theme === 'light' ? 'feuch-day' : 'feuch-night'}`}><div className="feuch-protocol-backdrop" aria-hidden="true" /><div className={`feuch-protocol-content feuch-scene-transition ${closing ? 'feuch-scene-exit' : 'feuch-scene-enter'}`}>{node}</div></main>;
  if (protocol === 'dice') return frame(<FeuchDice onBack={home} />);
  if (protocol === 'walk') return frame(<div className="protocol-wrap"><button className="lab-home-fab" onClick={home}>⌂ LAB</button><App /></div>);
  if (protocol === 'silent') return frame(<SilentLink onBack={home} />);
  if (protocol === 'ghost') return frame(<GhostFrame onBack={home} />);
  if (protocol === 'predict' || protocol === 'feel') return frame(<InstantExperiment mode={protocol} onBack={home} />);
  if (protocol === 'stereo' || protocol === 'oculus' || protocol === 'hands') return frame(<TrainingLab kind={protocol} onBack={home} />);
  if (protocol === 'pineal') return frame(<Pineal onBack={home} />);
  if (protocol === 'zener' || protocol === 'stop' || protocol === 'flash' || protocol === 'marty') return frame(<QuickGames game={protocol} onBack={home} />);

  const renderCard = (card: Card) => <button key={card.protocol} className={`feuch-game-card feuch-art-${card.art}`} onClick={() => navigate(card.protocol)}>
    <span className="feuch-game-art" aria-hidden="true"><LabIcon name={card.protocol} /></span>
    <span className="feuch-game-copy"><small>{card.id}</small><strong>{card.title}</strong><span>{card.description[lang]}</span><em>{card.meta[lang]}</em></span>
    <span className="feuch-game-arrow" aria-hidden="true">↗</span>
  </button>;

  return <main className={`feuch-world ${theme === 'light' ? 'feuch-day' : 'feuch-night'} ${closing ? 'feuch-scene-exit' : 'feuch-scene-enter'}`}>
    <div className="feuch-ambient" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
    <LabPortal page={page} setPage={setPage} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} />
    {(page === 'home' || page === 'games') && <>
      <section className="feuch-hero" aria-labelledby="feuch-title">
        <div className="feuch-panorama" aria-hidden="true" /><div className="feuch-hero-veil" aria-hidden="true" />
        <div className="feuch-brand-lockup" aria-label="Feuch Institute Lab"><img src="/feuchlab/feuch-institute-emblem.svg" alt="" aria-hidden="true" /><span className="feuch-brand-wordmark">FEUCH<small>INSTITUTE LAB</small></span></div>
        <div className="feuch-hero-copy"><p className="feuch-eyebrow"><span />{t.eyebrow}</p><h1 id="feuch-title">{t.title}</h1><p>{t.subtitle}</p><a href="#feuch-experiences" className="feuch-primary-action">{t.enter}<span>↓</span></a></div>
        <div className="feuch-water-shimmer" aria-hidden="true" />
      </section>
      <section id="feuch-experiences" className="feuch-experiences feuch-scroll-reveal">
        <header className="feuch-section-heading"><div><small>◉ FEUCH INSTITUTE</small><h2>{t.games}</h2></div><span>{cards.length} {t.available}</span></header>
        <div className="feuch-game-grid">{cards.map(renderCard)}</div>
      </section>
      <button className="feuch-feature feuch-scroll-reveal" onClick={() => navigate('silent')}>
        <span className="feuch-feature-wave" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></span>
        <span><small>{t.featured}</small><strong>{t.featureTitle}</strong><em>{t.featureText}</em><b>● {t.local}</b></span><span className="feuch-feature-arrow">{t.open} →</span>
      </button>
      <section className="feuch-research feuch-scroll-reveal"><header className="feuch-section-heading"><div><small>✦ BLACKLACE RESEARCH</small><h2>{t.lab}</h2></div><span>{t.labHint}</span></header><div className="feuch-game-grid feuch-research-grid">{researchCards.map(renderCard)}</div></section>
    </>}
  </main>;
}
