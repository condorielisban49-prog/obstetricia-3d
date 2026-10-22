import * as THREE from 'three';

function canvasTex(w, h, draw, repeat = [1, 1]) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  return t;
}

// Piso de baldosas claras con juntas y ligero desgaste
export function floorTexture() {
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#dfe9ef';
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      const shade = 230 + ((i + j) % 2) * 8;
      g.fillStyle = `rgb(${shade},${shade + 6},${shade + 10})`;
      g.fillRect(i * 256 + 3, j * 256 + 3, 250, 250);
    }
    g.strokeStyle = 'rgba(120,140,155,0.5)';
    g.lineWidth = 3;
    g.strokeRect(0, 0, w, h);
    for (let k = 0; k < 900; k++) {
      g.fillStyle = `rgba(90,110,120,${Math.random() * 0.05})`;
      g.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
  }, [4, 20]);
}

// Pared: parte superior blanca y zócalo azul del hospital
export function wallTexture() {
  return canvasTex(512, 512, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, '#f5fbff');
    grd.addColorStop(0.6, '#eaf3f8');
    grd.addColorStop(1, '#cfe0ea');
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#2a7fd6';
    g.fillRect(0, h * 0.72, w, h * 0.05);
    g.fillStyle = '#1d4fa0';
    g.fillRect(0, h * 0.77, w, h * 0.23);
  }, [6, 1]);
}

// Letrero con texto en español (como en la imagen de referencia)
export function signTexture(text, color = '#1d4fa0') {
  return canvasTex(512, 160, (g, w, h) => {
    g.fillStyle = color;
    g.beginPath();
    g.roundRect(8, 8, w - 16, h - 16, 18);
    g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.8)';
    g.lineWidth = 6;
    g.stroke();
    g.fillStyle = '#ffffff';
    g.font = 'bold 64px "Segoe UI", Arial, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(text, w / 2, h / 2 + 4);
  });
}

// Cartel de pared con tipografía de referencia
export function posterTexture(title, sub) {
  return canvasTex(256, 384, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, '#7fd1ff');
    grd.addColorStop(1, '#2a7fd6');
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.9)';
    g.beginPath(); g.arc(w / 2, 150, 60, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#1d4fa0';
    g.font = 'bold 26px Arial';
    g.textAlign = 'center';
    g.fillText(title, w / 2, 290);
    g.font = '18px Arial';
    g.fillText(sub, w / 2, 326);
  });
}
