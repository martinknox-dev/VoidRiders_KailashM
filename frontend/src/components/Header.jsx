import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Settings,
  Cpu,
  HardDrive,
  Radio,
  Sun,
  Moon,
  ToggleLeft,
  ToggleRight,
  Clock,
  Zap,
  Activity,
  Globe
} from 'lucide-react';
import { MODEL_TIERS } from '../services/hardwareEngine';

export default function Header({
  activeCall,
  isMockMode,
  setIsMockMode,
  onOpenSettings,
  onOpenHardwareWizard,
  onOpenLanding,
  provider,
  backendConnected,
  currentTier = 'MID_RANGE',
  storageInfo,
  theme,
  setTheme
}) {
  const activeTier = MODEL_TIERS[currentTier] || MODEL_TIERS.MID_RANGE;

  // 60-Minute Golden Hour dynamic countdown
  const [goldenSeconds, setGoldenSeconds] = useState(48 * 60);

  useEffect(() => {
    // Reset/recalc when active call changes
    if (activeCall?.call_id) {
      const initialMins = activeCall.urgency_score > 85 ? 42 : 52;
      setGoldenSeconds(initialMins * 60);
    }
  }, [activeCall?.call_id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setGoldenSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const getDispersionTier = (totalSec) => {
    const minsLeft = Math.floor(totalSec / 60);
    if (minsLeft > 45) {
      return {
        label: 'Tier 1 Mule (92% Recovery)',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/60',
        badge: 'bg-emerald-500/20 text-emerald-300',
      };
    }
    if (minsLeft > 15) {
      return {
        label: 'Tier 2 Multi-Hop (48% Recovery)',
        color: 'text-amber-400 border-amber-500/40 bg-amber-950/60',
        badge: 'bg-amber-500/20 text-amber-300',
      };
    }
    return {
      label: 'ATM/Crypto Drain (<12% Recovery)',
      color: 'text-rose-400 border-rose-500/40 bg-rose-950/60',
      badge: 'bg-rose-500/20 text-rose-300 animate-pulse',
    };
  };

  const tierInfo = getDispersionTier(goldenSeconds);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <header className="bg-white/95 dark:bg-[#080d16]/95 backdrop-blur border-b border-slate-200 dark:border-[#1e293b] px-3 sm:px-6 py-2 sticky top-0 z-40 transition-colors select-none shadow-sm">
      <div className="max-w-[1680px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        {/* Brand identity */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-[#0e1624] border border-slate-700 dark:border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm shrink-0">
            <Radio className="w-4 h-4 animate-pulse text-cyan-400" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                VECNA<span className="text-cyan-600 dark:text-cyan-400 font-extrabold">-Pulse</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 font-semibold uppercase tracking-wider">
                1930 Command Console
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Emergency Cyber Triage & Golden Hour Interdiction Station
            </p>
          </div>
        </div>

        {/* Golden Hour Global Countdown Badge & Tactical Status */}
        <div className="flex items-center gap-2">
          {activeCall ? (
            <div
              className={`flex items-center gap-2.5 px-3 py-1 rounded-full border text-xs shadow-sm transition-all ${tierInfo.color}`}
              title="Time window before illicit fund dispersion across secondary mule hops"
            >
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-[11px] font-medium opacity-80 uppercase tracking-wider">Golden Hour:</span>
                <span className="font-bold text-xs">{formatCountdown(goldenSeconds)}</span>
              </div>
              <span
                className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border border-current/30 ${tierInfo.badge}`}
              >
                {tierInfo.label}
              </span>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-[#121927] border border-slate-200 dark:border-[#222f44] text-xs text-slate-600 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono text-[11px]">Golden Hour: 60m Standby</span>
              <span className="text-[9px] font-mono uppercase bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">
                Awaiting Incident
              </span>
            </div>
          )}
        </div>

        {/* System & Hardware Controls */}
        <div className="flex items-center gap-2 flex-wrap justify-end w-full sm:w-auto">
          {/* Landing page overview toggle */}
          {onOpenLanding && (
            <button
              onClick={onOpenLanding}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-[#121927] border border-slate-200 dark:border-[#1e293b] text-slate-700 dark:text-slate-200 hover:border-cyan-500/60 transition-colors shadow-sm"
              title="View product landing page & architecture overview"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span className="text-[11px] font-medium">Overview</span>
            </button>
          )}

          {/* Theme Toggle (Dark / Light) */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-md bg-slate-100 dark:bg-[#121927] border border-slate-200 dark:border-[#1e293b] text-slate-700 dark:text-slate-200 hover:border-cyan-500/60 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Hardware execution profile */}
          {onOpenHardwareWizard && (
            <button
              onClick={onOpenHardwareWizard}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-[#121927] border border-slate-200 dark:border-[#1e293b] text-slate-700 dark:text-slate-200 hover:border-cyan-500/60 transition-colors"
              title="Configure system execution profile and local model cache"
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span className="text-[11px] font-medium">{activeTier.name}</span>
            </button>
          )}

          {/* Demo Mode Toggle */}
          <button
            onClick={() => setIsMockMode(!isMockMode)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border transition-colors ${
              isMockMode
                ? 'bg-purple-100 dark:bg-purple-950/40 border-purple-300 dark:border-purple-600/70 text-purple-800 dark:text-purple-200'
                : 'bg-slate-100 dark:bg-[#121927] border-slate-200 dark:border-[#1e293b] text-slate-700 dark:text-slate-300 hover:border-slate-400'
            }`}
            title="Toggle pre-loaded demo calls on or off"
          >
            <span className="text-[11px] font-medium">Demo Mode</span>
            {isMockMode ? (
              <ToggleRight className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            ) : (
              <ToggleLeft className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Provider / BYOK settings */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-[#121927] border border-slate-200 dark:border-[#1e293b] text-slate-700 dark:text-slate-200 hover:border-slate-400 transition-colors"
            title="Configure inference provider and API credentials"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span className="capitalize text-[11px]">
              {provider === 'offline' ? 'Local' : provider}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
