/**
 * Queue controller — glues the track list, AudioEngine, and PlayerUI together.
 * Playback wiring, prev/next cycling, auto-skip on embed failure.
 */

import type { Track, TrackMood } from '../data/tracks';
import { AudioEngine, type PlaybackState } from './youtube';
import { PlayerUI } from './ui';

const SKIP_LOG_PREFIX = '[koshur-radio] unplayable track, auto-skipping:';

/** Fisher–Yates; the "mix" default shuffles across all moods. */
function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export class QueueController {
  private allTracks: Track[];
  private tracks: Track[];
  private index = 0;
  private filter: TrackMood | null = null;
  private engine: AudioEngine;
  private ui: PlayerUI;
  private engineInitPromise: Promise<void> | null = null;
  private playing = false;
  private progressTimer: number | null = null;
  private consecutiveFailures = 0;

  constructor(tracks: Track[], ui: PlayerUI) {
    if (tracks.length === 0) throw new Error('QueueController needs >= 1 track');
    this.allTracks = tracks;
    this.tracks = shuffle(tracks);
    this.ui = ui;
    this.engine = new AudioEngine({
      onStateChange: (s) => this.handleEngineState(s),
      onTrackError: (videoId, code) => this.handleTrackError(videoId, code),
    });
    this.ui.setTrack(this.current());
  }

  current(): Track {
    return this.tracks[this.index];
  }

  currentFilter(): TrackMood | null {
    return this.filter;
  }

  /**
   * Filter the queue to one mood, or null for the all-moods mix.
   * Empty filters are ignored (returns false).
   */
  setFilter(mood: TrackMood | null): boolean {
    const next =
      mood === null
        ? shuffle(this.allTracks)
        : shuffle(this.allTracks.filter((t) => t.mood === mood));
    if (next.length === 0) return false;
    this.filter = mood;
    this.tracks = next;
    this.consecutiveFailures = 0;
    void this.jumpTo(0);
    return true;
  }

  private ensureEngine(): Promise<void> {
    if (!this.engineInitPromise) {
      this.engineInitPromise = this.engine.init();
    }
    return this.engineInitPromise;
  }

  async togglePlay(): Promise<void> {
    try {
      await this.ensureEngine();
    } catch (err) {
      console.error('[koshur-radio] YouTube API unavailable:', err);
      return;
    }
    if (this.playing) {
      this.engine.pause();
    } else if (this.engine.currentTime() > 0) {
      this.engine.play();
    } else {
      this.engine.load(this.current().youtubeId);
    }
  }

  async next(): Promise<void> {
    await this.jumpTo((this.index + 1) % this.tracks.length);
  }

  async prev(): Promise<void> {
    await this.jumpTo((this.index - 1 + this.tracks.length) % this.tracks.length);
  }

  async seekToFraction(fraction: number): Promise<void> {
    if (!this.engine.isReady()) return;
    const dur = this.engine.duration();
    if (dur > 0) this.engine.seek(dur * fraction);
  }

  private async jumpTo(newIndex: number): Promise<void> {
    this.index = newIndex;
    this.ui.setTrack(this.current());
    try {
      await this.ensureEngine();
    } catch (err) {
      console.error('[koshur-radio] YouTube API unavailable:', err);
      return;
    }
    this.engine.load(this.current().youtubeId);
  }

  private handleEngineState(state: PlaybackState): void {
    this.playing = state === 'playing';
    this.ui.setPlaying(this.playing);

    if (state === 'playing') {
      this.consecutiveFailures = 0;
      this.startProgressLoop();
    } else {
      this.stopProgressLoop();
    }
    if (state === 'ended') {
      void this.next();
    }
  }

  private handleTrackError(videoId: string, code: number): void {
    console.warn(SKIP_LOG_PREFIX, { videoId, code, track: this.current().id });
    this.consecutiveFailures += 1;
    if (this.consecutiveFailures >= this.tracks.length) {
      console.error(
        '[koshur-radio] every track failed to play; stopping auto-skip'
      );
      return;
    }
    void this.next();
  }

  private startProgressLoop(): void {
    this.stopProgressLoop();
    this.progressTimer = window.setInterval(() => {
      this.ui.setProgress(this.engine.currentTime(), this.engine.duration());
    }, 500);
  }

  private stopProgressLoop(): void {
    if (this.progressTimer !== null) {
      window.clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  }
}
