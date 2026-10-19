import { useState } from 'react';
import LabJourney from './LabJourney';

export type Page = 'home' | 'games' | 'lab' | 'explore' | 'profile';
export type Lang = 'fr' | 'en' | 'es';

const externalProjects = [
  { name: 'Creature-Sync', url: 'https://benoitlub.github.io/Creature-sync/', description: { fr: 'Écouter, analyser et comparer le vivant.', en: 'Listen to, analyse and compare living signals.', es: 'Escuchar, analizar y comparar lo vivo.' } },
  { name: 'SpecTRL', url: 'https://benoitlub.github.io/SpecTRL/', description: { fr: 'Explorer et analyser les signaux spectraux.', en: 'Explore and analyse spectral signals.', es: 'Explorar y analizar señales espectrales.' } },
  { name: 'Blacklace Dice', url: 'https://benoitlub.github.io/blacklace-dice/', description: { fr: 'Missions, personnages et défis.', en: 'Missions, characters and challenges.', es: 'Misiones, personajes y desafíos.' } },
  { name: '420 Dice Game', url: 'https://benoitlub.github.io/420-dice-game-reboot/', description: { fr: 'Trois dés et des gages à partager.', en: 'Three dice and shared challenges.', es: 'Tres dados y retos compartidos.' } },
  { name: 'Blacklace Echo', url: 'https://benoitlub.github.io/blacklace-echo/', description: { fr: 'L’île, ses signaux et ses histoires.', en: 'The island, its signals and stories.', es: 'La isla, sus señales e historias.' } },
];

const copy = {
  fr: { nav: ['Accueil', 'Jeux', 'Lab', 'Explorer', 'Profil'], lab: 'Le laboratoire', labIntro: 'Ton parcours et les observations enregistrées sur cet appareil.', journey: 'Parcours', archive: 'Journal local', explore: 'Explorer Blacklace', exploreIntro: 'Ces créations sont des applications indépendantes et vérifiées.', profile: 'Préférences', language: 'Langue', theme: 'Ambiance', day: 'Jour tropical', night: 'Nuit bioluminescente', about: 'À propos du Feuch Lab', aboutText: 'Un laboratoire ludique de perception, d’intuition et de hasard. Les scores sont des observations ludiques, pas des preuves ni un diagnostic.', close: 'Fermer' },
  en: { nav: ['Home', 'Games', 'Lab', 'Explore', 'Profile'], lab: 'The laboratory', labIntro: 'Your journey and observations saved on this device.', journey: 'Journey', archive: 'Local journal', explore: 'Explore Blacklace', exploreIntro: 'These verified creations open as independent applications.', profile: 'Preferences', language: 'Language', theme: 'Atmosphere', day: 'Tropical day', night: 'Bioluminescent night', about: 'About Feuch Lab', aboutText: 'A playful laboratory of perception, intuition and chance. Scores are observations for play, not evidence or a diagnosis.', close: 'Close' },
  es: { nav: ['Inicio', 'Juegos', 'Lab', 'Explorar', 'Perfil'], lab: 'El laboratorio', labIntro: 'Tu recorrido y las observaciones guardadas en este dispositivo.', journey: 'Recorrido', archive: 'Diario local', explore: 'Explorar Blacklace', exploreIntro: 'Estas creaciones verificadas se abren como aplicaciones independientes.', profile: 'Preferencias', language: 'Idioma', theme: 'Ambiente', day: 'Día tropical', night: 'Noche bioluminiscente', about: 'Acerca de Feuch Lab', aboutText: 'Un laboratorio lúdico de percepción, intuición y azar. Los resultados son observaciones de juego, no pruebas ni un diagnóstico.', close: 'Cerrar' },
} as const;

const pages: Page[] = ['home', 'games', 'lab', 'explore', 'profile'];
const navIcons = ['⌂', '◇', '⚗', '⌖', '♙'];

export default function LabPortal({ page, setPage, lang, setLang, theme, setTheme }: { page: Page; setPage: (page: Page) => void; lang: Lang; setLang: (lang: Lang) => void; theme: 'dark' | 'light'; setTheme: (theme: 'dark' | 'light') => void }) {
  const [infoOpen, setInfoOpen] = useState(false);
  const t = copy[lang];
  const changeLanguage = (next: Lang) => { setLang(next); localStorage.setItem('fli_lang', next); };
  const changeTheme = (next: 'dark' | 'light') => { setTheme(next); localStorage.setItem('fli_theme', next); };
  const selectPage = (next: Page) => { setPage(next); window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); };

  return <>
    <header className="feuch-topbar">
      <button className="feuch-menu-button" type="button" onClick={() => setInfoOpen(true)} aria-label={t.about}>☰</button>
      <button className="feuch-brand" type="button" onClick={() => selectPage('home')} aria-label={t.nav[0]}><span className="feuch-brand-mark">◉</span><strong>FEUCH<small>INSTITUTE LAB</small></strong></button>
      <div className="feuch-controls">
        <div className="feuch-language" role="group" aria-label={t.language}>{(['fr', 'en', 'es'] as const).map(option => <button type="button" key={option} className={lang === option ? 'active' : ''} aria-pressed={lang === option} onClick={() => changeLanguage(option)}>{option.toUpperCase()}</button>)}</div>
        <button className="feuch-theme" type="button" onClick={() => changeTheme(theme === 'light' ? 'dark' : 'light')} aria-label={theme === 'light' ? t.night : t.day}><span className={theme === 'light' ? 'active' : ''}>☀</span><span className={theme === 'dark' ? 'active' : ''}>☾</span></button>
      </div>
    </header>

    {page === 'lab' && <section className="feuch-panel feuch-panel-lab"><span className="feuch-panel-kicker">⚗ FEUCH RESEARCH</span><h1>{t.lab}</h1><p>{t.labIntro}</p><div className="feuch-panel-grid"><article><h2>{t.journey}</h2><LabJourney /></article><article><h2>{t.archive}</h2><LabJourney archive /></article></div></section>}
    {page === 'explore' && <section className="feuch-panel"><span className="feuch-panel-kicker">⌖ BLACKLACE ISLAND</span><h1>{t.explore}</h1><p>{t.exploreIntro}</p><div className="feuch-world-links">{externalProjects.map(project => <a href={project.url} target="_blank" rel="noopener noreferrer" key={project.name}><span className="feuch-link-orb">↗</span><strong>{project.name}</strong><small>{project.description[lang]}</small></a>)}</div></section>}
    {page === 'profile' && <section className="feuch-panel"><span className="feuch-panel-kicker">♙ FEUCH ID</span><h1>{t.profile}</h1><div className="feuch-preference"><div><strong>{t.language}</strong><small>FR · EN · ES</small></div><div className="feuch-choice">{(['fr', 'en', 'es'] as const).map(option => <button key={option} className={lang === option ? 'active' : ''} onClick={() => changeLanguage(option)}>{option.toUpperCase()}</button>)}</div></div><div className="feuch-preference"><div><strong>{t.theme}</strong><small>{theme === 'light' ? t.day : t.night}</small></div><div className="feuch-choice"><button className={theme === 'light' ? 'active' : ''} onClick={() => changeTheme('light')}>☀</button><button className={theme === 'dark' ? 'active' : ''} onClick={() => changeTheme('dark')}>☾</button></div></div><button className="feuch-about-button" onClick={() => setInfoOpen(true)}>ⓘ {t.about}</button></section>}

    <nav className="feuch-bottom-nav" aria-label="Feuch Lab">{pages.map((item, index) => <button type="button" key={item} className={page === item ? 'active' : ''} onClick={() => selectPage(item)}><span aria-hidden="true">{navIcons[index]}</span><small>{t.nav[index]}</small></button>)}</nav>

    {infoOpen && <div className="feuch-sheet-backdrop" onClick={() => setInfoOpen(false)}><section className="feuch-sheet" role="dialog" aria-modal="true" aria-labelledby="feuch-about-title" onClick={event => event.stopPropagation()}><button className="feuch-sheet-close" onClick={() => setInfoOpen(false)} aria-label={t.close}>×</button><div className="feuch-sheet-emblem">◉</div><small>BLACKLACE ISLAND</small><h2 id="feuch-about-title">{t.about}</h2><p>{t.aboutText}</p><a href="mailto:prohibitedvlc@gmail.com">prohibitedvlc@gmail.com ↗</a></section></div>}
  </>;
}
