/**
 * Thin, typed wrapper around the YouTube IFrame Player API.
 * The iframe stays hidden (see #yt-mount in index.html); all UI is ours.
 *
 * Design notes:
 * - We deliberately use a curated static list of video IDs upstream
 *   (saloon.wtf's pattern) instead of live YouTube search (safar-e-up's
 *   pattern), which we observed failing in production.
 * - onError surfaces embed failures (private/blocked/removed videos) so the
 *   queue layer can auto-skip — the guardrail from roadmap item 14.
 */

// --- Minimal typings for the parts of the IFrame API we use ---------------

interface YTPlayer {
  loadVideoById(videoId: string, startSeconds?: number): void;
  cueVideoById(videoId: string, startSeconds?: number): void;
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  setVolume(volume: number): void;
  destroy(): void;
}

interface YTPlayerEvent {
  target: YTPlayer;
  data: number;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: string | HTMLElement,
        opts: {
          width?: string;
          height?: string;
          videoId?: string;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (e: YTPlayerEvent) => void;
            onStateChange?: (e: YTPlayerEvent) => void;
            onError?: (e: YTPlayerEvent) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

// --- Public wrapper API ----------------------------------------------------

export type PlaybackState =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'ended'
  | 'error';

export interface AudioEngineEvents {
  onStateChange?: (state: PlaybackState) => void;
  /** Fired when a video can't be played (removed, private, embed-disabled). */
  onTrackError?: (videoId: string, ytErrorCode: number) => void;
}

let apiPromise: Promise<void> | null = null;

/** Injects the IFrame API script once and resolves when window.YT is ready. */
function loadIframeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error('YouTube IFrame API failed to load in 15s')),
      15_000
    );
    window.onYouTubeIframeAPIReady = () => {
      clearTimeout(timeout);
      resolve();
    };
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('YouTube IFrame API script failed to load'));
    };
    document.head.appendChild(tag);
  });
  return apiPromise;
}

export class AudioEngine {
  private player: YTPlayer | null = null;
  private currentVideoId: string | null = null;
  private events: AudioEngineEvents;
  private ready = false;

  constructor(events: AudioEngineEvents = {}) {
    this.events = events;
  }

  /** Must be called once (after a user gesture is fine) before playback. */
  async init(mountId = 'yt-mount'): Promise<void> {
    if (this.ready) return;
    await loadIframeApi();
    const YT = window.YT!;

    await new Promise<void>((resolve) => {
      this.player = new YT.Player(mountId, {
        width: '1',
        height: '1',
        playerVars: {
          controls: 0,
          disablekb: 1,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            this.ready = true;
            resolve();
          },
          onStateChange: (e) => this.handleStateChange(e.data),
          onError: (e) => {
            this.events.onStateChange?.('error');
            if (this.currentVideoId) {
              this.events.onTrackError?.(this.currentVideoId, e.data);
            }
          },
        },
      });
    });
  }

  private handleStateChange(ytState: number): void {
    const YT = window.YT!;
    const map: Record<number, PlaybackState> = {
      [YT.PlayerState.UNSTARTED]: 'loading',
      [YT.PlayerState.BUFFERING]: 'loading',
      [YT.PlayerState.CUED]: 'idle',
      [YT.PlayerState.PLAYING]: 'playing',
      [YT.PlayerState.PAUSED]: 'paused',
      [YT.PlayerState.ENDED]: 'ended',
    };
    const state = map[ytState];
    if (state) this.events.onStateChange?.(state);
  }

  /** Loads and starts playing a video by ID. */
  load(videoId: string, startSeconds = 0): void {
    this.assertReady();
    this.currentVideoId = videoId;
    this.player!.loadVideoById(videoId, startSeconds);
  }

  play(): void {
    this.assertReady();
    this.player!.playVideo();
  }

  pause(): void {
    this.assertReady();
    this.player!.pauseVideo();
  }

  seek(seconds: number): void {
    this.assertReady();
    this.player!.seekTo(seconds, true);
  }

  /** Current position in seconds (0 if not ready). */
  currentTime(): number {
    return this.ready ? this.player!.getCurrentTime() : 0;
  }

  /** Track duration in seconds (0 until metadata is loaded). */
  duration(): number {
    return this.ready ? this.player!.getDuration() : 0;
  }

  isReady(): boolean {
    return this.ready;
  }

  private assertReady(): void {
    if (!this.ready || !this.player) {
      throw new Error('AudioEngine.init() must resolve before playback calls');
    }
  }
}
