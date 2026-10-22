'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import Hospital, { CORRIDOR } from './Hospital';
import Player from './Player';
import Character from './Characters';
import ThirdPersonCamera from './ThirdPersonCamera';
import { PROC, SPAWN } from './Procedures';

const PATIENT = { x: 1.2, z: -4 };
const ROOM = { x: 2.0, z: -6 };
const NEAR = 2.0;

const STEPS = [
  {
    text: 'Acércate a la paciente y pulsa E para saludarla',
    near: PATIENT,
    dialog: [
      ['Paciente', 'Buenos días… me siento un poco cansada, pero mi bebé se mueve bien.'],
      ['Tú', 'Hola, soy la obstetra de turno. Vamos a revisar cómo se siente.'],
    ],
  },
  {
    text: 'Pregunta a la paciente por sus síntomas (E)',
    near: PATIENT,
    dialog: [
      ['Paciente', 'Tengo algo de dolor de espalda, pero nada fuerte. ¿Es normal?'],
      ['Tú', 'Es común en el embarazo. Si sientes sangrado o dolor de cabeza fuerte, avísame de inmediato.'],
    ],
  },
  { text: 'Dirígete a la sala de ecografía', room: ROOM, dialog: null },
];

const LEVEL_NAMES = { 1: 'Nivel 1 · Recorrido', 2: PROC[2].title, 3: PROC[3].title };

function Markers({ markers }) {
  return (
    <>
      {markers.map((m, i) => {
        const color = m.state === 'done' ? '#3ddc84' : m.state === 'active' ? '#ffd35a' : '#7de3d6';
        return (
          <group key={i} position={[m.x, 0.04, m.z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.32, m.state === 'active' ? 0.5 : 0.42, 40]} />
              <meshBasicMaterial color={color} transparent opacity={m.state === 'todo' ? 0.35 : 0.85} />
            </mesh>
            <mesh position={[0, 1.4, 0]}>
              <sphereGeometry args={[0.07, 12, 8]} />
              <meshBasicMaterial color={color} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

function Scene({ keys, orbit, playerState, onState, joy, markers, tp }) {
  const bounds = useMemo(() => ({ minX: CORRIDOR.minX, maxX: CORRIDOR.maxX, minZ: CORRIDOR.minZ, maxZ: CORRIDOR.maxZ }), []);
  return (
    <>
      <color attach="background" args={['#bfd8e6']} />
      <fog attach="fog" args={['#bfd8e6', 22, 48]} />
      <hemisphereLight args={['#ffffff', '#6f8594', 0.7]} />
      <directionalLight
        position={[-8, 12, 6]} intensity={0.9} color="#fff4e0" castShadow
        shadow-mapSize={[2048, 2048]} shadow-camera-left={-10} shadow-camera-right={10}
        shadow-camera-top={20} shadow-camera-bottom={-30} shadow-camera-far={60} shadow-bias={-0.0004}
      />
      <Hospital />
      <Character position={[PATIENT.x, 0, PATIENT.z]} rotationY={0} colors={{ body: '#e7a6c0' }} anim="idle" />
      <Character position={[PATIENT.x + 0.9, 0, PATIENT.z + 0.4]} rotationY={-0.6} scale={0.5} colors={{ body: '#cfe9f5' }} anim="sad_pose" />
      <Markers markers={markers} />
      <Player start={[0, 0, 9]} startYaw={Math.PI} keys={keys} joy={joy} bounds={bounds} onState={onState} tp={tp} />
      <ThirdPersonCamera target={playerState} orbit={orbit} />
    </>
  );
}

export default function Game() {
  const keys = useRef({});
  const joy = useRef({ x: 0, y: 0 });
  const orbit = useRef({ yaw: 0, pitch: 0, zoom: 0 });
  const playerState = useRef({ x: 0, z: 9, yaw: Math.PI, speed: 0 });
  const tp = useRef(null);
  const levelRef = useRef(1);
  const stepRef = useRef(0);
  const tapRef = useRef(0);
  const dialogRef = useRef(null);
  const toastT = useRef(null);
  const dragging = useRef(null);
  const frameCount = useRef(0);

  const [hud, setHud] = useState({ speed: 0, running: false, x: 0, z: 9 });
  const [level, setLevel] = useState(1);
  const [step, setStep] = useState(0);
  const [taps, setTaps] = useState(0);
  const [dialog, setDialog] = useState(null);
  const [typed, setTyped] = useState('');
  const [showTutorial, setShowTutorial] = useState(true);
  const [finished, setFinished] = useState(false);
  const [prompt, setPrompt] = useState(null);
  const [toast, setToast] = useState(null);
  const [touch, setTouch] = useState(false);
  const joyBase = useRef(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    setTouch(mq.matches);
    const onChange = () => setTouch(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  function flash(msg) {
    setToast(msg);
    clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToast(null), 2600);
  }

  function near(target, r = NEAR) {
    const p = playerState.current;
    return Math.hypot(p.x - target.x, p.z - target.z) < r;
  }

  function startLevel(n) {
    levelRef.current = n;
    stepRef.current = 0;
    tapRef.current = 0;
    dialogRef.current = null;
    setDialog(null);
    setLevel(n);
    setStep(0);
    setTaps(0);
    setFinished(false);
    if (n === 1) {
      tp.current = { x: 0, z: 9, yaw: Math.PI };
    } else {
      tp.current = { x: SPAWN.x, z: SPAWN.z, yaw: SPAWN.yaw };
      flash(PROC[n].intro);
    }
  }

  function openDialog(lines) {
    dialogRef.current = { lines, i: 0 };
    setDialog({ lines, i: 0 });
    setTyped('');
  }

  function nextLine() {
    const d = dialogRef.current;
    if (!d) return;
    if (d.i + 1 < d.lines.length) {
      d.i += 1;
      setDialog({ lines: d.lines, i: d.i });
      setTyped('');
    } else {
      dialogRef.current = null;
      setDialog(null);
      advanceLevel1();
    }
  }

  function advanceLevel1() {
    const next = stepRef.current + 1;
    stepRef.current = next;
    setStep(next);
    if (next >= STEPS.length) setFinished(true);
  }

  function interact() {
    if (dialogRef.current) { nextLine(); return; }
    const lv = levelRef.current;
    if (lv === 1) {
      const st = STEPS[stepRef.current];
      if (st && st.dialog && near(st.near)) openDialog(st.dialog);
      return;
    }
    const proc = PROC[lv];
    const idx = stepRef.current;
    const st = proc.steps[idx];
    if (!st) return;
    if (near(st.at, 1.0)) {
      tapRef.current += 1;
      setTaps(tapRef.current);
      if (tapRef.current >= st.taps) {
        tapRef.current = 0;
        setTaps(0);
        const n = idx + 1;
        stepRef.current = n;
        setStep(n);
        flash('✔ ' + st.ok);
        if (n >= proc.steps.length) {
          setFinished(true);
          flash('🎓 Nivel completado');
        }
      }
    } else {
      const other = proc.steps.find((s) => near(s.at, 1.0));
      if (other) flash(`Ese paso no es el siguiente. Primero: ${st.text}`);
    }
  }

  useEffect(() => {
    const down = (e) => {
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'ShiftRight', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
      keys.current[e.code] = true;
      if (e.code === 'KeyC') orbit.current = { yaw: 0, pitch: 0, zoom: 0 };
      if (e.code === 'KeyE' && !e.repeat) interact();
    };
    const up = (e) => { keys.current[e.code] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  // escritura del diálogo
  useEffect(() => {
    if (!dialog) return;
    const full = dialog.lines[dialog.i][1];
    let k = 0;
    const id = setInterval(() => {
      k += 1;
      setTyped(full.slice(0, k));
      if (k >= full.length) clearInterval(id);
    }, 28);
    return () => clearInterval(id);
  }, [dialog]);

  function joyStart(e) {
    e.currentTarget.setPointerCapture(e.pointerId);
    const r = e.currentTarget.getBoundingClientRect();
    joyBase.current = { cx: r.left + r.width / 2, cy: r.top + r.height / 2, R: r.width / 2 };
    joyMove(e);
  }
  function joyMove(e) {
    const b = joyBase.current;
    if (!b) return;
    let dx = (e.clientX - b.cx) / b.R;
    let dy = (e.clientY - b.cy) / b.R;
    const m = Math.hypot(dx, dy);
    if (m > 1) { dx /= m; dy /= m; }
    joy.current = { x: dx, y: dy };
    setKnob({ x: dx, y: dy });
  }
  function joyEnd() {
    joyBase.current = null;
    joy.current = { x: 0, y: 0 };
    setKnob({ x: 0, y: 0 });
  }
  function actionDown(e) { e.preventDefault(); interact(); }

  const onDown = (e) => { dragging.current = { x: e.clientX, y: e.clientY }; };
  const onMove = (e) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragging.current.x;
    const dy = e.clientY - dragging.current.y;
    dragging.current = { x: e.clientX, y: e.clientY };
    orbit.current.yaw = Math.max(-2.2, Math.min(2.2, orbit.current.yaw - dx * 0.006));
    orbit.current.pitch = Math.max(-0.9, Math.min(1.2, orbit.current.pitch + dy * 0.008));
  };
  const onUp = () => { dragging.current = null; };

  const onState = (st) => {
    playerState.current = st;
    frameCount.current++;
    if (frameCount.current % 6 !== 0) return;
    setHud({ speed: st.speed, running: st.running, x: st.x, z: st.z });
    const lv = levelRef.current;
    if (lv === 1) {
      const s = STEPS[stepRef.current];
      if (!s) return;
      if (s.room && !dialogRef.current && near(s.room)) advanceLevel1();
      setPrompt(s.near && !dialogRef.current && s.dialog && near(s.near) ? 'Pulsa E para hablar' : null);
    } else {
      const st2 = PROC[lv].steps[stepRef.current];
      setPrompt(st2 && near(st2.at, 1.0) ? `Pulsa E · ${st2.text}` : null);
    }
  };

  const markers = useMemo(() => {
    if (level === 1) return [];
    return PROC[level].steps.map((s, i) => ({ x: s.at.x, z: s.at.z, state: i < step ? 'done' : i === step ? 'active' : 'todo' }));
  }, [level, step]);

  const dist = Math.hypot(hud.x - ROOM.x, hud.z - ROOM.z);
  const isProc = level > 1;
  const curText = isProc ? (PROC[level].steps[step] ? PROC[level].steps[step].text : '') : STEPS[Math.min(step, STEPS.length - 1)].text;
  const totalSteps = isProc ? PROC[level].steps.length : STEPS.length;

  return (
    <>
      <div className="rotate-tip"><b>📱↻</b><div>Gira tu celular en horizontal para jugar</div></div>
      <div className="stage" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
        <Canvas
          shadows dpr={touch ? 1 : 1.5}
          camera={{ fov: 58, near: 0.1, far: 120, position: [0, 3, 15] }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
          onCreated={({ gl }) => { gl.outputColorSpace = THREE.SRGBColorSpace; }}
        >
          <Scene keys={keys} orbit={orbit} playerState={playerState} onState={onState} joy={joy} markers={markers} tp={tp} />
        </Canvas>
      </div>

      <div className="hud">
        {touch && (
          <>
            <div className="joyzone" onPointerDown={joyStart} onPointerMove={joyMove} onPointerUp={joyEnd} onPointerCancel={joyEnd}>
              <div className="joybase"><div className="joyknob" style={{ transform: `translate(${knob.x * 40}%, ${knob.y * 40}%)` }} /></div>
            </div>
            <button className="actbtn" onPointerDown={actionDown}>E<span>Acción</span></button>
          </>
        )}

        <div className="panel hud-tl">
          <div style={{ fontWeight: 800, fontSize: 15 }}>👩‍⚕️ Obst. Ana</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 3 }}>{LEVEL_NAMES[level]}</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>
            {hud.speed < 0.15 ? 'En reposo' : hud.running ? 'Corriendo' : 'Caminando'}
          </div>
        </div>

        <div className="panel hud-tr">
          <div style={{ color: '#ffd35a', fontWeight: 800, fontSize: 14 }}>Paso {Math.min(step + 1, totalSteps)} de {totalSteps}</div>
          <div style={{ fontSize: 15, marginTop: 4 }}>{finished ? '✅ Completado' : curText}</div>
          {isProc && !finished && PROC[level].steps[step] && (
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>Pulsaciones: {taps}/{PROC[level].steps[step].taps}</div>
          )}
          {level === 1 && !finished && STEPS[step] && STEPS[step].room && (
            <div style={{ fontSize: 13, opacity: 0.8, marginTop: 6 }}>Distancia: {dist.toFixed(1)} m</div>
          )}
        </div>

        {toast && (
          <div className="panel" style={{ position: 'absolute', top: '16%', left: '50%', transform: 'translateX(-50%)', padding: '8px 16px', fontWeight: 700, maxWidth: '86vw', textAlign: 'center' }}>{toast}</div>
        )}

        {prompt && !dialog && (
          <div className="panel hud-prompt">
            <span className="key">E</span>{prompt}
          </div>
        )}

        {dialog && (
          <div className="panel hud-dialog">
            <div style={{ color: '#7de3d6', fontWeight: 800, fontSize: 14 }}>{dialog.lines[dialog.i][0]}</div>
            <div style={{ fontSize: 18, marginTop: 6, minHeight: 50, lineHeight: 1.4 }}>{typed}</div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6, textAlign: 'right' }}>
              {typed.length >= dialog.lines[dialog.i][1].length ? 'Pulsa E para continuar' : '…'}
            </div>
          </div>
        )}

        {finished && (
          <div className="panel hud-end" style={{ pointerEvents: 'auto' }}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>
              {level === 3 ? '¡Práctica completa!' : level === 2 ? '¡Parto atendido con éxito!' : '¡Muy bien, obstetra!'}
            </div>
            <div style={{ opacity: 0.85, marginTop: 6, marginBottom: 12 }}>
              {level === 1 ? 'Terminaste el recorrido. Sigue con la atención del parto.' : level === 2 ? 'Siguiente: reanimación neonatal.' : 'Repasa el algoritmo cuando quieras.'}
            </div>
            <div className="row" style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {level < 3 && <button className="btn" onClick={() => startLevel(level + 1)}>Siguiente nivel ▶</button>}
              <button className="btn" onClick={() => startLevel(level)} style={{ background: 'linear-gradient(135deg,#17a99b,#1f6fb5)' }}>🔁 Repetir</button>
            </div>
          </div>
        )}

        <div className="panel keyhelp">
          <div><span className="key">W</span>Avanzar · <span className="key">S</span>Retroceder</div>
          <div><span className="key">A</span>Girar izq. · <span className="key">D</span>Girar der.</div>
          <div><span className="key">Shift</span>Correr · <span className="key">C</span>Centrar cámara</div>
          <div><span className="key">E</span>Hablar / realizar paso</div>
        </div>
      </div>

      {showTutorial && (
        <div className="loading" style={{ background: 'rgba(5, 14, 26, 0.72)', zIndex: 10 }}>
          <div className="panel" style={{ padding: '28px 32px', maxWidth: 540, textAlign: 'center' }}>
            <h2 style={{ fontSize: 26, marginBottom: 10 }}>Bienvenida, obstetra</h2>
            <p style={{ lineHeight: 1.6, opacity: 0.92, marginBottom: 16 }}>
              Nivel 1: camina hasta la paciente y pulsa <span className="key">E</span> para hablar con ella, luego ve a la sala de ecografía.
              Después vienen los niveles de <b>atención del parto</b> y <b>reanimación neonatal</b>: ve a cada punto marcado en el piso y pulsa <span className="key">E</span> en el orden correcto.
              {touch ? ' Usa el joystick para moverte y el botón E para actuar.' : ' Usa W A S D para moverte.'}
            </p>
            <button className="btn" onClick={() => setShowTutorial(false)}>Comenzar</button>
          </div>
        </div>
      )}
    </>
  );
}
