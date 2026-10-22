'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

// Personaje de apoyo basado en el modelo Mixamo (Xbot).
// Se usa para la paciente (vestido rosa) y para el bebé (modelo a escala reducida, marcado como placeholder).
export default function Character({ position, rotationY = 0, scale = 1, colors, anim = 'idle', hair = '#2b1a12' }) {
  const gltf = useGLTF('/models/Xbot.glb');
  const model = useMemo(() => {
    const m = SkeletonUtils.clone(gltf.scene);
    m.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = true;
      o.receiveShadow = true;
      o.material = o.material.clone();
      const isJoint = (o.material.name || '').includes('Joints');
      o.material.color.set(isJoint ? '#2a323c' : colors.body);
      o.material.roughness = 0.55;
    });
    return m;
  }, [gltf, colors]);

  const mixer = useRef(null);
  const actions = useRef({});
  useEffect(() => {
    const m = new THREE.AnimationMixer(model);
    mixer.current = m;
    const acts = {};
    for (const clip of gltf.animations) {
      if (['idle', 'agree', 'sad_pose', 'headShake'].includes(clip.name)) acts[clip.name] = m.clipAction(clip);
    }
    actions.current = acts;
    acts[anim]?.play();
    return () => m.stopAllAction();
  }, [model, gltf]);

  useEffect(() => {
    const next = actions.current[anim];
    if (!next) return;
    Object.values(actions.current).forEach((a) => a.fadeOut(0.3));
    next.reset().fadeIn(0.3).play();
  }, [anim]);

  useFrame((_, dt) => mixer.current?.update(Math.min(dt, 0.05)));

  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <primitive object={model} />
    </group>
  );
}

useGLTF.preload('/models/Xbot.glb');
