'use client';
import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Cámara en tercera persona: se sitúa detrás del personaje y lo sigue suavemente.
export default function ThirdPersonCamera({ target, orbit }) {
  const { camera } = useThree();
  const cur = useRef(new THREE.Vector3(0, 3, 15));
  const look = useRef(new THREE.Vector3());
  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    const t = target.current;
    const yaw = t.yaw + orbit.current.yaw;
    const dist = 4.2 + orbit.current.zoom;
    const height = 1.9 + orbit.current.pitch;
    const want = new THREE.Vector3(
      t.x - Math.sin(yaw) * dist,
      height,
      t.z - Math.cos(yaw) * dist
    );
    cur.current.lerp(want, Math.min(1, d * 6));
    camera.position.copy(cur.current);
    look.current.lerp(new THREE.Vector3(t.x, 1.25, t.z), Math.min(1, d * 10));
    camera.lookAt(look.current);
  });
  return null;
}
