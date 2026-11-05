import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  FileText,
  RotateCcw,
  Download,
  Zap,
  Save,
  Check,
  Building,
  ClipboardList,
  Copy,
  ExternalLink,
  Clock,
  Headphones,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { INDICATIVE_DISCLAIMER } from '../mockData';
import BankFreezeModal from './BankFreezeModal';

export default function DecisionSupport({
  activeCall,
  onProcessVoiceCopilot,
  copilotData,
  isProcessingCopilot,
  onExportReport,
  isExporting,
  onSaveCaseLocally,
  isCaseSaved
}) {
  const [completedActions, setCompletedActions] = useState({});
  const [dispatchNotes, setDispatchNotes] = useState('');
  const [submittedTickets, setSubmittedTickets] = useState({});
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
  const [confirmedFreezes, setConfirmedFreezes] = useState({});
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [goldenSecLeft, setGoldenSecLeft] = useState(48 * 60);

  const [caseNotesLog, setCaseNotesLog] = useState([
    {
      id: 1,
      time: '12:04 PM',
      text: 'Call flagged by queue filter based on vocal urgency.',
    },
  ]);

  // Sync Golden Hour countdown with selected call
  useEffect(() => {
    if (activeCall?.call_id) {
      const initialMins = activeCall.urgency_score > 85 ? 42 : 52;
      setGoldenSecLeft(initialMins * 60);
    }
  }, [activeCall?.call_id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setGoldenSecLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const insights = activeCall?.triage_insights || {
    crime_category: 'General Cyber Incident',
    recommended_actions: [
      'Verify caller location and determine if immediate financial transfers occurred.',
      'Advise caller to hold all outgoing transactions and stop sharing screen.',
      'Log incident docket on 1930 portal.',
    ],
    explainability_summary: 'Pending triage analysis.',
    indicative_disclaimer: INDICATIVE_DISCLAIMER,
  };

  const extractedEntities =
    activeCall?.extracted_entities ||
    activeCall?.triage_insights?.extracted_entities ||
    {};

  const actions = (copilotData && copilotData.updated_actions) || insights.recommended_actions || [];

  const toggleAction = (idx) => {
    setCompletedActions((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleProcessCopilotSubmit = () => {
    if (!dispatchNotes.trim() || isProcessingCopilot) return;
    onProcessVoiceCopilot(dispatchNotes.trim());
    const newLog = {
      id: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: dispatchNotes.trim(),
    };
    setCaseNotesLog((prev) => [newLog, ...prev]);
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      handleProcessCopilotSubmit();
    }
  };

  const handleClearNote = () => {
    setDispatchNotes('');
  };

  // 1930 ticket draft derived from copilot or activeCall entities
  const ticketDraft =
    copilotData?.ncrp_1930_ticket_draft ||
    (extractedEntities?.amount || extractedEntities?.mule_upi
      ? {
          ticket_id: `1930-NCRP-${activeCall?.call_id ? activeCall.call_id.replace(/[^0-9]/g, '') : '2026-0891'}`,
          call_id: activeCall?.call_id,
          incident_category: activeCall?.triage_insights?.crime_category || 'Financial Cyber Fraud',
          amount_involved: extractedEntities.amount || '₹45,000',
          payment_channel: extractedEntities.mule_upi ? 'PhonePe (UPI)' : 'Bank IMPS/RTGS',
          priority: 'IMMEDIATE_FREEZE',
          freeze_target: extractedEntities.mule_upi || 'Beneficiary Bank Node',
          mule_upi: extractedEntities.mule_upi || 'cbi.officer.desk@sbi',
          utr_number: extractedEntities.utr_number || 'UTR-2026-9812-4112',
          status: 'DRAFT_PENDING_DISPATCH',
          golden_hour_window_remaining: '48 mins (Golden Hour)',
        }
      : null);

  const currentTicketId = ticketDraft?.ticket_id;
  const confirmedFreeze = currentTicketId ? confirmedFreezes[currentTicketId] : null;

  const handleConfirmFreeze = (freezeRecord) => {
    const tId = freezeRecord.ticketId || currentTicketId || '1930-NCRP-2026';
    setConfirmedFreezes((prev) => ({
      ...prev,
      [tId]: freezeRecord,
    }));
    setSubmittedTickets((prev) => ({
      ...prev,
      [tId]: true,
    }));

    const newLog = {
      id: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `[1930 CFMS] Administrative Lien Confirmed (${freezeRecord.tokenId}). Amount ${freezeRecord.amount || ticketDraft?.amount_involved} encumbered on ${freezeRecord.targetAccount || 'mule account'} under Sec 102 CrPC.`,
    };
    setCaseNotesLog((prev) => [newLog, ...prev]);
  };

  const handleCopyTicketToken = (token) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(token);
    }
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  // Golden Hour Tier Calculation
  const minsLeft = Math.floor(goldenSecLeft / 60);
  const secsLeft = goldenSecLeft % 60;
  const elapsedMin = 60 - minsLeft;

  const getGoldenTier = () => {
    if (elapsedMin <= 15) {
      return {
        title: '0-15m: Tier 1 Mule Account',
        recoveryPct: '92%',
        recoveryLabel: 'Estimated recovery: 92%',
        theme: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40',
        barColor: 'bg-emerald-500',
        badge: 'bg-emerald-500/20 text-emerald-300',
      };
    }
    if (elapsedMin <= 45) {
      return {
        title: '15-45m: Tier 2 Multi-Hop Dispersion',
        recoveryPct: '48%',
        recoveryLabel: 'Estimated recovery: 48%',
        theme: 'text-amber-400 border-amber-500/30 bg-amber-950/40',
        barColor: 'bg-amber-500',
        badge: 'bg-amber-500/20 text-amber-300',
      };
    }
    return {
      title: '45-60m: ATM Cashout / Crypto Drain Risk',
      recoveryPct: '<12%',
      recoveryLabel: 'Estimated recovery: <12%',
      theme: 'text-rose-400 border-rose-500/30 bg-rose-950/40',
      barColor: 'bg-rose-500',
      badge: 'bg-rose-500/20 text-rose-300',
    };
  };

  const goldenTier = getGoldenTier();

  // Attack Stage Stepper derivation
  const getActiveStageNumber = () => {
    const stage = activeCall?.scam_stage || activeCall?.triage_insights?.scam_stage;
    if (typeof stage === 'number') return stage;
    if (typeof stage === 'object' && stage?.stage_number) return stage.stage_number;
    const text = (activeCall?.transcript?.raw_redacted || '').toLowerCase();
    if (text.includes('anydesk') || text.includes('apk') || text.includes('screen share')) return 3;
    if (text.includes('transfer') || text.includes('upi') || text.includes('utr') || text.includes('otp')) return 4;
    if (text.includes('video call') || text.includes('arrest') || text.includes('blackmail')) return 2;
    return 1;
  };

  const activeStageNum = getActiveStageNumber();

  const ATTACK_STAGES = [
    { num: 1, name: 'Impersonation', desc: 'CBI / Police / Courier' },
    { num: 2, name: 'Coercion', desc: 'Digital Arrest / Sextortion' },
    { num: 3, name: 'Infiltration', desc: 'AnyDesk / APK Session' },
    { num: 4, name: 'Liquidation', desc: 'Mule Routing / OTP Drain' },
  ];

  const getStageTacticalAction = () => {
    if (activeCall?.scam_stage?.next_action) return activeCall.scam_stage.next_action;
    switch (activeStageNum) {
      case 1:
        return 'Action: Instruct victim to verify caller identity on cybercrime.gov.in and sever unverified inbound call.';
      case 2:
        return 'Action: Break video call isolation immediately, reassure victim that police never arrest via video, reject extortion.';
      case 3:
        return 'Action: Order caller to toggle Airplane mode or turn off Wi-Fi right now to disconnect remote APK session.';
      case 4:
      default:
        return 'Action: Break video call, issue 1930 freeze on beneficiary mule accounts and transaction UTR.';
    }
  };

  // Live Operator De-escalation Teleprompter
  const getTeleprompterPrompt = () => {
    const text = (activeCall?.transcript?.raw_redacted || '').toLowerCase();
    const emotion = activeCall?.dominant_emotion || 'fear';

    if (text.includes('anydesk') || text.includes('quicksupport') || text.includes('apk') || text.includes('screen share')) {
      return {
        tag: 'Infiltration Interdiction',
        script: "Say: 'Immediately turn off your phone\'s WiFi or toggle Airplane mode right now to disconnect the scammer\'s screen share.'",
        type: 'critical',
      };
    }

    if (text.includes('sextortion') || text.includes('blackmail') || text.includes('kill myself') || text.includes('leak video')) {
      return {
        tag: 'Crisis De-escalation',
        script: "Say: 'Sir/Madam, stay calm and do not pay any money. You are completely safe. Morphing videos is a common extortion tactic and we are taking down the links right now.'",
        type: 'reassurance',
      };
    }

    if (emotion === 'fear' || emotion === 'distress' || text.includes('digital arrest') || text.includes('cbi') || text.includes('police')) {
      return {
        tag: 'Digital Arrest De-escalation',
        script: "Say: 'Sir/Madam, take a deep breath. State police and CBI never make arrest video calls. Your bank account is safe and we are encumbering the funds right now.'",
        type: 'reassurance',
      };
    }

    return {
      tag: 'Operator Guidance',
      script: "Say: 'We have logged your incident docket on 1930 NCRP. Please keep transaction UTR and beneficiary handles ready while we place administrative liens.'",
      type: 'standard',
    };
  };

  const teleprompter = getTeleprompterPrompt();

  const handleCopyTeleprompter = () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(teleprompter.script);
    }
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-[#080d16] border border-slate-200 dark:border-[#1e293b] rounded-xl flex flex-col h-full min-h-0 overflow-hidden shadow-sm transition-colors">
      {/* Panel Header */}
      <div className="px-3.5 py-2 border-b border-slate-200 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0c121e] flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
          <ClipboardList className="w-4 h-4 text-cyan-400" />
          Incident Command & Decision Support
        </h2>

        {/* Action Buttons */}
        {activeCall && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSaveCaseLocally && onSaveCaseLocally(activeCall)}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border transition-colors ${
                isCaseSaved
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-600/70 text-emerald-800 dark:text-emerald-300'
                  : 'bg-white dark:bg-[#121927] border-slate-300 dark:border-[#222f44] text-slate-700 dark:text-slate-300 hover:border-slate-400'
              }`}
              title="Save case to local browser vault"
            >
              {isCaseSaved ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Save className="w-3 h-3 text-slate-400" />
                  <span>Save</span>
                </>
              )}
            </button>

            <button
              onClick={onExportReport}
              disabled={isExporting}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-slate-900 dark:bg-slate-200 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-950 rounded transition-colors shadow-sm"
              title="Export Section 65B Certified Forensic Dossier"
            >
              <Download className="w-3 h-3" />
              <span>{isExporting ? 'Exporting...' : 'Export Dossier'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-3 sm:p-3.5 space-y-2.5 overflow-y-auto flex-1 min-h-0">
        {activeCall ? (
          <>
            {/* 1. Golden Hour Countdown Clock Widget */}
            <div className="bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e293b] rounded-lg p-3 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    Golden Hour Interdiction Countdown
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-amber-500 dark:text-amber-300">
                  {minsLeft}m {secsLeft < 10 ? '0' : ''}{secsLeft}s remaining
                </span>
              </div>

              {/* Progress Bar with Tier Zones */}
              <div className="space-y-1">
                <div className="w-full bg-slate-200 dark:bg-[#162133] rounded-full h-2 overflow-hidden relative">
                  <div
                    className={`h-full transition-all duration-1000 ${goldenTier.barColor}`}
                    style={{ width: `${Math.max(5, Math.min(100, (goldenSecLeft / 3600) * 100))}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  <span>0m (Triage)</span>
                  <span>15m (Tier 1)</span>
                  <span>45m (Tier 2 Multi-Hop)</span>
                  <span>60m (ATM/Crypto)</span>
                </div>
              </div>

              {/* Active Dispersion Tier Badge */}
              <div className={`p-2 rounded border flex items-center justify-between text-xs ${goldenTier.theme}`}>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-current animate-ping"></span>
                  <span className="font-semibold">{goldenTier.title}</span>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-current/30 ${goldenTier.badge}`}>
                  {goldenTier.recoveryLabel}
                </span>
              </div>
            </div>

            {/* 2. Attack Stage Visual Stepper */}
            <div className="bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e293b] rounded-lg p-3 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Scam Modus Operandi (MO) Attack Stage
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  Active: Stage {activeStageNum}
                </span>
              </div>

              {/* 4-Step Stepper Bar */}
              <div className="grid grid-cols-4 gap-1.5">
                {ATTACK_STAGES.map((step) => {
                  const isCurrent = step.num === activeStageNum;
                  const isPast = step.num < activeStageNum;

                  let stepStyle = 'bg-slate-100 dark:bg-[#121927] border-slate-200 dark:border-[#1e293b] text-slate-400';
                  if (isCurrent) {
                    stepStyle =
                      'bg-rose-500/15 dark:bg-rose-950/60 border-rose-500/70 text-rose-300 shadow-sm shadow-rose-950/30';
                  } else if (isPast) {
                    stepStyle =
                      'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-400';
                  }

                  return (
                    <div
                      key={step.num}
                      className={`p-2 rounded-md border text-center transition-all ${stepStyle}`}
                    >
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        {isPast ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <span
                            className={`w-3.5 h-3.5 rounded-full text-[9px] font-mono flex items-center justify-center font-bold ${
                              isCurrent ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            {step.num}
                          </span>
                        )}
                        <span className="text-[11px] font-bold truncate">{step.name}</span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 block truncate">
                        {step.desc}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Immediate Tactical Recommendation */}
              <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 flex items-start gap-2 text-xs text-amber-300">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-current shrink-0 mt-0.5" />
                <span className="font-semibold leading-relaxed">
                  {getStageTacticalAction()}
                </span>
              </div>
            </div>

            {/* 3. Live Operator De-escalation Teleprompter */}
            <div className="bg-slate-50 dark:bg-[#0c121e] border border-cyan-500/30 rounded-lg p-3 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Headphones className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    Live Operator De-escalation Teleprompter
                  </span>
                </div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-950/70 text-cyan-300 border border-cyan-700/50">
                  {teleprompter.tag}
                </span>
              </div>

              {/* Script Body */}
              <div className="bg-white dark:bg-[#080d16] border border-slate-200 dark:border-[#1e293b] p-2.5 rounded-md text-xs leading-relaxed text-slate-800 dark:text-slate-200 font-medium relative group">
                <p className="italic text-cyan-200">
                  {teleprompter.script}
                </p>

                <div className="mt-2 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={handleCopyTeleprompter}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-medium rounded bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 transition-colors"
                  >
                    {copiedPrompt ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copied Script</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Script</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Incident Classification */}
            <div className="bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e293b] rounded-lg p-2.5 space-y-1">
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block font-semibold uppercase tracking-wider">
                Incident Classification
              </span>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {insights.crime_category}
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {insights.explainability_summary}
              </p>
            </div>

            {/* 1930 Account Freeze Request Card */}
            {ticketDraft && (
              <div
                className={`rounded-lg p-3 space-y-2 border transition-all ${
                  confirmedFreeze
                    ? 'bg-emerald-50/70 dark:bg-[#091512] border-emerald-400 dark:border-emerald-600/50 shadow-sm shadow-emerald-950/20'
                    : 'bg-amber-50/70 dark:bg-[#121927] border-amber-300 dark:border-amber-600/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider ${
                      confirmedFreeze
                        ? 'text-emerald-900 dark:text-emerald-200'
                        : 'text-amber-900 dark:text-amber-200'
                    }`}
                  >
                    {confirmedFreeze ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Building className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    1930 Account Freeze Request
                  </span>

                  {confirmedFreeze ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/90 border border-emerald-400 dark:border-emerald-600 text-emerald-800 dark:text-emerald-300 font-bold uppercase tracking-wider">
                      LIEN CONFIRMED &amp; SECURED
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700/60 text-amber-800 dark:text-amber-300 font-medium">
                      {ticketDraft.priority}
                    </span>
                  )}
                </div>

                {/* Confirmed Token Display Bar */}
                {confirmedFreeze && (
                  <div className="bg-white dark:bg-[#06120e] p-2.5 rounded-md border border-emerald-300 dark:border-emerald-600/60 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono uppercase text-emerald-700 dark:text-emerald-400 font-semibold block">
                        Freeze Token (Sec 102 CrPC)
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-950 dark:text-emerald-200 truncate block">
                        {confirmedFreeze.tokenId}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyTicketToken(confirmedFreeze.tokenId)}
                      className="flex-shrink-0 text-[11px] font-mono px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 flex items-center gap-1 transition-colors"
                      title="Copy Freeze Token"
                    >
                      {copiedToken ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <div className="bg-white dark:bg-[#080d16] p-2 rounded border border-slate-200 dark:border-[#1e293b]">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">Docket</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 truncate block font-semibold">
                      {ticketDraft.ticket_id}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-[#080d16] p-2 rounded border border-slate-200 dark:border-[#1e293b]">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">Amount</span>
                    <strong
                      className={
                        confirmedFreeze
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-amber-700 dark:text-amber-300'
                      }
                    >
                      {ticketDraft.amount_involved}
                    </strong>
                  </div>
                  <div className="bg-white dark:bg-[#080d16] p-2 rounded border border-slate-200 dark:border-[#1e293b]">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">Channel</span>
                    <span className="text-slate-800 dark:text-slate-200 truncate block font-medium">
                      {ticketDraft.payment_channel}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-[#080d16] p-2 rounded border border-slate-200 dark:border-[#1e293b]">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">Status</span>
                    <span
                      className={`font-semibold ${
                        confirmedFreeze
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {confirmedFreeze ? 'Lien Active' : ticketDraft.golden_hour_window_remaining || 'Active window'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFreezeModalOpen(true)}
                  className={`w-full py-1.5 px-3 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                    confirmedFreeze
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-900/40'
                      : 'bg-amber-600 hover:bg-amber-500 text-white shadow-sm'
                  }`}
                >
                  {confirmedFreeze ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>View 1930 Lien Gateway Dossier</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Dispatch 1930 Freeze Directive</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Action Checklist */}
            <div className="bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e293b] rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Response Checklist
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {Object.values(completedActions).filter(Boolean).length} / {actions.length} completed
                </span>
              </div>

              <div className="space-y-1.5">
                {actions.map((act, idx) => {
                  const isChecked = !!completedActions[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleAction(idx)}
                      className={`p-2 rounded-md border text-xs cursor-pointer flex items-start gap-2 transition-colors ${
                        isChecked
                          ? 'bg-slate-100 dark:bg-[#070b12] border-slate-200 dark:border-emerald-800/40 text-slate-400 line-through'
                          : 'bg-white dark:bg-[#121927] border-slate-200 dark:border-[#1e293b] text-slate-800 dark:text-slate-200 hover:border-cyan-500'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 rounded border-slate-300 text-cyan-600 cursor-pointer"
                      />
                      <span className="leading-snug">{act}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dispatch Notes */}
            <div className="bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e293b] rounded-lg p-3 space-y-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                Dispatch Notes &amp; Intake Log
              </span>

              <textarea
                rows={2}
                value={dispatchNotes}
                onChange={(e) => setDispatchNotes(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type notes (e.g. 'Caller confirms transfer of 45,000 sent via PhonePe, initiate 1930 freeze')..."
                className="w-full bg-white dark:bg-[#080d16] border border-slate-300 dark:border-[#1e293b] rounded-md p-2 text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none font-sans"
              />

              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={handleClearNote}
                  className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded border border-slate-300 dark:border-[#1e293b] transition-colors"
                >
                  Clear
                </button>

                <button
                  onClick={handleProcessCopilotSubmit}
                  disabled={!dispatchNotes.trim() || isProcessingCopilot}
                  className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${
                    dispatchNotes.trim() && !isProcessingCopilot
                      ? 'bg-slate-900 dark:bg-slate-200 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-950 shadow-sm'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>{isProcessingCopilot ? 'Processing...' : 'Apply note'}</span>
                </button>
              </div>

              {/* Audit Log */}
              {caseNotesLog.length > 0 && (
                <div className="pt-2 border-t border-slate-200 dark:border-[#1e293b] space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 block font-semibold uppercase tracking-wider">
                    Incident History Log
                  </span>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {caseNotesLog.map((log) => (
                      <div
                        key={log.id}
                        className="p-1.5 rounded bg-white dark:bg-[#080d16] border border-slate-200 dark:border-[#1e293b] text-[11px] text-slate-700 dark:text-slate-300 font-sans"
                      >
                        <span className="text-[10px] text-slate-400 block font-mono">{log.time}</span>
                        <p>{log.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center text-center p-6 text-xs text-slate-500 space-y-1.5">
            <ClipboardList className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-1" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">Awaiting incident</p>
            <p className="text-[11px] text-slate-500">
              Active incident details and response playbooks will appear here once a call is selected or analyzed.
            </p>
          </div>
        )}
      </div>

      {/* Simulated NPCI / Bank Rapid Freeze Gateway Modal */}
      <BankFreezeModal
        isOpen={isFreezeModalOpen}
        onClose={() => setIsFreezeModalOpen(false)}
        ticketDraft={ticketDraft}
        extractedEntities={extractedEntities}
        onConfirmFreeze={handleConfirmFreeze}
        initialConfirmedRecord={confirmedFreeze}
      />
    </div>
  );
}
