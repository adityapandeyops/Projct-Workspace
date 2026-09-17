// Synthesizer audio chime for token announcements & emergency alerts
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playQueueChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Pleasant hospital two-tone ding-dong
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now); // E5
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.6);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(523.25, now + 0.25); // C5
    gain2.gain.setValueAtTime(0.25, now + 0.25);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.25);
    osc2.stop(now + 0.9);
  } catch (e) {
    console.warn('Audio chime playback blocked or not supported:', e);
  }
}

export function playEmergencyAlertSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.3);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.6);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.7);
  } catch (e) {
    console.warn('Emergency sound playback blocked:', e);
  }
}

/**
 * Natural voice announcement using Web Speech API + hospital chime.
 */
export function announceTokenCall(params: {
  tokenNumber: string;
  chamberNumber?: string;
  doctorName?: string;
  patientName?: string;
  language?: string;
  onStart?: () => void;
  onEnd?: () => void;
}) {
  const { tokenNumber, chamberNumber, doctorName, patientName, language = 'en', onStart, onEnd } = params;

  // 1. Play hospital two-tone ding-dong chime
  playQueueChime();

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  // Format token for speech (TV OPD 104 -> "T V O P D 1 0 4")
  const speechToken = tokenNumber.split('').join(' ');

  let spokenText = `Token ${speechToken}. `;
  if (patientName) {
    spokenText += `${patientName}, `;
  }
  if (chamberNumber) {
    spokenText += `please proceed to Consultation Chamber ${chamberNumber}. `;
  }
  if (doctorName) {
    spokenText += `${doctorName} is ready to attend you.`;
  }

  // Hindi localization if selected
  if (language === 'hi') {
    spokenText = `टोकन नंबर ${tokenNumber}. `;
    if (patientName) spokenText += `${patientName}, `;
    if (chamberNumber) spokenText += `कृपया कमरा नंबर ${chamberNumber} में पधारें। `;
    if (doctorName) spokenText += `डॉक्टर ${doctorName} उपस्थित हैं।`;
  }

  // Allow chime to ring before speech starts
  setTimeout(() => {
    try {
      window.speechSynthesis.cancel(); // Stop any pending speech
      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.rate = 0.92; // Clear, calm hospital tempo
      utterance.pitch = 1.05;
      utterance.volume = 1.0;

      if (language === 'hi') {
        utterance.lang = 'hi-IN';
      } else {
        utterance.lang = 'en-US';
      }

      if (onStart) utterance.onstart = onStart;
      if (onEnd) utterance.onend = onEnd;
      utterance.onerror = () => {
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      if (onEnd) onEnd();
    }
  }, 650);
}

