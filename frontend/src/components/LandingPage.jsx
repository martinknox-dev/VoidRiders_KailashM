import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import {
  ArrowDownRight,
  ArrowRight,
  AudioLines,
  Building2,
  CheckCircle2,
  Command,
  LockKeyhole,
  Menu,
  ShieldCheck,
  X,
} from 'lucide-react';

const workflow = [
  ['01', 'Voice capture', 'Receive an uploaded recording or supported live microphone input.'],
  ['02', 'Audio processing', 'Prepare available recordings for analysis.'],
  ['03', 'Voice analysis', 'Surface acoustic cues that can help operators prioritize attention.'],
  ['04', 'Incident understanding', 'Organize transcription and incident details.'],
  ['05', 'Human verification', 'Present signals and context for operator review.'],
  ['06', 'Response coordination', 'Support incident organization and record management.'],
];

const capabilityStats = [
  ['01', 'Intelligent voice intake', 'WAV uploads and live microphone capture'],
  ['02', 'Recorded audio analysis', 'Client-side or connected processing for uploaded calls'],
  ['03', 'Live audio input', 'Supported microphone streaming for active calls'],
  ['04', 'Voice analysis', 'Pitch, cadence, jitter, loudness and activity signals'],
  ['05', 'Incident queue management', 'Prioritized active calls and saved cases'],
  ['06', 'Scenario simulation', 'Controlled demo scenarios and surge testing'],
  ['07', 'Response records', 'Operator notes, incident logs and case export'],
];

function ArchitecturalScene({ progress }) {
  const canvasRef = React.useRef(null);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSupported(false);
      return undefined;
    }

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch {
      setSupported(false);
      return undefined;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    const building = new THREE.Group();
    scene.add(building);

    const limestone = new THREE.MeshStandardMaterial({ color: 0xcfc3ad, roughness: 0.82 });
    const stoneLight = new THREE.MeshStandardMaterial({ color: 0xe9e0cf, roughness: 0.75 });
    const brass = new THREE.MeshStandardMaterial({ color: 0xb18b56, metalness: 0.65, roughness: 0.35 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x111a25, roughness: 0.45 });
    const teal = new THREE.MeshStandardMaterial({ color: 0x477c79, emissive: 0x173a3a, emissiveIntensity: 0.8 });

    const box = (size, position, material, parent = building) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
      mesh.position.set(...position);
      parent.add(mesh);
      return mesh;
    };
    const cylinder = (radius, height, position, material, segments = 16, parent = building) => {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, segments), material);
      mesh.position.set(...position);
      parent.add(mesh);
      return mesh;
    };

    box([8.8, 0.55, 4], [0, -2.35, 0], limestone);
    box([7.7, 0.35, 3.4], [0, -2.02, 0], stoneLight);
    box([3.2, 2.8, 2.4], [0, -0.5, 0], stoneLight);
    box([2.2, 1.8, 2.05], [0, 0.9, 0], limestone);
    box([2.8, 0.35, 2.7], [0, 1.85, 0], stoneLight);
    box([2.8, 0.22, 2.7], [0, 2.12, 0], brass);
    [-3.1, 3.1].forEach((x) => {
      box([2.6, 2.5, 2.8], [x, -0.75, 0], limestone);
      box([2.9, 0.22, 3.1], [x, 0.55, 0], stoneLight);
      [-0.8, 0, 0.8].forEach((z) => box([0.24, 1.2, 0.12], [x, -0.75, z], teal));
    });
    [-1.25, -0.42, 0.42, 1.25].forEach((x) => {
      cylinder(0.18, 2.8, [x, -0.65, 1.32], stoneLight, 12);
      cylinder(0.24, 0.12, [x, 0.8, 1.32], brass, 12);
    });
    box([1.25, 1.65, 0.14], [0, -0.82, 1.43], dark);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(1.38, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), stoneLight);
    dome.position.set(0, 2.35, 0);
    building.add(dome);
    cylinder(0.14, 0.45, [0, 3.65, 0], brass, 12);

    const interior = new THREE.Group();
    interior.visible = false;
    building.add(interior);
    box([4.3, 0.08, 1.6], [0, -0.15, 0], dark, interior);
    [-1.5, 0, 1.5].forEach((x) => {
      box([0.9, 0.5, 0.45], [x, 0.25, 0], teal, interior);
      box([0.65, 0.02, 0.32], [x, 0.53, 0], brass, interior);
    });

    scene.add(new THREE.AmbientLight(0xfff5df, 2.1));
    const keyLight = new THREE.DirectionalLight(0xb9d7d0, 3);
    keyLight.position.set(4, 8, 7);
    scene.add(keyLight);

    const resize = () => {
      const { width, height } = canvas.parentElement.getBoundingClientRect();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const draw = (value) => {
      const interiorProgress = Math.max(0, (value - 0.25) / 0.5);
      building.rotation.y = -0.35 + value * 1.2;
      building.position.y = -0.1 + interiorProgress * 0.25;
      interior.visible = interiorProgress > 0.18;
      interior.scale.setScalar(0.8 + interiorProgress * 0.35);
      camera.position.set(7.5 - interiorProgress * 2.5, 3.5 + interiorProgress * 1.3, 10 - interiorProgress * 3);
      camera.lookAt(0, 0.3, 0);
      renderer.render(scene, camera);
    };
    resize();
    draw(progress);
    const observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement);
    return () => {
      observer.disconnect();
      renderer.dispose();
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) object.material.dispose();
      });
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && supported) {
      canvas.dispatchEvent(new CustomEvent('architecture-progress', { detail: progress }));
    }
  }, [progress, supported]);

  return <canvas ref={canvasRef} className={supported ? 'architecture-canvas' : 'architecture-canvas is-fallback'} aria-hidden="true" />;
}

function ArchitecturalModel({ progress }) {
  const rotation = -14 + progress * 42;
  const reveal = 0.18 + progress * 0.82;

  return (
    <div className="architecture-stage" aria-label="Interactive architectural model of the VECNA-Pulse response center">
      <ArchitecturalScene progress={progress} />
      <div className="architecture-grid" />
      <div className="architecture-model" style={{ '--model-rotation': `${rotation}deg`, '--reveal': reveal }}>
        <div className="model-shadow" />
        <div className="model-plinth" />
        <div className="model-wing model-wing-left">
          <span className="model-window-row" />
          <span className="model-window-row" />
          <span className="model-window-row" />
        </div>
        <div className="model-wing model-wing-right">
          <span className="model-window-row" />
          <span className="model-window-row" />
          <span className="model-window-row" />
        </div>
        <div className="model-portico">
          <i /><i /><i /><i />
          <div className="model-entrance" />
        </div>
        <div className="model-dome">
          <div className="model-dome-cap" />
        </div>
        <div className="model-signal model-signal-one"><AudioLines /></div>
        <div className="model-signal model-signal-two"><Command /></div>
        <div className="model-signal model-signal-three"><ShieldCheck /></div>
      </div>
      <div className="architecture-caption">
        <span>SCROLL TO ROTATE</span>
        <span className="caption-line" />
        <strong>{String(Math.round(progress * 100)).padStart(2, '0')} / 100</strong>
      </div>
    </div>
  );
}

export default function LandingPage({ onOpenDashboard }) {
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const updateProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="landing-page">
      <header className="landing-nav">
        <a className="landing-brand" href="#top" onClick={closeMenu}>
          <span className="brand-mark"><span /></span>
          <span>VECNA<span className="brand-accent">-Pulse</span></span>
        </a>
        <button className="landing-menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
          {menuOpen ? <X /> : <Menu />}
        </button>
        <nav className={menuOpen ? 'landing-links is-open' : 'landing-links'}>
          <a href="#about" onClick={closeMenu}>About</a>
          <a href="#workflow" onClick={closeMenu}>Workflow</a>
          <a href="#capabilities" onClick={closeMenu}>Capabilities</a>
          <a href="#architecture" onClick={closeMenu}>Architecture</a>
          <a href="#safety" onClick={closeMenu}>Safety</a>
          <button className="nav-cta" onClick={() => { closeMenu(); onOpenDashboard(); }}>
            Open dashboard <ArrowRight size={15} />
          </button>
        </nav>
      </header>

      <main id="top">
        <section className="landing-hero">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-dot" /> Emergency voice intelligence / 01</p>
            <h1>Every second<br /><em>matters.</em> Every<br />voice matters.</h1>
            <p className="hero-description">
              VECNA-Pulse helps emergency response teams turn voice signals into clearer,
              faster coordination — with human verification at every meaningful decision.
            </p>
            <div className="hero-actions">
              <button className="button-primary" onClick={onOpenDashboard}>Launch response desk <ArrowRight size={17} /></button>
              <a className="text-link" href="#workflow">Explore the workflow <ArrowDownRight size={17} /></a>
            </div>
            <div className="hero-footnote"><LockKeyhole size={13} /> Indicative signals only. Human review required.</div>
          </div>
          <ArchitecturalModel progress={progress} />
          <div className="hero-index">V / P <span>Response architecture</span></div>
        </section>

        <section className="intro-section content-section" id="about">
          <div className="section-label">02 / THE PURPOSE</div>
          <div className="intro-content">
            <h2>Built for the<br /><em>golden hour.</em></h2>
            <div>
              <p className="large-copy">When an emergency call arrives, clarity is a response capability.</p>
              <p>VECNA-Pulse is an investigative workstation for operators who need to listen closely, organize incident context, and move with confidence. It brings audio intake, available vocal signals, triage advisories and response notes into one focused desk.</p>
              <button className="outline-button" onClick={onOpenDashboard}>Enter the operations desk <ArrowRight size={16} /></button>
            </div>
          </div>
        </section>

        <section className="workflow-section content-section" id="workflow">
          <div className="section-label">03 / THE WORKFLOW</div>
          <div className="section-heading-row">
            <h2>From voice to<br /><em>verified response.</em></h2>
            <p>One connected view for the moments that cannot wait.</p>
          </div>
          <div className="workflow-list">
            {workflow.map(([number, title, copy]) => (
              <div className="workflow-item" key={number}>
                <span className="workflow-number">{number}</span>
                <div className="workflow-icon"><CheckCircle2 size={17} /></div>
                <div><h3>{title}</h3><p>{copy}</p></div>
                <ArrowRight className="workflow-arrow" size={18} />
              </div>
            ))}
          </div>
        </section>

        <section className="capabilities-section content-section" id="capabilities">
          <div className="section-label">04 / THE CAPABILITY LAYER</div>
          <div className="capability-intro"><h2>Signals become<br /><em>situational clarity.</em></h2><p>Designed to support trained people, not replace them.</p></div>
          <div className="capability-grid">
            {capabilityStats.map(([number, title, copy]) => (
              <div className="capability-card" key={number}><span>{number}</span><Building2 size={19} /><h3>{title}</h3><p>{copy}</p><button onClick={onOpenDashboard}>View in dashboard <ArrowRight size={13} /></button></div>
            ))}
          </div>
        </section>

        <section className="architecture-section content-section" id="architecture">
          <div className="section-label">05 / THE SYSTEM</div>
          <div className="architecture-copy"><h2>Inside the<br /><em>architecture.</em></h2><p>The actual product flow, from available voice input to a human-reviewed response record.</p></div>
          <div className="data-flow">
            {['Voice input', 'Audio processing', 'Transcription / vocal analysis', 'Structured incident information', 'Human verification', 'Response coordination', 'Incident records'].map((step, index) => (
              <div className="data-flow-step" key={step}><span>{String(index + 1).padStart(2, '0')}</span><strong>{step}</strong>{index < 6 && <ArrowDownRight size={16} />}</div>
            ))}
          </div>
        </section>

        <section className="safety-section content-section" id="safety">
          <div className="safety-seal"><ShieldCheck size={25} /><span>Human<br />verified</span></div>
          <div><div className="section-label">06 / THE GUARDRAIL</div><h2>Technology with<br /><em>responsibility.</em></h2><p>Automated voice analysis provides supporting information. Vocal cues alone cannot establish the truth or severity of an emergency. Incident details require human verification, and operators remain responsible for decisions.</p></div>
        </section>

        <section className="closing-section">
          <p className="eyebrow">Ready when the call comes in</p>
          <h2>Make the next<br /><em>second count.</em></h2>
          <button className="button-primary" onClick={onOpenDashboard}>Launch VECNA-Pulse <ArrowRight size={17} /></button>
        </section>
      </main>
      <footer className="landing-footer"><span>VECNA<span className="brand-accent">-Pulse</span></span><span>Emergency voice intelligence / 2026</span><span>Built for human-verified response</span></footer>
    </div>
  );
}
