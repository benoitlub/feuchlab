import React from 'react';
import ReactDOM from 'react-dom/client';
import LabRoot from './LabRoot';
import './styles.css';
import './app-shell.css';
import './octopus.css';
import './silent-link.css';
import './ghost-frame.css';
import './instant.css';
import './training.css';
import './pineal.css';
import './quick-games.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><LabRoot /></React.StrictMode>,
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/feuchlab/sw.js').catch(() => { /* offline support is optional */ });
  });
}
