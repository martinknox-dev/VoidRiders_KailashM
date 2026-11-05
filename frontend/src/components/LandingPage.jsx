import React, { useEffect, useState } from 'react';
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
  ['02', 'Speech processing', 'Turn available audio into a redacted, searchable transcript.'],
  ['03', 'Vocal analysis', 'Surface acoustic cues that can help operators prioritize attention.'],
  ['04', 'Incident understanding', 'Organize the available evidence into an actionable case brief.'],
  ['05', 'Verified response', 'Keep a human in the loop while coordinating the next response.'],
];

const capabilityStats = [
  ['01', 'Audio intake', 'WAV uploads and live microphone capture'],
  ['02', 'Signal layer', 'Pitch, cadence, jitter, loudness and activity'],
  ['03', 'Response desk', 'Queue, triage advisory and incident log'],
];

function ArchitecturalModel({ progress }) {
  const rotation = -14 + progress * 42;
  const reveal = 0.18 + progress * 0.82;

  return (
    <div className="architecture-stage" aria-label="Interactive architectural model of the VECNA-Pulse response center">
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
              <p>VECNA-Pulse is an investigative workstation for operators who need to listen closely, organize incident context, and move with confidence. It brings audio intake, vocal biomarkers, triage signals and response notes into one focused desk.</p>
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
              <div className="capability-card" key={number}><span>{number}</span><Building2 size={19} /><h3>{title}</h3><p>{copy}</p></div>
            ))}
          </div>
        </section>

        <section className="safety-section content-section" id="safety">
          <div className="safety-seal"><ShieldCheck size={25} /><span>Human<br />verified</span></div>
          <div><div className="section-label">05 / THE GUARDRAIL</div><h2>Technology with<br /><em>responsibility.</em></h2><p>Vocal emotion and urgency metrics are indicative triage signals. They assist queue prioritization — they are not definitive evidence of intent, honesty or guilt.</p></div>
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
