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
  ['01', 'Voice input', 'Receive a recorded emergency call or supported live microphone input.'],
  ['02', 'Speech processing', 'Prepare available audio for downstream analysis.'],
  ['03', 'Transcription', 'Convert available speech into understandable text.'],
  ['04', 'Vocal analysis', 'Examine available acoustic characteristics and vocal cues.'],
  ['05', 'Incident context', 'Organize speech information and relevant incident details.'],
  ['06', 'Human verification', 'Allow an operator to review information before decisions.'],
  ['07', 'Response coordination', 'Maintain incident details and response records.'],
];

const capabilityStats = [
  ['01', 'Recorded audio upload', 'WAV intake for calls that need analysis'],
  ['02', 'Live audio input', 'Supported microphone streaming for active calls'],
  ['03', 'Voice analysis', 'Pitch, cadence, jitter, loudness and activity signals'],
  ['04', 'Speech transcription', 'Available transcript processing and redaction'],
  ['05', 'Emergency call queue', 'Prioritized active calls and saved cases'],
  ['06', 'Scenario testing', 'Controlled demo scenarios and surge testing'],
  ['07', 'Incident records', 'Operator notes, response logs and case export'],
];

function VoiceScene({ progress }) {
  const canvasRef = React.useRef(null);
  const progressRef = React.useRef(progress);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

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
    const face = new THREE.Group();
    scene.add(face);
    const orbit = { x: 0, y: 0 };
    const pointer = { active: false, x: 0, y: 0 };

    const sculpture = new THREE.MeshStandardMaterial({ color: 0xe7dfcf, roughness: 0.72, metalness: 0.04 });
    const waveform = new THREE.MeshStandardMaterial({ color: 0x756653, roughness: 0.5, metalness: 0.12 });
    const waveformEdge = new THREE.MeshStandardMaterial({ color: 0xb18b56, roughness: 0.38, metalness: 0.52 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x101923, roughness: 0.35 });

    const box = (size, position, material, parent = face) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
      mesh.position.set(...position);
      parent.add(mesh);
      return mesh;
    };
    const cylinder = (radius, height, position, material, segments = 16, parent = face) => {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, segments), material);
      mesh.position.set(...position);
      parent.add(mesh);
      return mesh;
    };

    const profileShape = new THREE.Shape();
    profileShape.moveTo(-0.75, -2.55);
    profileShape.lineTo(0.72, -2.55);
    profileShape.quadraticCurveTo(0.78, -1.92, 0.55, -1.42);
    profileShape.quadraticCurveTo(0.92, -1.16, 1.35, -0.92);
    profileShape.quadraticCurveTo(1.62, -0.73, 1.7, -0.38);
    profileShape.quadraticCurveTo(1.74, -0.16, 1.98, -0.02);
    profileShape.quadraticCurveTo(2.12, 0.08, 1.96, 0.18);
    profileShape.lineTo(1.7, 0.23);
    profileShape.quadraticCurveTo(1.88, 0.34, 1.69, 0.39);
    profileShape.quadraticCurveTo(1.55, 0.44, 1.45, 0.66);
    profileShape.quadraticCurveTo(1.38, 1.05, 1.15, 1.42);
    profileShape.quadraticCurveTo(0.76, 2.13, -0.08, 2.27);
    profileShape.quadraticCurveTo(-0.98, 2.38, -1.36, 1.72);
    profileShape.quadraticCurveTo(-1.68, 0.96, -1.48, 0.04);
    profileShape.quadraticCurveTo(-1.33, -0.58, -0.9, -1.05);
    profileShape.quadraticCurveTo(-0.56, -1.52, -0.75, -2.55);
    const bust = new THREE.Mesh(
      new THREE.ExtrudeGeometry(profileShape, { depth: 1.8, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.08, bevelThickness: 0.12 }),
      sculpture
    );
    bust.position.set(0.1, 0, -0.9);
    face.add(bust);
    const shoulder = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.55, 0.28, 32), sculpture);
    shoulder.scale.z = 0.75;
    shoulder.position.set(-0.05, -2.58, 0);
    face.add(shoulder);

    const waveformGroup = new THREE.Group();
    waveformGroup.position.set(-0.45, 0.75, 0.06);
    face.add(waveformGroup);
    const bars = [0.12, 0.2, 0.34, 0.57, 0.82, 1.18, 1.55, 1.02, 0.67, 0.43, 0.27, 0.15];
    bars.forEach((height, index) => {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.1, height, 0.12), waveform);
      bar.position.set((index - 5.5) * 0.16, 0, 0);
      waveformGroup.add(bar);
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.13, height + 0.06, 0.04), waveformEdge);
      cap.position.set((index - 5.5) * 0.16, 0, 0.07);
      waveformGroup.add(cap);
    });
    const waves = new THREE.Group();
    face.add(waves);
    for (let index = 0; index < 5; index += 1) {
      const points = [];
      for (let point = 0; point < 18; point += 1) {
        const x = -2.45 - point * 0.24;
        points.push(new THREE.Vector3(x, -0.78 + Math.sin(point * 0.8 + index) * (0.13 + index * 0.04), 0.7 + index * 0.1));
      }
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: index % 2 ? 0x55b7ae : 0xb18b56, transparent: true, opacity: 0.72 }));
      waves.add(line);
    }

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
      face.rotation.y = orbit.y + value * 0.25;
      face.rotation.x = orbit.x;
      waveformGroup.scale.setScalar(0.82 + interiorProgress * 0.28);
      waves.visible = value > 0.25;
      const distance = 8 - interiorProgress * 2;
      const horizontal = orbit.y * 1.5;
      const vertical = orbit.x * 1.2;
      camera.position.set(horizontal, vertical, distance);
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    resize();
    draw(progressRef.current);
    const onProgress = (event) => draw(event.detail);
    canvas.addEventListener('architecture-progress', onProgress);
    const onPointerDown = (event) => {
      pointer.active = true;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      canvas.setPointerCapture(event.pointerId);
      canvas.classList.add('is-dragging');
    };
    const onPointerMove = (event) => {
      if (!pointer.active) return;
      const deltaX = event.clientX - pointer.x;
      const deltaY = event.clientY - pointer.y;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      // Inverse orbit: the sculpture moves opposite to the pointer.
      orbit.y = THREE.MathUtils.clamp(orbit.y - deltaX * 0.008, -0.9, 0.9);
      orbit.x = THREE.MathUtils.clamp(orbit.x + deltaY * 0.006, -0.6, 0.6);
      draw(progress);
    };
    const onPointerUp = (event) => {
      pointer.active = false;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      canvas.classList.remove('is-dragging');
    };
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    const observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement);
    return () => {
      observer.disconnect();
      canvas.removeEventListener('architecture-progress', onProgress);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
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

function VoiceModel({ progress }) {
  return (
    <div className="voice-stage" aria-label="Interactive three-dimensional human speech model">
      <VoiceScene progress={progress} />
      <div className="architecture-caption">
        <span>DRAG TO ORBIT / SCROLL TO EXPLORE</span>
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
          <a href="#workflow" onClick={closeMenu}>How it works</a>
          <a href="#signals" onClick={closeMenu}>Voice signals</a>
          <a href="#architecture" onClick={closeMenu}>Conversation workflow</a>
          <a href="#safety" onClick={closeMenu}>Safety</a>
          <button className="nav-cta" onClick={() => { closeMenu(); onOpenDashboard(); }}>
            Open dashboard <ArrowRight size={15} />
          </button>
        </nav>
      </header>

      <main id="top">
        <section className="landing-hero">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-dot" /> Voice intelligence / 01</p>
            <h1>Beyond words.<br /><em>Into the</em><br />voice.</h1>
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
          <VoiceModel progress={progress} />
          <div className="hero-index">V / P <span>Speech signals</span></div>
        </section>

        <section className="intro-section content-section" id="about">
          <div className="section-label">02 / THE PURPOSE</div>
          <div className="intro-content">
            <h2>Every conversation<br /><em>carries signals.</em></h2>
            <div>
              <p className="large-copy">When an emergency call arrives, clarity is a response capability.</p>
              <p>VECNA-Pulse is an investigative workstation for operators who need to listen closely, organize incident context, and move with confidence. It brings audio intake, available vocal signals, triage advisories and response notes into one focused desk.</p>
              <button className="outline-button" onClick={onOpenDashboard}>Enter the operations desk <ArrowRight size={16} /></button>
            </div>
          </div>
        </section>

        <section className="workflow-section content-section" id="workflow">
          <div className="section-label">03 / CONVERSATION WORKFLOW</div>
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

        <section className="signals-section content-section" id="signals">
          <div className="section-label">04 / THE SIGNALS</div>
          <div className="signal-heading"><h2>The signals behind<br /><em>every voice.</em></h2><p>Observable acoustic features can help an operator organize attention. They are supporting signals, not conclusions about a person's internal state.</p></div>
          <div className="signal-board">
            <div className="signal-board-label">LIVE ACOUSTIC VIEW <span>INDICATIVE</span></div>
            <div className="waveform-visual">{Array.from({ length: 42 }, (_, index) => <i key={index} style={{ height: `${18 + Math.abs(Math.sin(index * 0.72)) * 62}%` }} />)}</div>
            <div className="signal-metrics"><span><b>04.8</b> speech rate / sps</span><span><b>284</b> pitch / hz</span><span><b>−10.8</b> intensity / db</span><span><b>00:08</b> active segment</span></div>
          </div>
        </section>

        <section className="capabilities-section content-section" id="capabilities">
          <div className="section-label">05 / VOICE CAPABILITIES</div>
          <div className="capability-intro"><h2>Signals become<br /><em>situational clarity.</em></h2><p>Designed to support trained people, not replace them.</p></div>
          <div className="capability-grid">
            {capabilityStats.map(([number, title, copy]) => (
              <div className="capability-card" key={number}><span>{number}</span><Building2 size={19} /><h3>{title}</h3><p>{copy}</p><button onClick={onOpenDashboard}>View in dashboard <ArrowRight size={13} /></button></div>
            ))}
          </div>
        </section>

        <section className="architecture-section content-section" id="architecture">
          <div className="section-label">06 / THE SYSTEM</div>
          <div className="architecture-copy"><h2>Inside the voice<br /><em>intelligence workflow.</em></h2><p>The actual product flow, from available voice input to a human-reviewed response record.</p></div>
          <div className="data-flow">
            {['Voice input', 'Audio processing', 'Transcription / vocal analysis', 'Structured incident information', 'Human verification', 'Response coordination', 'Incident records'].map((step, index) => (
              <div className="data-flow-step" key={step}><span>{String(index + 1).padStart(2, '0')}</span><strong>{step}</strong>{index < 6 && <ArrowDownRight size={16} />}</div>
            ))}
          </div>
        </section>

        <section className="safety-section content-section" id="safety">
          <div className="safety-seal"><ShieldCheck size={25} /><span>Human<br />verified</span></div>
          <div><div className="section-label">07 / THE GUARDRAIL</div><h2>Signals support.<br /><em>Humans decide.</em></h2><p>Automated voice analysis provides supporting information. Vocal cues alone cannot establish the truth or severity of an emergency. Audio quality, language, accent, environment and speaking conditions can affect analysis. Incident details require human verification.</p></div>
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
