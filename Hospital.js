'use client';
import { useMemo } from 'react';
import * as THREE from 'three';
import { floorTexture, wallTexture, signTexture, posterTexture } from './textures';

// Pasillo principal: x en [-3, 3], z en [-32, 12]
export const CORRIDOR = { minX: -2.1, maxX: 2.1, minZ: -31, maxZ: 11 };

function Sign({ text, position, rotation = [0, 0, 0], color, width = 2.2 }) {
  const tex = useMemo(() => signTexture(text, color), [text, color]);
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, width * 0.3125]} />
      <meshStandardMaterial map={tex} roughness={0.6} />
    </mesh>
  );
}

function Plant({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.25, 0.7, 20]} />
        <meshStandardMaterial color="#e8eef2" roughness={0.4} />
      </mesh>
      {[0, 1.2, 2.4, 3.6, 4.8].map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 0.18, 1.0 + (i % 2) * 0.2, Math.sin(a) * 0.18]} rotation={[0.5, a, 0.2]} castShadow>
          <sphereGeometry args={[0.32, 12, 8]} />
          <meshStandardMaterial color={i % 2 ? '#2f9e5a' : '#3fb36b'} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Bench({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[(i - 1) * 1.1, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.0, 0.1, 0.6]} />
          <meshStandardMaterial color="#2a6fc4" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 0.25, -0.3]} castShadow>
        <boxGeometry args={[3.3, 0.5, 0.06]} />
        <meshStandardMaterial color="#9fb4c2" metalness={0.4} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.25, 0.3]} castShadow>
        <boxGeometry args={[3.3, 0.5, 0.06]} />
        <meshStandardMaterial color="#9fb4c2" metalness={0.4} roughness={0.35} />
      </mesh>
    </group>
  );
}

function Door({ position, rotation = [0, 0, 0], sign, signColor }) {
  const tex = useMemo(() => signTexture(sign, signColor), [sign, signColor]);
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[1.5, 2.2, 0.1]} />
        <meshStandardMaterial color="#7fa6bd" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[0, 1.95, 0.06]}>
        <planeGeometry args={[1.5, 0.3]} />
        <meshStandardMaterial map={tex} />
      </mesh>
      <mesh position={[0.0, 1.0, 0.07]}>
        <planeGeometry args={[0.9, 1.2]} />
        <meshStandardMaterial color="#bfe3f4" transparent opacity={0.45} roughness={0.1} />
      </mesh>
    </group>
  );
}

function EcoRoomInterior({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* camilla de ecografía */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.2, 0.9]} />
        <meshStandardMaterial color="#e9f2f7" roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.8, 0.6, 0.8]} />
        <meshStandardMaterial color="#b8c9d4" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* equipo de ecografía */}
      <mesh position={[1.2, 0.9, -0.9]} castShadow>
        <boxGeometry args={[0.9, 1.1, 0.7]} />
        <meshStandardMaterial color="#dfe8ee" roughness={0.4} />
      </mesh>
      <mesh position={[1.2, 1.8, -0.9]} rotation={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.9, 0.6, 0.06]} />
        <meshStandardMaterial color="#0b1a2a" emissive="#1d6fa0" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

export default function Hospital() {
  const floorTex = useMemo(floorTexture, []);
  const wallTex = useMemo(wallTexture, []);
  const posterA = useMemo(() => posterTexture('Lavado de manos', 'Protege a tu paciente'), []);
  const posterB = useMemo(() => posterTexture('Lactancia', 'La leche materna es vida'), []);
  const lights = [];
  for (let z = -28; z <= 8; z += 4) lights.push(z);

  return (
    <group>
      {/* piso */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -10]} receiveShadow>
        <planeGeometry args={[6, 44]} />
        <meshStandardMaterial map={floorTex} roughness={0.22} metalness={0.05} />
      </mesh>
      {/* techo */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.6, -10]}>
        <planeGeometry args={[6, 44]} />
        <meshStandardMaterial color="#f7fbfd" roughness={0.9} />
      </mesh>
      {/* paredes laterales */}
      <mesh position={[-3, 1.8, -10]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[44, 3.6]} />
        <meshStandardMaterial map={wallTex} roughness={0.7} />
      </mesh>
      <mesh position={[3, 1.8, -10]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[44, 3.6]} />
        <meshStandardMaterial map={wallTex} roughness={0.7} />
      </mesh>
      {/* fondo y entrada */}
      <mesh position={[0, 1.8, -32]} rotation={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 3.6]} />
        <meshStandardMaterial map={wallTex} roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.8, 12]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[6, 3.6]} />
        <meshStandardMaterial color="#e6f1f7" roughness={0.6} />
      </mesh>

      {/* luminarias del techo */}
      {lights.map((z) => (
        <group key={z} position={[0, 3.55, z]}>
          <mesh>
            <boxGeometry args={[1.2, 0.05, 0.5]} />
            <meshStandardMaterial color="#ffffff" emissive="#fff8ea" emissiveIntensity={1.4} />
          </mesh>
          <pointLight intensity={6} distance={9} color="#fff3dc" decay={2} />
        </group>
      ))}

      {/* letreros de dirección sobre el pasillo */}
      <Sign text="Sala de Partos →" position={[-2.95, 2.9, -18]} rotation={[0, Math.PI / 2, 0]} color="#c2185b" width={2.0} />
      <Sign text="← Ecografía" position={[2.95, 2.9, -6]} rotation={[0, -Math.PI / 2, 0]} color="#1d4fa0" width={2.0} />
      <Sign text="Hospitalización →" position={[-2.95, 2.9, -4]} rotation={[0, Math.PI / 2, 0]} color="#1d6e9e" width={2.0} />

      {/* puertas */}
      <Door position={[-2.94, 0, -18]} rotation={[0, Math.PI / 2, 0]} sign="SALA DE PARTOS" signColor="#c2185b" />
      <Door position={[2.94, 0, -6]} rotation={[0, -Math.PI / 2, 0]} sign="ECOGRAFÍA" signColor="#1d4fa0" />
      <Door position={[2.94, 0, -16]} rotation={[0, -Math.PI / 2, 0]} sign="CONSULTORIO 2" signColor="#1d6e9e" />
      <Door position={[-2.94, 0, -8]} rotation={[0, Math.PI / 2, 0]} sign="LACTANCIA" signColor="#2e7d5b" />

      {/* sala de ecografía (interior visible tras la puerta) */}
      <EcoRoomInterior position={[2.6, 0, -6]} rotation={[0, -Math.PI / 2, 0]} />

      {/* sillas de espera */}
      <Bench position={[2.3, 0, 2]} rotation={[0, -Math.PI / 2, 0]} />
      <Bench position={[-2.3, 0, 4]} rotation={[0, Math.PI / 2, 0]} />
      <Bench position={[-2.3, 0, 8]} rotation={[0, Math.PI / 2, 0]} />

      {/* plantas decorativas */}
      <Plant position={[-2.4, 0, 0]} />
      <Plant position={[2.4, 0, 10]} />
      <Plant position={[-2.4, 0, -28]} />

      {/* mostrador de recepción */}
      <group position={[0, 0, -26]}>
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 1, 1]} />
          <meshStandardMaterial color="#3d7fbf" roughness={0.45} />
        </mesh>
        <mesh position={[0, 1.04, 0]} castShadow>
          <boxGeometry args={[3.4, 0.08, 1.2]} />
          <meshStandardMaterial color="#f4f8fa" roughness={0.2} metalness={0.1} />
        </mesh>
        <mesh position={[-0.6, 1.3, 0.1]} castShadow>
          <boxGeometry args={[0.7, 0.45, 0.05]} />
          <meshStandardMaterial color="#0b1a2a" emissive="#2a8fd6" emissiveIntensity={0.7} />
        </mesh>
      </group>

      {/* carteles de pared */}
      <mesh position={[-2.99, 1.9, -22]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.8, 1.2]} />
        <meshStandardMaterial map={posterA} />
      </mesh>
      <mesh position={[2.99, 1.9, -12]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.8, 1.2]} />
        <meshStandardMaterial map={posterB} />
      </mesh>
    </group>
  );
}
