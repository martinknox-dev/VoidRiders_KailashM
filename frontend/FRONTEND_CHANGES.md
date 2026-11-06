# Frontend Changes

This document records the current frontend features and UI changes in
`frontend/`.

## 1. Landing page and navigation

- Added a VECNA-Pulse landing page with:
  - Hero messaging for voice intelligence and emergency response.
  - Primary actions to launch the response desk and explore the workflow.
  - About, workflow, speech science, voice signals, capabilities,
    conversation workflow, architecture, and safety sections.
  - Human-verification and indicative-signal notices.
- Added responsive landing-page navigation with:
  - Fixed header that changes appearance after scrolling.
  - Active-section tracking using `IntersectionObserver`.
  - Mobile menu with open/close controls.
  - Smooth scrolling and a page progress indicator.
- Added scroll-reveal animations and staggered hero entrance animations.
- Added an interactive voice-profile presentation with progress tied to page
  scroll position.
- Added responsive layouts for desktop, tablet, and mobile screen sizes.

## 2. Dashboard command center

- Added a dedicated `/dashboard` route and dashboard query-string support
  (`?dashboard=true`).
- Added the VECNA-Pulse command-center layout:
  - Branded sidebar navigation.
  - Dashboard, Analytics, Incidents, and Settings navigation entries.
  - Operational workspace header with service connection status.
  - Summary cards for active calls, saved cases, analysis status, and
    processing time.
  - Three-column workspace for call queue, voice forensics, and decision
    support.
- Added sidebar status indicators for connected backend analysis and local
  analysis mode.
- Added navigation back to the landing page from the dashboard brand.

## 3. Theme and visual system

- Added dark and light dashboard themes.
- Added theme persistence in `localStorage` using `vecna_theme`.
- Added theme-aware surfaces, borders, typography, scrollbars, controls,
  modals, badges, and status indicators.
- Added consistent VECNA-Pulse branding, cyan/teal accent colors, responsive
  spacing, cards, buttons, and dashboard status strips.
- Added the VECNA-Pulse logo asset and browser icon metadata.

## 4. Call queue and demo mode

- Added active-call and saved-case tabs in the call queue.
- Added urgency sorting, urgency scores, urgency levels, emotion state, and
  visual urgency bars for calls.
- Added call selection and active-call synchronization across dashboard panels.
- Added empty-state guidance for queues and saved cases.
- Added Demo Mode with preloaded fallback scenarios.
- Added scenario simulation for distressed-victim, UPI-fraud, sextortion, and
  informant cases.
- Added surge testing that creates a prioritized batch of critical/high
  urgency calls and displays a temporary “Surge active” indicator.
- Added `?mock=true` support for opening the dashboard in demo mode.

## 5. Audio intake and forensic analysis

- Added recorded audio upload with optional transcript hint.
- Added live microphone capture using `MediaRecorder`.
- Added browser speech recognition where supported to provide a transcript hint
  for live recordings.
- Added live frequency-spectrum visualization and streaming audio chunks over
  WebSocket.
- Added audio playback controls for uploaded files and active calls:
  play/pause, seek, volume, and playback progress.
- Added simulation controls for testing calls without a real recording.
- Added an analysis overlay with staged progress for:
  - Audio decoding and normalization.
  - Acoustic biomarker extraction.
  - Emotion probability evaluation.
  - PII masking and triage rules.
- Added backend-first audio analysis with client-side local-model fallback.
- Added provider/API-key headers when configured.

## 6. Backend and realtime integration

- Added `/api/health` connectivity checks.
- Added `/api/analyze-audio` integration for backend SenseVoice/Whisper or
  hybrid triage.
- Added `/api/voice-copilot` integration for response drafting.
- Added `/api/export-report` integration for report generation.
- Added `/ws/live-call` WebSocket integration for:
  - Live call updates.
  - Call queue synchronization.
  - Simulated calls and surge batches.
  - Live audio streaming.
- Added graceful local/offline behavior when the backend is unavailable.

## 7. Decision support and incident response

- Added incident classification and explainability summary display.
- Added recommended response actions with operator check-off state.
- Added dispatch-note entry with Ctrl+Enter submission.
- Added incident notes/activity log.
- Added voice-copilot processing for officer notes.
- Added 1930 account-freeze request draft display, including ticket ID,
  priority, amount, payment channel, freeze target, and golden-hour window.
- Added simulated ticket submission state and activity logging.
- Added report export controls for Markdown and JSON case packets.
- Added persistent local case saving and deletion through the browser case vault.

## 8. Settings and adaptive models

- Removed system profile and adaptive-model controls from the dashboard header.
- Removed the automatic first-visit hardware wizard popup.
- Added a **System profile & adaptive models** entry to the Settings modal.
- The entry opens the existing profile modal for:
  - Detected CPU, memory, WebGPU, and adapter information.
  - Execution-tier selection.
  - Automatically recommended model tier.
  - Local model bundle information and download size.
  - Downloading/caching all local models.
  - Clearing the selected model cache.
  - Requesting persistent browser storage.
- Preserved model-tier persistence with `vecna_model_tier`.
- Preserved model-cache and storage refresh actions.
- Added inference-provider selection:
  - Local offline.
  - SiliconFlow.
  - Groq.
  - OpenRouter.
- Added provider API-key input with show/hide control and local persistence
  using `vecna_provider` and `vecna_api_key`.
- Provider defaults can also be supplied through Vite environment variables.

## 9. Safety and user feedback

- Repeatedly labels analysis as indicative and requires human verification.
- Added loading, empty, connected, offline, saved, exporting, surge, and
  analysis states throughout the interface.
- Added cleanup for microphone tracks, audio contexts, speech recognition,
  animation frames, WebSockets, and audio playback when panels or calls
  change.
- Added accessible labels and button titles for major navigation and audio
  controls.

## 10. Main frontend areas

- `src/App.jsx`: application state, routing, integrations, persistence, and
  dashboard composition.
- `src/components/LandingPage.jsx`: public landing page and responsive
  navigation.
- `src/components/DashboardSidebar.jsx`: dashboard navigation and service
  status.
- `src/components/DashboardOverview.jsx`: dashboard summary cards.
- `src/components/Header.jsx`: theme, demo mode, and provider controls.
- `src/components/CallQueue.jsx`: active and saved case queues.
- `src/components/ForensicsPanel.jsx`: upload, microphone, simulation, and
  playback controls.
- `src/components/DecisionSupport.jsx`: response actions, notes, copilot,
  case saving, and export.
- `src/components/SettingsModal.jsx`: provider and API-key settings.
- `src/components/HardwareWizardModal.jsx`: hardware profile and local model
  management.
- `src/components/AnalyzingOverlay.jsx`: analysis progress feedback.
- `src/index.css`: landing-page, dashboard, responsive, theme, animation, and
  scrollbar styles.
