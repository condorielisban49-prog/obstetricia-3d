'use client';
import dynamic from 'next/dynamic';

const Game = dynamic(() => import('../components/Game'), {
  ssr: false,
  loading: () => <div className="loading">Cargando hospital…</div>,
});

export default function Page() {
  return <Game />;
}
