"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { AuthModal } from "@/components/auth-modal";

export function HeroSplash() {
  const dottedRef = useRef<HTMLDivElement>(null);
  const [authModal, setAuthModal] = useState<{
    open: boolean;
    mode: "signup" | "signin";
  }>({ open: false, mode: "signup" });

  /* ── Three.js dotted surface ── */
  useEffect(() => {
    const container = dottedRef.current;
    if (!container) return;
    const SEPARATION = 150, AMOUNTX = 40, AMOUNTY = 60;
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xffffff, 2000, 10000);
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 355, 1220);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(scene.fog.color, 0);
    container.appendChild(renderer.domElement);

    const positions: number[] = [];
    const colors: number[] = [];
    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        positions.push(ix * SEPARATION - (AMOUNTX * SEPARATION) / 2, 0, iy * SEPARATION - (AMOUNTY * SEPARATION) / 2);
        colors.push(200, 200, 200);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({ size: 8, vertexColors: true, transparent: true, opacity: 0.8, sizeAttenuation: true });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let count = 0;
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const posArr = geometry.attributes.position.array as Float32Array;
      let i = 0;
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          posArr[i * 3 + 1] = Math.sin((ix + count) * 0.3) * 50 + Math.sin((iy + count) * 0.5) * 50;
          i++;
        }
      }
      geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
      count += 0.1;
    };

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      scene.traverse(obj => {
        if (obj instanceof THREE.Points) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="opt-root splash-root">
      <AuthModal
        open={authModal.open}
        onClose={() => setAuthModal(a => ({ ...a, open: false }))}
        initialMode={authModal.mode}
        initialTab="individual"
      />

      {/* Header — logo only */}
      <header className="site-header splash-header">
        <nav className="shell nav">
          <a className="brand" href="/" aria-label="Optimais Limited">
            <img src="/brand_assets/optimais_logo_clean.svg" alt="Optimais" />
          </a>
          <div className="nav-actions">
            <button
              className="button secondary opt-signin-btn"
              type="button"
              onClick={() => setAuthModal({ open: true, mode: "signin" })}
            >
              Sign In
            </button>
          </div>
        </nav>
      </header>

      {/* Hero — full screen */}
      <main className="splash-main">
        <div ref={dottedRef} className="opt-dotted-surface" aria-hidden="true" />
        <div className="shell splash-content">
          <h1>Intelligent systems for<br />sustainable industrial growth.</h1>
          <p className="hero-copy">
            Optimais is a research-driven Artificial Intelligence and Robotics Research Laboratory and consulting company dedicated to advancing technology, innovation, and sustainable development. We bring together cutting-edge research, engineering expertise, and strategic advisory services to solve complex challenges across industries and society.
          </p>
          <div className="splash-actions">
            <button
              className="button"
              type="button"
              onClick={() => setAuthModal({ open: true, mode: "signup" })}
            >
              Sign Up
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 8 }}>
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
