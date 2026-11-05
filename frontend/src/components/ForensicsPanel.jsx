import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Mic,
  Play,
  Pause,
  Activity,
  AudioWaveform,
  Volume2,
  FileAudio,
  Radio,
  FileCheck,
  Copy,
  Check,
  ShieldAlert,
  Smartphone,
  CreditCard,
  Send,
  Building,
  Zap,
  ExternalLink,
  Lock
} from 'lucide-react';
import { cyberAudioPlayer } from '../services/audioSynthesizer';
import PitchContourCanvas from './PitchContourCanvas';

export default function ForensicsPanel({
  activeCall,
  onAnalyzeAudioFile,
  onSimulateScenario,
  isAnalyzing,
  onStreamAudioChunk
}) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'mic' | 'simulate'
  const [isRecording, setIsRecording] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [transcriptHint, setTranscriptHint] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioPlaybackSec, setAudioPlaybackSec] = useState(0);
  const [audioDurationSec, setAudioDurationSec] = useState(10);
  const [audioVolume, setAudioVolume] = useState(0.85);
  const [liveSpeechText, setLiveSpeechText] = useState('');
  const [chipFeedback, setChipFeedback] = useState({});

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const micStreamRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const capturedWordsRef = useRef('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    onAnalyzeAudioFile(uploadFile, transcriptHint);
  };

  useEffect(() => {
    return () => {
      cyberAudioPlayer.stop();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // Stop audio playback immediately when switching calls
  useEffect(() => {
    cyberAudioPlayer.stop();
    setIsPlayingAudio(false);
    setAudioPlaybackSec(0);
    setChipFeedback({});
  }, [activeCall?.call_id]);

  // Stop audio and recording if active tab changes
  useEffect(() => {
    cyberAudioPlayer.stop();
    setIsPlayingAudio(false);
    setAudioPlaybackSec(0);
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {}
      }
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      setIsRecording(false);
    }
  }, [activeTab]);

  const toggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {}
      }
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      setIsRecording(false);
    } else {
      try {
        setLiveSpeechText('');
        capturedWordsRef.current = '';
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;

        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;

        // Browser Speech Recognition for real spoken words
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRec) {
          try {
            const rec = new SpeechRec();
            rec.continuous = true;
            rec.interimResults = true;
            rec.lang = 'en-US';
            rec.onresult = (evt) => {
              const words = Array.from(evt.results)
                .map((r) => r[0].transcript)
                .join(' ');
              capturedWordsRef.current = words;
              setLiveSpeechText(words);
            };
            rec.start();
            speechRecognitionRef.current = rec;
          } catch (e) {}
        }

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
            if (onStreamAudioChunk) {
              onStreamAudioChunk(event.data);
            }
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const file = new File([audioBlob], 'live_recording.wav', { type: 'audio/wav' });
          const spoken = capturedWordsRef.current ? capturedWordsRef.current.trim() : '';
          const finalHint = spoken || transcriptHint || '';
          onAnalyzeAudioFile(file, finalHint);
        };

        mediaRecorder.start(2000);
        setIsRecording(true);
      } catch (err) {
        alert('Microphone access unavailable: ' + err.message);
      }
    }
  };

  const togglePlayAudio = () => {
    if (isPlayingAudio) {
      cyberAudioPlayer.pause();
      setIsPlayingAudio(false);
    } else {
      if (uploadFile && activeTab === 'upload') {
        cyberAudioPlayer.playUploadedFile(
          uploadFile,
          (curr, dur) => {
            setAudioPlaybackSec(curr);
            setAudioDurationSec(dur);
          },
          () => setIsPlayingAudio(false)
        );
      } else if (activeCall) {
        cyberAudioPlayer.playScenario(
          activeCall,
          (curr, dur) => {
            setAudioPlaybackSec(curr);
            setAudioDurationSec(dur);
          },
          () => setIsPlayingAudio(false)
        );
      }
      setIsPlayingAudio(true);
    }
  };

  const handleSeek = (target) => {
    const newSec = typeof target === 'number' ? target : parseFloat(target?.target?.value || 0);
    setAudioPlaybackSec(newSec);
    cyberAudioPlayer.seek(newSec);
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setAudioVolume(vol);
    cyberAudioPlayer.setVolume(vol);
  };

  const handleChipAction = (key, textToCopy, feedbackText) => {
    if (textToCopy && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(textToCopy);
    }
    setChipFeedback((prev) => ({ ...prev, [key]: feedbackText }));
    setTimeout(() => {
      setChipFeedback((prev) => ({ ...prev, [key]: null }));
    }, 2000);
  };

  const getEmotionColor = (emotion) => {
    switch (emotion) {
      case 'fear':
        return {
          bar: 'bg-rose-500',
          text: 'text-rose-600 dark:text-rose-400',
          badge: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
        };
      case 'distress':
        return {
          bar: 'bg-amber-500',
          text: 'text-amber-600 dark:text-amber-400',
          badge: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
        };
      case 'nervousness':
        return {
          bar: 'bg-yellow-400',
          text: 'text-yellow-600 dark:text-yellow-300',
          badge: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/60 dark:text-yellow-300 dark:border-yellow-800/60',
        };
      case 'anger':
        return {
          bar: 'bg-red-500',
          text: 'text-red-600 dark:text-red-400',
          badge: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800/60',
        };
      case 'neutral':
      default:
        return {
          bar: 'bg-slate-400',
          text: 'text-slate-600 dark:text-slate-300',
          badge: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700',
        };
    }
  };

  const emotionProbs = activeCall?.emotion_probabilities || {
    fear: 0.2,
    distress: 0.2,
    nervousness: 0.2,
    anger: 0.2,
    neutral: 0.2,
  };

  const biomarkers = activeCall?.acoustic_biomarkers || {
    pitch_hz: 180.0,
    jitter_tremor_pct: 1.5,
    speech_rate_sps: 4.2,
    rms_energy_db: -20.0,
    vocal_anomaly: 'Signal stable.',
    voice_activity_ratio: 0.85,
    confidence_score: 0.90,
  };

  const transcript = activeCall?.transcript || {
    raw_redacted: 'No transcript recorded.',
    pii_masked_count: 0,
    detected_keywords: [],
  };

  const timeline = activeCall?.timeline_segments || [];

  const extractedEntities =
    activeCall?.extracted_entities ||
    activeCall?.triage_insights?.extracted_entities ||
    {};

  // Urgency Math Explainability Formula
  const pitchDelta = Math.max(0, Math.round(biomarkers.pitch_hz - 140));
  const detectedKws = transcript.detected_keywords || [];
  const primaryThreat =
    detectedKws.slice(0, 2).map((k) => k.toUpperCase()).join(', ') ||
    (activeCall?.triage_insights?.crime_category ? activeCall.triage_insights.crime_category.slice(0, 24) : 'EXTORTION VECTOR');
  const urgencyScore = activeCall?.urgency_score || 85;

  const renderHighlightedTranscript = (rawText, keywords = []) => {
    if (!rawText) return null;
    const piiRegex = /(\[REDACTED-[A-Za-z]+\])/g;
    const parts = rawText.split(piiRegex);

    return parts.map((part, idx) => {
      if (part.startsWith('[REDACTED-')) {
        const label = part.replace('[REDACTED-', '').replace(']', '');
        return (
          <span
            key={idx}
            className="inline-flex items-center font-mono text-[10px] font-semibold bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 px-1.5 py-0.5 rounded mx-1"
          >
            {label} masked
          </span>
        );
      }

      if (keywords.length === 0) return <span key={idx}>{part}</span>;

      const escapedKws = keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      const kwRegex = new RegExp(`(${escapedKws.join('|')})`, 'gi');
      const kwParts = part.split(kwRegex);

      return (
        <span key={idx}>
          {kwParts.map((subPart, sIdx) => {
            const isMatch = keywords.some(
              (kw) => kw.toLowerCase() === subPart.toLowerCase()
            );
            if (isMatch) {
              return (
                <span
                  key={sIdx}
                  className="font-semibold text-rose-700 dark:text-rose-300 underline decoration-rose-400 underline-offset-2 px-1 bg-rose-50 dark:bg-rose-950/40 rounded"
                >
                  {subPart}
                </span>
              );
            }
            return <span key={sIdx}>{subPart}</span>;
          })}
        </span>
      );
    });
  };

  return (
    <div className="bg-white dark:bg-[#080d16] border border-slate-200 dark:border-[#1e293b] rounded-xl flex flex-col h-full min-h-0 overflow-hidden shadow-sm transition-colors">
      {/* Panel Top Mode Tabs */}
      <div className="px-3.5 py-2 border-b border-slate-200 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0c121e] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
            Acoustic Forensics & Biomarker Telemetry
          </h2>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center bg-slate-200/80 dark:bg-[#121927] p-0.5 rounded-lg border border-slate-300 dark:border-[#222f44] text-xs">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
              activeTab === 'upload'
                ? 'bg-white dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-300 border border-slate-300 dark:border-cyan-700/50 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload</span>
          </button>

          <button
            onClick={() => setActiveTab('mic')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
              activeTab === 'mic'
                ? 'bg-white dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-300 border border-slate-300 dark:border-cyan-700/50 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Live Mic</span>
          </button>

          <button
            onClick={() => setActiveTab('simulate')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
              activeTab === 'simulate'
                ? 'bg-white dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-300 border border-slate-300 dark:border-cyan-700/50 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Scenarios</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-3 sm:p-3.5 space-y-2.5 overflow-y-auto flex-1 min-h-0">
        {/* Mode Controller */}
        {activeTab === 'upload' && (
          <form
            onSubmit={handleUploadSubmit}
            className="bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e293b] rounded-lg p-2.5 flex flex-col md:flex-row items-center gap-2"
          >
            <div className="flex-1 w-full flex items-center gap-2">
              <label className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#141d2c] border border-slate-300 dark:border-[#24334a] rounded-md cursor-pointer hover:border-cyan-500 text-xs text-slate-700 dark:text-slate-200 shrink-0 transition-colors shadow-sm">
                <FileAudio className="w-3.5 h-3.5 text-cyan-400" />
                <span className="truncate max-w-[130px]">
                  {uploadFile ? uploadFile.name : 'Select .wav file'}
                </span>
                <input
                  type="file"
                  accept="audio/wav,audio/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              <input
                type="text"
                placeholder="Optional incident audio context hint..."
                value={transcriptHint}
                onChange={(e) => setTranscriptHint(e.target.value)}
                className="flex-1 bg-white dark:bg-[#080d16] border border-slate-300 dark:border-[#1e293b] rounded-md px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={!uploadFile || isAnalyzing}
              className={`w-full md:w-auto px-4 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors shrink-0 ${
                !uploadFile || isAnalyzing
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm'
              }`}
            >
              {isAnalyzing ? (
                <span>Analyzing...</span>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Analyze</span>
                </>
              )}
            </button>
          </form>
        )}

        {activeTab === 'mic' && (
          <div className="bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e293b] rounded-lg p-2.5 space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-400'
                  }`}
                ></div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                    {isRecording ? 'Listening via microphone' : 'Microphone standby'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    {liveSpeechText ? `Spoken: "${liveSpeechText}"` : 'Real-time speech recognition active'}
                  </p>
                </div>
              </div>

              <button
                onClick={toggleRecording}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{isRecording ? 'Stop input' : 'Start microphone'}</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'simulate' && (
          <div className="bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e293b] rounded-lg p-2.5 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-semibold">
              Simulate Tactical Cyber Threat Scenarios
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { id: 'digital_arrest', label: 'Digital arrest', tag: 'High Fear • Stage 4' },
                { id: 'upi_fraud', label: 'Remote APK drain', tag: 'Distress • Stage 3' },
                { id: 'distressed_victim', label: 'Sextortion threat', tag: 'Critical • Stage 2' },
                { id: 'informant', label: 'Mule ring tip', tag: 'Tension • Stage 4' },
              ].map((scen) => (
                <button
                  key={scen.id}
                  onClick={() => onSimulateScenario(scen.id)}
                  className="p-2 rounded-md bg-white dark:bg-[#121927] border border-slate-200 dark:border-[#1e293b] hover:border-cyan-500 text-left transition-colors shadow-sm"
                >
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-200">{scen.label}</div>
                  <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono mt-0.5">{scen.tag}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Audio Player Bar */}
        {activeCall && (
          <div className="bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e293b] rounded-lg p-2 flex items-center justify-between gap-3">
            <button
              onClick={togglePlayAudio}
              className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors shrink-0 shadow-sm ${
                isPlayingAudio
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-900 dark:bg-slate-200 text-white dark:text-slate-950'
              }`}
              title={isPlayingAudio ? 'Pause' : 'Play call audio'}
            >
              {isPlayingAudio ? (
                <Pause className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              )}
            </button>

            <div className="flex-1 flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-500 w-8">
                {Math.floor(audioPlaybackSec)}s
              </span>
              <input
                type="range"
                min="0"
                max={audioDurationSec || 10}
                step="0.1"
                value={audioPlaybackSec}
                onChange={handleSeek}
                className="flex-1 h-1 bg-slate-200 dark:bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <span className="text-[11px] font-mono text-slate-500 w-8 text-right">
                {Math.floor(audioDurationSec)}s
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
              <Volume2 className="w-3.5 h-3.5" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={audioVolume}
                onChange={handleVolumeChange}
                className="w-14 h-1 bg-slate-200 dark:bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          </div>
        )}

        {/* Real-Time Pitch-Contour & Vocal Tremor Canvas */}
        {(activeCall || isRecording) && (
          <PitchContourCanvas
            timelineSegments={timeline}
            biomarkers={biomarkers}
            currentTime={audioPlaybackSec}
            duration={audioDurationSec}
            isPlaying={isPlayingAudio || isRecording}
            onSeek={handleSeek}
          />
        )}

        {/* Urgency Math Breakdown Pill */}
        {activeCall && (
          <div className="bg-slate-900 dark:bg-[#070b12] border border-cyan-500/30 rounded-lg p-2.5 font-mono text-[11px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/70 border border-cyan-800/60 px-1.5 py-0.5 rounded tracking-wider whitespace-nowrap">
                FUSION FORMULA
              </span>
              <span className="text-slate-300 leading-snug">
                [60% Vocal Strain: Pitch +{pitchDelta}Hz, Jitter {biomarkers.jitter_tremor_pct}%] + [40% Extortion Threat: {primaryThreat}]
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0 font-bold text-cyan-300 bg-cyan-950/90 border border-cyan-600/60 px-2 py-0.5 rounded whitespace-nowrap">
              = Score {urgencyScore}/100
            </div>
          </div>
        )}

        {/* Extracted Cybercrime Entities Board */}
        {activeCall && (
          <div className="bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e293b] rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Extracted Cybercrime Entities Board
                </span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded-full">
                1-Click Response Actions
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {/* Target Amount Chip */}
              <div className="bg-white dark:bg-[#080d16] border border-slate-200 dark:border-[#1e293b] p-2 rounded-md flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-amber-400" />
                    Target Amount
                  </span>
                  <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-300 truncate block">
                    {extractedEntities.amount || '₹45,000'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleChipAction('amount', extractedEntities.amount || '₹45,000', 'Copied!')
                  }
                  className="px-2 py-1 text-[10px] font-mono font-medium rounded bg-slate-100 dark:bg-[#151f30] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#28384f] hover:border-cyan-500 transition-colors shrink-0"
                >
                  {chipFeedback['amount'] ? (
                    <span className="text-emerald-400 font-semibold">{chipFeedback['amount']}</span>
                  ) : (
                    'Copy'
                  )}
                </button>
              </div>

              {/* Mule UPI ID Chip */}
              <div className="bg-white dark:bg-[#080d16] border border-slate-200 dark:border-[#1e293b] p-2 rounded-md flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block flex items-center gap-1">
                    <Send className="w-3 h-3 text-rose-400" />
                    Mule UPI Handle
                  </span>
                  <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-300 truncate block">
                    {extractedEntities.mule_upi || 'cbi.officer.desk@sbi'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleChipAction(
                      'mule',
                      extractedEntities.mule_upi || 'cbi.officer.desk@sbi',
                      'Flagged!'
                    )
                  }
                  className="px-2 py-1 text-[10px] font-mono font-medium rounded bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors shrink-0"
                >
                  {chipFeedback['mule'] ? (
                    <span className="text-emerald-400 font-semibold">{chipFeedback['mule']}</span>
                  ) : (
                    'Flag Mule'
                  )}
                </button>
              </div>

              {/* Transaction UTR Chip */}
              <div className="bg-white dark:bg-[#080d16] border border-slate-200 dark:border-[#1e293b] p-2 rounded-md flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block flex items-center gap-1">
                    <FileCheck className="w-3 h-3 text-cyan-400" />
                    Bank UTR Reference
                  </span>
                  <span className="font-mono text-xs font-bold text-cyan-700 dark:text-cyan-300 truncate block">
                    {extractedEntities.utr_number || 'UTR-2026-9812-4112'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleChipAction(
                      'utr',
                      extractedEntities.utr_number || 'UTR-2026-9812-4112',
                      'Copied!'
                    )
                  }
                  className="px-2 py-1 text-[10px] font-mono font-medium rounded bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 transition-colors shrink-0"
                >
                  {chipFeedback['utr'] ? (
                    <span className="text-emerald-400 font-semibold">{chipFeedback['utr']}</span>
                  ) : (
                    'Copy UTR'
                  )}
                </button>
              </div>

              {/* Remote APK Session Chip */}
              {extractedEntities.remote_apk ? (
                <div className="bg-white dark:bg-[#080d16] border border-slate-200 dark:border-[#1e293b] p-2 rounded-md flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block flex items-center gap-1">
                      <Smartphone className="w-3 h-3 text-purple-400" />
                      Remote APK Session
                    </span>
                    <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-300 truncate block">
                      {extractedEntities.remote_apk}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleChipAction('apk', extractedEntities.remote_apk, 'Kill Sent!')
                    }
                    className="px-2 py-1 text-[10px] font-mono font-medium rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors shrink-0"
                  >
                    {chipFeedback['apk'] ? (
                      <span className="text-emerald-400 font-semibold">{chipFeedback['apk']}</span>
                    ) : (
                      'Kill APK'
                    )}
                  </button>
                </div>
              ) : null}

              {/* Impersonated Agency Chip */}
              {extractedEntities.impersonated_agency ? (
                <div className="bg-white dark:bg-[#080d16] border border-slate-200 dark:border-[#1e293b] p-2 rounded-md flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block flex items-center gap-1">
                      <Building className="w-3 h-3 text-blue-400" />
                      Impersonated Agency
                    </span>
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-300 truncate block">
                      {extractedEntities.impersonated_agency}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleChipAction(
                        'agency',
                        extractedEntities.impersonated_agency,
                        'Flagged!'
                      )
                    }
                    className="px-2 py-1 text-[10px] font-mono font-medium rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors shrink-0"
                  >
                    {chipFeedback['agency'] ? (
                      <span className="text-emerald-400 font-semibold">{chipFeedback['agency']}</span>
                    ) : (
                      'Flag Agency'
                    )}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Emotion Breakdown */}
        {activeCall ? (
          <>
            <div className="bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e293b] rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-300">
                  Vocal state distribution
                </span>
                <span
                  className={`text-[11px] font-medium capitalize px-2 py-0.5 rounded border ${
                    getEmotionColor(activeCall?.dominant_emotion).badge
                  }`}
                >
                  Dominant: {activeCall?.dominant_emotion || 'neutral'}
                </span>
              </div>

              <div className="space-y-1.5">
                {[
                  { key: 'fear', label: 'Fear' },
                  { key: 'distress', label: 'Distress' },
                  { key: 'nervousness', label: 'Tension' },
                  { key: 'anger', label: 'Agitation' },
                  { key: 'neutral', label: 'Neutral' },
                ].map(({ key, label }) => {
                  const prob = emotionProbs[key] ?? 0.0;
                  const pct = Math.round(prob * 100);
                  const colorInfo = getEmotionColor(key);
                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{label}</span>
                        <span className="font-mono text-slate-500 dark:text-slate-400">{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${colorInfo.bar}`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Acoustic Metrics Grid */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-300 block">
                Acoustic metrics
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                <div className="bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e293b] p-2.5 rounded-lg shadow-sm">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Pitch (F0)</span>
                  <strong className="text-sm font-semibold text-slate-900 dark:text-white block mt-0.5">{biomarkers.pitch_hz} Hz</strong>
                </div>

                <div className="bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e293b] p-2.5 rounded-lg shadow-sm">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Vocal tremor</span>
                  <strong className="text-sm font-semibold text-amber-600 dark:text-amber-300 block mt-0.5">{biomarkers.jitter_tremor_pct}%</strong>
                </div>

                <div className="bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e293b] p-2.5 rounded-lg shadow-sm">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Pace</span>
                  <strong className="text-sm font-semibold text-cyan-700 dark:text-cyan-300 block mt-0.5">{biomarkers.speech_rate_sps} syl/s</strong>
                </div>

                <div className="bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e293b] p-2.5 rounded-lg shadow-sm">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Loudness</span>
                  <strong className="text-sm font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">{biomarkers.rms_energy_db} dB</strong>
                </div>

                <div className="bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e293b] p-2.5 rounded-lg shadow-sm">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Speech activity</span>
                  <strong className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 block mt-0.5">
                    {Math.round((biomarkers.voice_activity_ratio ?? 0.85) * 100)}%
                  </strong>
                </div>

                <div className="bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e293b] p-2.5 rounded-lg shadow-sm">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Signal rating</span>
                  <strong className="text-sm font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">
                    {Math.round((biomarkers.confidence_score ?? 0.90) * 100)}%
                  </strong>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-[#0c121e] px-3 py-1.5 rounded-md border border-slate-200 dark:border-[#1e293b]">
                Assessment: <strong className="text-slate-900 dark:text-slate-200 font-medium">{biomarkers.vocal_anomaly}</strong>
              </p>
            </div>

            {/* Timeline Progression */}
            <div className="bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e293b] rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-300">Call progression</span>
                <span className="text-[11px] text-slate-500">{timeline.length} segments</span>
              </div>

              <div className="relative">
                <div className="flex gap-1 h-6 w-full bg-slate-200/80 dark:bg-[#080d16] p-1 rounded-md border border-slate-300 dark:border-[#1e293b] overflow-hidden">
                  {timeline.length === 0 ? (
                    <div className="text-[11px] text-slate-500 italic px-1">
                      No segments.
                    </div>
                  ) : (
                    timeline.map((seg, idx) => {
                      const colorInfo = getEmotionColor(seg.emotion);
                      return (
                        <div
                          key={idx}
                          title={`${seg.start_sec}s - ${seg.end_sec}s: ${seg.emotion} (${seg.urgency})`}
                          className={`flex-1 rounded-sm text-[9px] font-mono flex items-center justify-center text-white ${colorInfo.bar}`}
                        >
                          <span className="truncate px-0.5">{seg.urgency}</span>
                        </div>
                      );
                    })
                  )}
                </div>

                {isPlayingAudio && audioDurationSec > 0 && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-900 dark:bg-white shadow-sm transition-all pointer-events-none"
                    style={{ left: `${Math.min(100, (audioPlaybackSec / audioDurationSec) * 100)}%` }}
                  ></div>
                )}
              </div>
            </div>

            {/* Transcript Box */}
            <div className="bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1e293b] rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-300">
                  Transcript
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {transcript.pii_masked_count} identifiers masked
                </span>
              </div>

              <div className="bg-white dark:bg-[#080d16] border border-slate-200 dark:border-[#1e293b] p-3 rounded-md text-xs leading-relaxed text-slate-800 dark:text-slate-200 min-h-[60px] shadow-sm">
                {renderHighlightedTranscript(transcript.raw_redacted, transcript.detected_keywords)}
              </div>
            </div>
          </>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center text-center p-6 text-xs text-slate-500 space-y-1.5">
            <FileCheck className="w-8 h-8 text-slate-400 mb-1" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No call selected</p>
            <p className="text-[11px] text-slate-500">
              Upload an audio file or select an active call to view vocal analysis and transcript.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
