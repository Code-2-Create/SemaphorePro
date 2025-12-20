import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import torsoImage from './torso.png';

type SemaphorePosition = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface SignalmanProps {
  leftPos: SemaphorePosition;
  rightPos: SemaphorePosition;
  leftAngleDeg?: number;
  rightAngleDeg?: number;
  size?: number;
  className?: string;
  animate?: boolean;
  torsoImageUrl?: string;
}

/* -------------------- 3D FLAG CONFIG -------------------- */
const CLOTH_X = 12;
const CLOTH_Y = 16;
const SEG = 0.0125;
const GRAVITY = new THREE.Vector3(0, -25, 0);
const POLE_START = 0.55;
const POLE_END = 0.8;

/* -------------------- 3D PHYSICS FLAG -------------------- */
const PhysicsFlag: React.FC<{
  angle: number;
  side: 'left' | 'right';
  animate: boolean;
  svgSize: number;
}> = ({ angle, side, animate, svgSize }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const angleRef = useRef(angle);
  const prevAngleRef = useRef(angle);

  const particles = useMemo(() => {
    const arr: any[] = [];
    for (let y = 0; y < CLOTH_Y; y++) {
      for (let x = 0; x < CLOTH_X; x++) {
        const pos = new THREE.Vector3(x * SEG, -y * SEG, 0);
        arr.push({
          pos: pos.clone(),
          old: pos.clone(),
          pinned: x === 0,
          xIndex: x,
          yIndex: y,
        });
      }
    }
    return arr;
  }, []);

  const texture = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d')!;
    
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, 0, 256, 256);
    
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(256, 0);
    ctx.lineTo(256, 256);
    ctx.lineTo(0, 256);
    ctx.closePath();
    ctx.fill();
    
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }, []);

  useEffect(() => {
    if (!animate) {
      angleRef.current = angle;
      return;
    }

    const startAngle = angleRef.current;
    const targetAngle = angle;
    const startTime = performance.now();
    const duration = 300;
    
    let rafId: number;

    const animateAngle = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      angleRef.current = startAngle + (targetAngle - startAngle) * easeProgress;
      
      if (progress < 1) {
        rafId = requestAnimationFrame(animateAngle);
      }
    };

    rafId = requestAnimationFrame(animateAngle);
    
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [angle, animate]);

  const constrain = (p1: any, p2: any, d: number) => {
    const diff = new THREE.Vector3().subVectors(p2.pos, p1.pos);
    const len = diff.length();
    if (len === 0) return;
    const corr = diff.multiplyScalar((1 - d / len) * 0.5);
    if (!p1.pinned) p1.pos.add(corr);
    if (!p2.pinned) p2.pos.sub(corr);
  };

  useFrame((_, dt) => {
    if (!meshRef.current) return;
    
    const clampedDt = Math.min(dt, 0.016);
    const currentAngle = angleRef.current;
    const angleChange = Math.abs(currentAngle - prevAngleRef.current);
    prevAngleRef.current = currentAngle;

    const rad = THREE.MathUtils.degToRad(currentAngle);
    
    const poleStartX = Math.cos(rad) * POLE_START;
    const poleStartY = Math.sin(rad) * POLE_START;
    const poleEndX = Math.cos(rad) * POLE_END;
    const poleEndY = Math.sin(rad) * POLE_END;

    particles.forEach((p, i) => {
      if (p.pinned) {
        const yIndex = Math.floor(i / CLOTH_X);
        const t = yIndex / (CLOTH_Y - 1);
        const poleX = poleStartX + (poleEndX - poleStartX) * t;
        const poleY = poleStartY + (poleEndY - poleStartY) * t;
        
        p.pos.set(poleX, poleY, 0);
        p.old.copy(p.pos);
        return;
      }

      if (!animate) return;

      const vel = p.pos.clone().sub(p.old).multiplyScalar(0.98);
      p.old.copy(p.pos);
      p.pos.add(vel);
      
      p.pos.y += GRAVITY.y * clampedDt * clampedDt;

      if (angleChange > 5) {
        const swingForce = angleChange * 0.0001;
        const xMultiplier = side === 'right' ? 1 : -1;
        p.pos.x += Math.cos(rad + Math.PI / 2) * swingForce * xMultiplier;
        p.pos.y += Math.sin(rad + Math.PI / 2) * swingForce;
      }

      const distFromCenter = Math.sqrt(p.pos.x * p.pos.x + p.pos.y * p.pos.y);
      const maxRadius = POLE_END + (CLOTH_X * SEG);
      if (distFromCenter > maxRadius) {
        const scale = maxRadius / distFromCenter;
        p.pos.x *= scale;
        p.pos.y *= scale;
      }

      p.pos.z = 0;
    });

    const iterations = animate ? 8 : 1;
    for (let k = 0; k < iterations; k++) {
      for (let y = 0; y < CLOTH_Y; y++) {
        for (let x = 0; x < CLOTH_X; x++) {
          const i = y * CLOTH_X + x;
          if (x < CLOTH_X - 1)
            constrain(particles[i], particles[i + 1], SEG);
          if (y < CLOTH_Y - 1)
            constrain(particles[i], particles[i + CLOTH_X], SEG);
          if (x < CLOTH_X - 1 && y < CLOTH_Y - 1) {
            constrain(particles[i], particles[i + CLOTH_X + 1], SEG * 1.414);
            constrain(particles[i + 1], particles[i + CLOTH_X], SEG * 1.414);
          }
        }
      }
    }

    const pos = meshRef.current.geometry.attributes.position.array as Float32Array;
    particles.forEach((p, i) => {
      pos[i * 3] = p.pos.x;
      pos[i * 3 + 1] = p.pos.y;
      pos[i * 3 + 2] = p.pos.z;
    });

    meshRef.current.geometry.attributes.position.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
  });

  const initialGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(
      (CLOTH_X - 1) * SEG,
      (CLOTH_Y - 1) * SEG,
      CLOTH_X - 1,
      CLOTH_Y - 1
    );
    
    const pos = geo.attributes.position.array as Float32Array;
    for (let y = 0; y < CLOTH_Y; y++) {
      for (let x = 0; x < CLOTH_X; x++) {
        const i = y * CLOTH_X + x;
        pos[i * 3] = x * SEG;
        pos[i * 3 + 1] = -y * SEG;
        pos[i * 3 + 2] = 0;
      }
    }
    geo.attributes.position.needsUpdate = true;
    
    return geo;
  }, []);

  return (
    <mesh ref={meshRef} geometry={initialGeometry}>
      <meshStandardMaterial
        map={texture}
        side={THREE.DoubleSide}
        roughness={0.7}
      />
    </mesh>
  );
};

/* -------------------- MAIN COMPONENT -------------------- */
const Signalman: React.FC<SignalmanProps> = ({ 
  leftPos, 
  rightPos,
  leftAngleDeg,
  rightAngleDeg,
  size = 300, 
  className = "",
  animate = true,
  torsoImageUrl
}) => {
  const getSVGAngle = (pos: SemaphorePosition) => {
    return pos * 45 - 180;
  };
  
  const get3DFlagAngle = (pos: SemaphorePosition, directAngle?: number) => {
    if (directAngle !== undefined) {
      return 180 - directAngle + 90;
    }
    return 180 - pos * 45 + 90;
  };
  
  const leftSVGAngle = getSVGAngle(leftPos);
  const rightSVGAngle = getSVGAngle(rightPos);
  
  const leftFlagAngle = get3DFlagAngle(leftPos, leftAngleDeg);
  const rightFlagAngle = get3DFlagAngle(rightPos, rightAngleDeg);

  return (
    <div className={`flex justify-center items-center ${className}`} style={{ width: size, height: size, position: 'relative' }}>
      {/* Use imported torso image or custom torsoImageUrl */}
      <img 
        src={torsoImageUrl || torsoImage} 
        alt="Signalman Torso" 
        style={{ 
          position: 'absolute', 
          top: '25px', 
          left: 0, 
          width: '100%', 
          height: '100%',
          objectFit: 'contain',
          zIndex: 1 
        }}
        onError={(e) => {
          // If image fails to load, show SVG fallback
          e.currentTarget.style.display = 'none';
          const svg = e.currentTarget.nextElementSibling as HTMLElement;
          if (svg) svg.style.display = 'block';
        }}
      />
      
      {/* SVG fallback */}
      <svg 
        viewBox="0 0 200 200" 
        width="100%" 
        height="100%" 
        className="drop-shadow-lg"
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, display: 'none' }}
      >
        <circle cx="100" cy="70" r="15" fill="#1e293b" />
        <path d="M 85 90 L 115 90 L 120 150 L 80 150 Z" fill="#1e293b" />
        <rect x="85" y="150" width="10" height="40" rx="2" fill="#334155" />
        <rect x="105" y="150" width="10" height="40" rx="2" fill="#334155" />
        
        <line x1="100" y1="90" x2="100" y2="150" stroke="white" strokeWidth="1" strokeDasharray="2,2" />
        
        <g style={{ transform: `rotate(${leftSVGAngle}deg)`, transformOrigin: '100px 100px' }} className={animate ? "transition-all duration-300 ease-in-out" : ""}>
          <line x1="100" y1="100" x2="100" y2="40" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
          <line x1="100" y1="40" x2="100" y2="10" stroke="#475569" strokeWidth="3" />
        </g>
        
        <g style={{ transform: `rotate(${rightSVGAngle}deg)`, transformOrigin: '100px 100px' }} className={animate ? "transition-all duration-300 ease-in-out" : ""}>
          <line x1="100" y1="100" x2="100" y2="40" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
          <line x1="100" y1="40" x2="100" y2="10" stroke="#475569" strokeWidth="3" />
        </g>
      </svg>

      {/* SVG arms and flagpoles on top of PNG image */}
      <svg 
        viewBox="0 0 200 200" 
        width="100%" 
        height="100%" 
        className="drop-shadow-lg"
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 3 }}
      >
        <g style={{ transform: `rotate(${leftSVGAngle}deg)`, transformOrigin: '100px 100px' }} className={animate ? "transition-all duration-300 ease-in-out" : ""}>
          <line x1="100" y1="100" x2="100" y2="40" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
          <line x1="100" y1="40" x2="100" y2="10" stroke="#475569" strokeWidth="3" />
        </g>
        
        <g style={{ transform: `rotate(${rightSVGAngle}deg)`, transformOrigin: '100px 100px' }} className={animate ? "transition-all duration-300 ease-in-out" : ""}>
          <line x1="100" y1="100" x2="100" y2="40" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
          <line x1="100" y1="40" x2="100" y2="10" stroke="#475569" strokeWidth="3" />
        </g>
      </svg>

      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}>
        <Canvas
          camera={{ position: [0, 0, 2.2], fov: 45 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={1} />
          <directionalLight position={[5, 5, 5]} intensity={3} />
          <directionalLight position={[-5, 5, -5]} intensity={2} />
          <pointLight position={[0, 0, 2]} intensity={2.0} />
          
          <PhysicsFlag angle={leftFlagAngle} side="left" animate={animate} svgSize={size} />
          <PhysicsFlag angle={rightFlagAngle} side="right" animate={animate} svgSize={size} />
        </Canvas>
      </div>
    </div>
  );
};

export default Signalman;