/**
 * Hands-free pause/resume via the Web Speech API.
 * "akh minute" → pause; "karew start" → resume.
 */

import type { QueueController } from './player/queue';

const COOLDOWN_MS = 1800;

type SpeechRec = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((ev: SpeechRecognitionResultEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
};

interface SpeechRecognitionResultEvent {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
}

function SpeechRecognitionCtor(): (new () => SpeechRec) | null {
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRec;
    webkitSpeechRecognition?: new () => SpeechRec;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function heardPause(text: string): boolean {
  return /\b(akh|aakh|aak|ack|ek|ikk)\s+(minute|minit|minut|minutes)\b/.test(text);
}

function heardResume(text: string): boolean {
  return /\b(karew|kariv|karev|kareo|karo|kare|carry)\s+(start|starte)\b/.test(
    text
  );
}

async function requestMic(): Promise<void> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  for (const track of stream.getTracks()) track.stop();
}

export function mountVoiceCommands(queue: QueueController): void {
  const Ctor = SpeechRecognitionCtor();
  if (!Ctor || !navigator.mediaDevices?.getUserMedia) return;

  void (async () => {
    try {
      await requestMic();
    } catch {
      return;
    }

    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-IN';

    let coolUntil = 0;
    let restarting = false;

    const listen = (raw: string): void => {
      const text = normalize(raw);
      if (!text) return;
      const now = Date.now();
      if (now < coolUntil) return;

      if (heardPause(text)) {
        coolUntil = now + COOLDOWN_MS;
        void queue.pausePlayback();
        return;
      }
      if (heardResume(text)) {
        coolUntil = now + COOLDOWN_MS;
        void queue.resumePlayback();
      }
    };

    rec.onresult = (ev) => {
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        listen(ev.results[i][0].transcript);
      }
    };

    rec.onend = () => {
      if (restarting) return;
      restarting = true;
      window.setTimeout(() => {
        restarting = false;
        try {
          rec.start();
        } catch {
          /* already started */
        }
      }, 250);
    };

    rec.onerror = (ev) => {
      if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
        try {
          rec.stop();
        } catch {
          /* ignore */
        }
      }
    };

    try {
      rec.start();
    } catch {
      /* ignore */
    }
  })();
}
