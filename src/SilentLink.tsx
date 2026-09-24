import { useEffect, useMemo, useRef, useState } from 'react';
import { connectFeuchRoom, createFeuchRoom, exactBinomialTail, getFeuchRoomStatus, sendFeuch, type BinaryChoice, type FeuchRole } from './domain/feuch-link';

type EventPayload = Record<string, unknown> & { type?: string };
type Phase = 'lobby' | 'linked' | 'trial' | 'result' | 'complete';

const labelChoice = (value: BinaryChoice | null) => value === 'YES' ? 'OUI' : value === 'NO' ? 'NON' : '—';

export default function SilentLink({ onBack }: { onBack: () => void }) {
  const queryRoom = useMemo(() => new URLSearchParams(window.location.search).get('room')?.toUpperCase() ?? '', []);
  const [room, setRoom] = useState(queryRoom);
  const [joinCode, setJoinCode] = useState(queryRoom);
  const [role, setRole] = useState<FeuchRole | null>(null);
  const [connected, setConnected] = useState<FeuchRole[]>([]);
  const [phase, setPhase] = useState<Phase>('lobby');
  const [trial, setTrial] = useState(0);
  const [totalTrials, setTotalTrials] = useState(20);
  const [target, setTarget] = useState<BinaryChoice | null>(null);
  const [guess, setGuess] = useState<BinaryChoice | null>(null);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [message, setMessage] = useState('Deux téléphones. Aucun message libre. Un bit à la fois.');
  const [busy, setBusy] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  const paired = connected.includes('A') && connected.includes('B');
  const pValue = phase === 'complete' ? exactBinomialTail(score, totalTrials) : null;

  useEffect(() => () => socketRef.current?.close(1000, 'leaving'), []);
  useEffect(() => { if (!room || !role || phase !== 'linked') return; const poll = window.setInterval(() => { void refreshStatus(room); }, 2500); return () => window.clearInterval(poll); }, [room, role, phase]);

  async function refreshStatus(code = room) {
    if (!code) return;
    try {
      const status = await getFeuchRoomStatus(code);
      setConnected(status.connected ?? []);
    } catch { /* transient network issue */ }
  }

  function attach(code: string, nextRole: FeuchRole) {
    socketRef.current?.close(1000, 'switching');
    setConnected([]);
    const socket = connectFeuchRoom(code, nextRole);
    socketRef.current = socket;
    setRoom(code);
    setRole(nextRole);
    setMessage('Connexion au Feuch Link…');

    socket.addEventListener('open', () => {
      setPhase('linked');
      setMessage(nextRole === 'A' ? 'NODE A connecté. En attente du NODE B.' : 'NODE B connecté. En attente du protocole.');
      void refreshStatus(code);
    });
    socket.addEventListener('close', event => { if (socketRef.current !== socket) return; setConnected([]); setMessage(`Lien interrompu (${event.code}). Rechargez ou reconnectez les deux téléphones.`); });
    socket.addEventListener('error', () => setMessage('Erreur de liaison WebSocket.'));
    socket.addEventListener('message', event => {
      let data: EventPayload;
      try { data = JSON.parse(String(event.data)) as EventPayload; } catch { return; }
      const type = typeof data.type === 'string' ? data.type : '';
      if (type === 'participant.joined' || type === 'participant.left') { if (Array.isArray(data.connected)) setConnected(data.connected.filter((r): r is FeuchRole => r === 'A' || r === 'B')); else void refreshStatus(code); }
      if (type === 'session.started') {
        setTrial(0); setScore(0); setGuess(null); setTarget(null); setCorrect(null);
        if (typeof data.totalTrials === 'number') setTotalTrials(data.totalTrials);
      }
      if (type === 'session.snapshot') {
        if (typeof data.trial === 'number') setTrial(data.trial);
        if (typeof data.totalTrials === 'number') setTotalTrials(data.totalTrials);
        if (typeof data.score === 'number') setScore(data.score);
        if (nextRole === 'A' && (data.target === 'YES' || data.target === 'NO')) setTarget(data.target);
        if (data.completed === true) setPhase('complete');
        else if (data.active === true) setPhase('trial');
      }
      if (type === 'trial.started') {
        setPhase('trial'); setGuess(null); setCorrect(null);
        if (typeof data.trial === 'number') setTrial(data.trial);
        if (typeof data.totalTrials === 'number') setTotalTrials(data.totalTrials);
        setTarget(nextRole === 'A' && (data.target === 'YES' || data.target === 'NO') ? data.target : null);
        setMessage(nextRole === 'A' ? 'Transmettez uniquement la cible affichée.' : 'Concentrez-vous, puis choisissez OUI ou NON.');
      }
      if (type === 'trial.result') {
        setPhase('result');
        if (data.target === 'YES' || data.target === 'NO') setTarget(data.target);
        if (data.guess === 'YES' || data.guess === 'NO') setGuess(data.guess);
        if (typeof data.correct === 'boolean') setCorrect(data.correct);
        if (typeof data.score === 'number') setScore(data.score);
        setMessage('Résultat verrouillé côté serveur.');
      }
      if (type === 'session.completed') {
        if (typeof data.score === 'number') setScore(data.score);
        if (typeof data.totalTrials === 'number') setTotalTrials(data.totalTrials);
        setPhase('complete');
        setMessage('Session terminée. Le hasard a maintenant son mot à dire.');
      }
      if (type === 'error') setMessage(`Feuch Link: ${String(data.code ?? 'erreur')}`);
    });
  }

  async function createRoom() {
    setBusy(true);
    try {
      const code = await createFeuchRoom();
      setJoinCode(code);
      attach(code, 'A');
      window.history.replaceState(null, '', `${window.location.pathname}?room=${code}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Impossible de créer la salle.');
    } finally { setBusy(false); }
  }

  function joinRoom() {
    const code = joinCode.trim().toUpperCase();
    if (!/^[A-Z2-9]{6}$/.test(code)) { setMessage('Code invalide : 6 caractères.'); return; }
    attach(code, 'B');
    window.history.replaceState(null, '', `${window.location.pathname}?room=${code}`);
  }

  function startSession() {
    if (!paired) { setMessage('Il faut deux téléphones connectés.'); return; }
    if (!sendFeuch(socketRef.current, 'session.start', { totalTrials: 20 })) setMessage('Connexion non ouverte. Rechargez la salle sur les deux téléphones.');
  }

  function sendGuess(choice: BinaryChoice) {
    if (role !== 'B') return;
    setGuess(choice);
    sendFeuch(socketRef.current, 'trial.guess', { guess: choice });
  }

  function nextTrial() {
    if (role === 'A') sendFeuch(socketRef.current, 'trial.next');
  }

  const shareLink = room ? `${window.location.origin}${window.location.pathname}?room=${room}` : '';

  return <div className="silent-link-screen">
    <div className="silent-head">
      <button className="ghost" onClick={onBack}>← LABO</button>
      <div><p className="section-kicker">FLI-B2B-20 — SILENT LINK</p><h2>Oui / Non à distance</h2></div>
      <span className={paired ? 'link-pill live' : 'link-pill'}>{paired ? 'LINKED' : role ? `NODE ${role}` : 'OFFLINE'}</span>
    </div>

    {phase === 'lobby' && !role && <div className="silent-lobby">
      <div className="link-orbit"><span>A</span><i/><span>B</span></div>
      <p>{message}</p>
      <button className="primary big" disabled={busy} onClick={createRoom}>{busy ? 'CRÉATION…' : 'CRÉER UNE SESSION — NODE A'}</button>
      <div className="join-row"><input value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase().slice(0,6))} placeholder="CODE SALLE"/><button className="secondary" onClick={joinRoom}>REJOINDRE — NODE B</button></div>
      <small>Protocole expérimental : aucun échange vocal, texte, geste ou vibration entre les participants.</small>
    </div>}

    {role && phase === 'linked' && <div className="link-waiting">
      <div className="node-line"><b>NODE A {connected.includes('A') ? '●' : '○'}</b><i/><b>NODE B {connected.includes('B') ? '●' : '○'}</b></div>
      <div className="room-code"><span>ROOM</span><strong>{room}</strong></div>
      {role === 'A' && <><p>Faites ouvrir ce lien sur le deuxième téléphone :</p><code>{shareLink}</code><button className="primary big" disabled={!paired} onClick={startSession}>{paired ? 'LANCER 20 ESSAIS' : 'EN ATTENTE DU NODE B'}</button></>}
      {role === 'B' && <p>Vous êtes le récepteur. Le téléphone A lancera la session quand les deux nœuds seront liés.</p>}
      <small>{message}</small><small>Si les deux téléphones affichent « en attente », vérifiez qu’ils utilisent exactement le même code, puis rechargez les deux pages.</small>
    </div>}

    {role && phase === 'trial' && <div className="silent-trial">
      <div className="trial-count">ESSAI <strong>{trial}</strong><span>/ {totalTrials}</span></div>
      {role === 'A' ? <>
        <p className="transmission-label">CIBLE À TRANSMETTRE</p>
        <div className={`target-signal ${target === 'YES' ? 'yes' : 'no'}`}>{labelChoice(target)}</div>
        <p>Ne dites rien. N'envoyez aucun signal. Gardez seulement la cible en tête quelques secondes.</p>
      </> : <>
        <p className="transmission-label">RÉCEPTION</p>
        <div className="receiver-pulse"><i/><i/><i/></div>
        <p>Choisissez avant toute révélation.</p>
        <div className="choice-grid"><button disabled={guess!==null} onClick={()=>sendGuess('YES')}>OUI</button><button disabled={guess!==null} onClick={()=>sendGuess('NO')}>NON</button></div>
      </>}
      <div className="score-line">Score provisoire <strong>{score}</strong></div>
      <small>{message}</small>
    </div>}

    {role && phase === 'result' && <div className="silent-result">
      <p className="section-kicker">RÉSULTAT ESSAI {trial}</p>
      <div className={correct ? 'result-mark correct' : 'result-mark'}>{correct ? 'MATCH' : 'MISS'}</div>
      <div className="result-pair"><div><span>Cible</span><strong>{labelChoice(target)}</strong></div><div><span>Réponse</span><strong>{labelChoice(guess)}</strong></div></div>
      <p>Score : <strong>{score}/{trial}</strong></p>
      {role === 'A' ? <button className="primary big" onClick={nextTrial}>{trial >= totalTrials ? 'TERMINER LA SESSION' : 'ESSAI SUIVANT →'}</button> : <button className="secondary big" disabled>EN ATTENTE DU NODE A</button>}
      <small>{message}</small>
    </div>}

    {role && phase === 'complete' && <div className="silent-complete">
      <p className="section-kicker">SESSION CLOSE</p><h2>{score}/{totalTrials}</h2>
      <div className="chance-meter"><span>Probabilité d'obtenir au moins ce score par hasard</span><strong>{pValue == null ? '—' : `${(pValue*100).toFixed(pValue < .01 ? 3 : 1)}%`}</strong></div>
      <p>{pValue != null && pValue < .05 ? 'Résultat intéressant à reproduire avec le même protocole. Pas une preuve de télépathie.' : 'Résultat compatible avec le hasard. Une autre session peut servir de réplication.'}</p>
      <button className="primary big" onClick={()=>{ setPhase('linked'); setTrial(0); setScore(0); setTarget(null); setGuess(null); setCorrect(null); }}>REVENIR À LA SALLE</button>
    </div>}
  </div>;
}
