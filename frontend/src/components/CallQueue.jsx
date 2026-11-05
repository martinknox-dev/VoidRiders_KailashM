import React, { useState } from 'react';
import {
  Phone,
  AlertCircle,
  Volume2,
  ShieldAlert,
  Archive,
  Trash2,
  Zap,
  Clock,
  Layers,
  Activity
} from 'lucide-react';

export default function CallQueue({
  calls = [],
  selectedCallId,
  onSelectCall,
  onRefreshQueue,
  onSimulateSurge,
  isLoading,
  isSurgeActive,
  savedCases = [],
  onDeleteSavedCase,
  isMockMode
}) {
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'saved'

  const getUrgencyBadge = (level, score) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/40 font-bold';
      case 'HIGH':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/40 font-semibold';
      case 'MEDIUM':
        return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/40 font-medium';
      default:
        return 'bg-slate-500/15 text-slate-400 border-slate-500/40';
    }
  };

  const getUrgencyBarColor = (score) => {
    if (score >= 80) return 'bg-rose-500';
    if (score >= 60) return 'bg-amber-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-slate-400';
  };

  const getScamStageBadge = (scamStage) => {
    let stageNum = 4;
    if (typeof scamStage === 'object' && scamStage !== null) {
      stageNum = scamStage.stage_number || 4;
    } else if (typeof scamStage === 'number') {
      stageNum = scamStage;
    }
    const stages = {
      1: { label: 'Stage 1 • Impersonation', style: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
      2: { label: 'Stage 2 • Coercion', style: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
      3: { label: 'Stage 3 • Infiltration', style: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
      4: { label: 'Stage 4 • Liquidation', style: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
    };
    return stages[stageNum] || stages[4];
  };

  const getCallElapsedTime = (call, index) => {
    if (call.elapsed_time) return call.elapsed_time;
    if (call.timestamp_ms) {
      const diffMin = Math.floor((Date.now() - call.timestamp_ms) / 60000);
      if (diffMin >= 0 && diffMin <= 120) return `T+${diffMin}m`;
    }
    const defaultTiers = ['T+4m', 'T+11m', 'T+24m', 'T+38m'];
    return defaultTiers[index % defaultTiers.length];
  };

  return (
    <div className="bg-white dark:bg-[#080d16] border border-slate-200 dark:border-[#1e293b] rounded-xl flex flex-col h-full min-h-0 overflow-hidden shadow-sm transition-colors">
      {/* Panel Top Tabs */}
      <div className="px-3 py-2 border-b border-slate-200 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0c121e] flex items-center justify-between">
        <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-[#121927] p-0.5 rounded-lg border border-slate-300 dark:border-[#222f44] text-xs">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'queue'
                ? 'bg-white dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-300 border border-slate-300 dark:border-cyan-700/50 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent'
            }`}
          >
            Live Queue ({calls.length})
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'saved'
                ? 'bg-white dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-300 border border-slate-300 dark:border-cyan-700/50 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent'
            }`}
          >
            Vault ({savedCases.length})
          </button>
        </div>

        {isSurgeActive && (
          <span className="text-[10px] font-mono font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/90 border border-rose-300 dark:border-rose-700 px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1">
            <Activity className="w-3 h-3 text-rose-400" />
            SURGE SPIKE
          </span>
        )}
      </div>

      {/* Action Header / Surge Controller */}
      {activeTab === 'queue' && (
        <div className="px-3 py-1.5 bg-slate-100/70 dark:bg-[#0e1624] border-b border-slate-200 dark:border-[#1e293b] flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            Vocal Urgency Prioritization
          </span>
          {isMockMode && (
            <button
              onClick={onSimulateSurge}
              className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded bg-white dark:bg-[#151f30] border border-slate-300 dark:border-[#2b3a52] text-slate-700 dark:text-slate-200 hover:border-cyan-500 transition-colors shadow-sm"
              title="Simulate multi-caller cyber syndicate surge"
            >
              <Zap className="w-3 h-3 text-amber-400 fill-current" />
              <span>Simulate Surge</span>
            </button>
          )}
        </div>
      )}

      {/* High-Density Streamlined Call List */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-2">
        {activeTab === 'queue' ? (
          calls.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
              <Phone className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No active calls in queue</p>
              <p className="text-[11px] max-w-[210px] text-slate-500">
                Audio triage engine is ready. Upload a call audio file or select scenarios to analyze.
              </p>
            </div>
          ) : (
            calls.map((call, idx) => {
              const isSelected = call.call_id === selectedCallId;
              const stageInfo = getScamStageBadge(call.scam_stage);
              const elapsedBadge = getCallElapsedTime(call, idx);

              return (
                <div
                  key={call.call_id}
                  onClick={() => onSelectCall(call)}
                  className={`p-2.5 rounded-lg cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-cyan-500/10 dark:bg-[#121c2d] border-cyan-500/80 shadow-md shadow-cyan-950/20 border-l-4 border-l-cyan-400'
                      : 'bg-white dark:bg-[#0b101b] border-slate-200 dark:border-[#1e293b] hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-[#0f1726]'
                  }`}
                >
                  {/* Row 1: Call ID, Elapsed Timer, and Urgency Badge */}
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Phone
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isSelected ? 'text-cyan-500' : 'text-slate-400'
                        }`}
                      />
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {call.call_id}
                      </span>
                      <span className="flex items-center gap-0.5 text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#141d2c] px-1.5 py-0.2 rounded border border-slate-200 dark:border-[#222f44]">
                        <Clock className="w-2.5 h-2.5" />
                        {elapsedBadge}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border whitespace-nowrap shrink-0 ${getUrgencyBadge(
                        call.urgency_level,
                        call.urgency_score
                      )}`}
                    >
                      {call.urgency_score} • {call.urgency_level}
                    </span>
                  </div>

                  {/* Row 2: Scam Stage Pill + Emotion State */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border truncate ${stageInfo.style}`}
                    >
                      {stageInfo.label}
                    </span>

                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1 shrink-0">
                      <Volume2 className="w-3 h-3 text-slate-400" />
                      <span className="capitalize">{call.dominant_emotion}</span>
                    </span>
                  </div>

                  {/* Row 3: Caller description / scenario title */}
                  <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-1 mb-2 font-normal">
                    {call.caller_tag}
                  </p>

                  {/* Row 4: High-density Urgency progress bar */}
                  <div className="w-full bg-slate-200 dark:bg-[#162133] rounded-full h-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getUrgencyBarColor(
                        call.urgency_score
                      )}`}
                      style={{ width: `${call.urgency_score}%` }}
                    ></div>
                  </div>
                </div>
              );
            })
          )
        ) : savedCases.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
            <Archive className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto mb-1" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No saved cases</p>
            <p className="text-[11px] text-slate-500">Save dossiers from the decision panel to review them offline.</p>
          </div>
        ) : (
          savedCases.map((sc) => (
            <div
              key={sc.call_id}
              className="p-2.5 rounded-lg bg-white dark:bg-[#0b101b] border border-slate-200 dark:border-[#1e293b] hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex items-center justify-between gap-2 shadow-sm"
            >
              <div onClick={() => onSelectCall(sc)} className="flex-1 cursor-pointer min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {sc.call_id}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${getUrgencyBadge(
                      sc.urgency_level,
                      sc.urgency_score
                    )}`}
                  >
                    {sc.urgency_score}/100
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">{sc.caller_tag}</p>
              </div>

              {onDeleteSavedCase && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSavedCase(sc.call_id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded transition-colors shrink-0"
                  title="Remove from saved vault"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-slate-200 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0c121e] flex items-center justify-between text-[11px] text-slate-500">
        <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">1930 Live Intake</span>
        <button
          onClick={onRefreshQueue}
          disabled={isLoading}
          className="text-cyan-600 dark:text-cyan-400 hover:underline transition-colors font-medium"
        >
          {isLoading ? 'Checking...' : 'Refresh'}
        </button>
      </div>
    </div>
  );
}
