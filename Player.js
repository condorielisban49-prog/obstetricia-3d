'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

const WALK = 1.9; // m/s
const RUN = 4.6;  // m/s
const TURN = 2.6; // rad/s

// Personaje: modelo Mixamo (Xbot) con esqueleto, caminar/correr/idle reales,
// vestido con bata blanca, cabello recogido y estetoscopio sobre el hueso del cuello.
export default function Player({ start = [0, 0, 9], startYaw = Math.PI, keys, onState, bounds, joy, tp }) {
  const group = useRef();
  const { scene } = useThree();
  const attach = useRef({});
  const gltf = useGLTF('/models/Xbot.glb');
  const model = useMemo(() => {
    const m = SkeletonUtils.clone(gltf.scene);
    m.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = true;
      o.receiveShadow = true;
      o.material = o.material.clone();
      o.material.color.set('#ffffff');
      o.material.roughness = 0.5;
      // Colores por zona según la altura del cuerpo (en pose de referencia):
      // zapatos oscuros, pantalón de scrubs azul, bata blanca y piel en cuello y cabeza.
      o.material.onBeforeCompile = (sh) => {
        sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying float vY;')
          .replace('#include <begin_vertex>', '#include <begin_vertex>\nvY = position.y;');
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vY;')
          .replace('#include <color_fragment>', `#include <color_fragment>
            vec3 coat = vec3(0.96, 0.98, 0.99);
            vec3 scrubs = vec3(0.16, 0.36, 0.72);
            vec3 shoe = vec3(0.10, 0.11, 0.13);
            vec3 skin = vec3(0.88, 0.67, 0.55);
            vec3 base = coat;
            base = mix(base, scrubs, smoothstep(0.98, 0.92, vY));
            base = mix(base, shoe, smoothstep(0.12, 0.06, vY));
            base = mix(base, skin, smoothstep(1.50, 1.54, vY));
            diffuseColor.rgb = base;
          `);
      };
      o.material.needsUpdate = true;
    });
    return m;
  }, [gltf]);

  const mixer = useRef();
  const actions = useRef({});
  const cur = useRef(null);
  const state = useRef({ x: start[0], z: start[2], yaw: startYaw, speed: 0 });

  // accesorios: grupos en la escena que siguen la matriz del hueso correspondiente
  useEffect(() => {
    let head = null, neck = null;
    model.traverse((o) => {
      const n = o.name.replace(/\W/g, '');
      if (n === 'mixamorigHead') head = o;
      if (n === 'mixamorigNeck') neck = o;
    });
    const hairMat = new THREE.MeshStandardMaterial({ color: '#2b1a12', roughness: 0.42 });
    // El modelo Mixamo está en centímetros (escala de hueso 0.01): los accesorios se dibujan en metros y se escalan ×100 dentro del hueso.
    const accHead = new THREE.Group();
    const hi = new THREE.Group();
    hi.scale.setScalar(100);
    accHead.add(hi);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.165, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.6), hairMat);
    cap.position.set(0, 0.105, -0.015);
    cap.scale.set(1, 1.05, 1.1);
    cap.castShadow = true;
    hi.add(cap);
    const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.16, 6, 12), hairMat);
    tail.position.set(0, 0.1, -0.2);
    tail.rotation.x = 0.9;
    tail.castShadow = true;
    hi.add(tail);
    const accNeck = new THREE.Group();
    const ni = new THREE.Group();
    ni.scale.setScalar(100);
    accNeck.add(ni);
    const tube = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.011, 8, 48, Math.PI), new THREE.MeshStandardMaterial({ color: '#1d2b38', roughness: 0.35 }));
    tube.rotation.z = Math.PI;
    tube.position.set(0, -0.12, 0.05);
    ni.add(tube);
    scene.add(accHead, accNeck);
    attach.current = { head, neck, accHead, accNeck };
    return () => { scene.remove(accHead, accNeck); };
  }, [model, scene]);

  useEffect(() => {
    const m = new THREE.AnimationMixer(model);
    mixer.current = m;
    const acts = {};
    for (const clip of gltf.animations) {
      if (['idle', 'walk', 'run'].includes(clip.name)) acts[clip.name] = m.clipAction(clip);
    }
    actions.current = acts;
    cur.current = acts.idle;
    acts.idle?.play();
    return () => m.stopAllAction();
  }, [model, gltf]);

  function fade(name) {
    const next = actions.current[name];
    if (!next || next === cur.current) return;
    next.reset().setEffectiveWeight(1).fadeIn(0.25).play();
    cur.current?.fadeOut(0.25);
    cur.current = next;
  }

  useFrame((_, dt) => {
    const s = state.current;
    const k = keys.current;
    const d = Math.min(dt, 0.05);
    if (tp && tp.current) { s.x = tp.current.x; s.z = tp.current.z; s.yaw = tp.current.yaw; s.speed = 0; tp.current = null; }

    // giro con A/D (o joystick)
    let turn = (k.KeyA || k.ArrowLeft ? 1 : 0) - (k.KeyD || k.ArrowRight ? 1 : 0);
    turn += -joy.current.x;
    if (Math.abs(turn) > 0.01) s.yaw += Math.max(-1, Math.min(1, turn)) * TURN * d;

    // avance con W/S
    let move = (k.KeyW || k.ArrowUp ? 1 : 0) - (k.KeyS || k.ArrowDown ? 1 : 0);
    move += -joy.current.y;
    move = Math.max(-1, Math.min(1, move));
    const running = (k.ShiftLeft || k.ShiftRight) && Math.abs(move) > 0.1;
    const target = Math.abs(move) < 0.05 ? 0 : (running ? RUN : WALK) * Math.abs(move) * (move > 0 ? 1 : -1);
    s.speed += (target - s.speed) * Math.min(1, d * 8);

    if (Math.abs(s.speed) > 0.02) {
      const fx = Math.sin(s.yaw), fz = Math.cos(s.yaw); // el modelo mira en +Z con yaw 0
      s.x += fx * s.speed * d;
      s.z += fz * s.speed * d;
    }

    // límites del pasillo (sin atravesar paredes ni mostrador)
    s.x = Math.max(bounds.minX, Math.min(bounds.maxX, s.x));
    s.z = Math.max(bounds.minZ, Math.min(bounds.maxZ, s.z));

    group.current.position.set(s.x, 0, s.z);
    group.current.rotation.y = s.yaw;

    // animación según velocidad
    const abs = Math.abs(s.speed);
    if (abs < 0.15) fade('idle');
    else if (abs < 3.0) { fade('walk'); if (actions.current.walk) actions.current.walk.timeScale = Math.max(0.6, abs / WALK); }
    else { fade('run'); if (actions.current.run) actions.current.run.timeScale = Math.max(0.8, abs / RUN); }
    if (s.speed < -0.1 && actions.current.walk) { fade('walk'); actions.current.walk.timeScale = -0.9; }
    mixer.current?.update(d);
    const at = attach.current;
    if (at.head) { at.head.updateWorldMatrix(true, false); at.accHead.matrixAutoUpdate = false; at.accHead.matrix.copy(at.head.matrixWorld); at.accHead.matrixWorld.copy(at.head.matrixWorld); }
    if (at.neck) { at.neck.updateWorldMatrix(true, false); at.accNeck.matrixAutoUpdate = false; at.accNeck.matrix.copy(at.neck.matrixWorld); at.accNeck.matrixWorld.copy(at.neck.matrixWorld); }

    onState?.({ x: s.x, z: s.z, yaw: s.yaw, speed: abs, running: abs > 3.0 });
  });

  return (
    <group ref={group}>
      <primitive object={model} />
    </group>
  );
}

useGLTF.preload('/models/Xbot.glb');
