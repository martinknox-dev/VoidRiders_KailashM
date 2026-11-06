import React from 'react';
import { Activity, BarChart3, ClipboardList, LayoutDashboard, Radio, Settings, ShieldCheck } from 'lucide-react';

export default function DashboardSidebar({ onOpenSettings, backendConnected, onOpenDashboard }) {
  return (
    <aside className="dashboard-sidebar">
      <button className="dashboard-sidebar-brand" onClick={onOpenDashboard} aria-label="Return to VECNA-Pulse home">
        <span className="sidebar-mark"><span /></span>
        <span>VECNA<span>-Pulse</span></span>
      </button>
      <div className="sidebar-kicker">Voice intelligence / desk</div>
      <nav className="sidebar-nav" aria-label="Dashboard navigation">
        <a className="is-current" href="#command"><LayoutDashboard size={16} /> Dashboard</a>
        <a href="#analysis"><BarChart3 size={16} /> Analytics</a>
        <a href="#incidents"><ClipboardList size={16} /> Incidents</a>
        <button onClick={onOpenSettings}><Settings size={16} /> Settings</button>
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-wave" aria-hidden="true">{Array.from({ length: 14 }, (_, index) => <i key={index} style={{ height: `${18 + Math.abs(Math.sin(index * .8)) * 65}%` }} />)}</div>
        <div className="sidebar-status"><span className={backendConnected ? 'is-online' : ''} /> {backendConnected ? 'Analysis service connected' : 'Local analysis mode'}</div>
        <div className="sidebar-version">VECNA-PULSE / COMMAND CENTER</div>
      </div>
    </aside>
  );
}
