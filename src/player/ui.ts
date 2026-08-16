/**
 * Custom player card UI. Pure view layer:
 * renders track info + emits user intents via callbacks.
 */

import { FILTER_CHIPS, MOOD_LABELS, type Track } from '../data/tracks';

export interface PlayerUICallbacks {
  onPlayPause?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  /** fraction 0..1 along the scrub bar */
  onSeek?: (fraction: number) => void;
}

const ICONS = {
  play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
  pause: '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>',
  prev: '<svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6L18 6v12z"/></svg>',
  next: '<svg viewBox="0 0 24 24"><path d="M16 6h2v12h-2zM6 6l8.5 6L6 18z"/></svg>',
};

function fmtTime(s: number): string {
  if (!Number.isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export class PlayerUI {
  private root: HTMLElement;
  private cb: PlayerUICallbacks;

  private coverEl!: HTMLImageElement;
  private titleEl!: HTMLElement;
  private artistEl!: HTMLElement;
  private moodTagEl!: HTMLElement;
  private playBtn!: HTMLButtonElement;
  private barEl!: HTMLElement;
  private barFillEl!: HTMLElement;
  private timeCurEl!: HTMLElement;
  private timeTotalEl!: HTMLElement;

  constructor(parent: HTMLElement, cb: PlayerUICallbacks = {}) {
    this.cb = cb;
    this.root = document.createElement('div');
    this.root.className = 'player-card';
    this.root.innerHTML = `
      <span class="player-card__mood-tag" data-el="mood"></span>
      <img class="player-card__cover" data-el="cover" alt="" />
      <div class="player-card__meta">
        <div class="player-card__title" data-el="title"></div>
        <div class="player-card__artist" data-el="artist"></div>
        <div class="player-card__scrub">
          <span class="player-card__time" data-el="time-cur">0:00</span>
          <div class="player-card__bar" data-el="bar">
            <div class="player-card__bar-fill" data-el="bar-fill"></div>
          </div>
          <span class="player-card__time" data-el="time-total">0:00</span>
        </div>
      </div>
      <div class="player-card__controls">
        <button data-el="prev" aria-label="Previous track">${ICONS.prev}</button>
        <button class="player-card__play" data-el="play" aria-label="Play">${ICONS.play}</button>
        <button data-el="next" aria-label="Next track">${ICONS.next}</button>
      </div>
    `;
    parent.appendChild(this.root);

    const q = <T extends HTMLElement>(sel: string): T =>
      this.root.querySelector<T>(`[data-el="${sel}"]`)!;

    this.coverEl = q('cover');
    this.titleEl = q('title');
    this.artistEl = q('artist');
    this.moodTagEl = q('mood');
    this.playBtn = q('play');
    this.barEl = q('bar');
    this.barFillEl = q('bar-fill');
    this.timeCurEl = q('time-cur');
    this.timeTotalEl = q('time-total');

    this.playBtn.addEventListener('click', () => this.cb.onPlayPause?.());
    q('prev').addEventListener('click', () => this.cb.onPrev?.());
    q('next').addEventListener('click', () => this.cb.onNext?.());
    this.barEl.addEventListener('click', (e: MouseEvent) => {
      const rect = this.barEl.getBoundingClientRect();
      const fraction = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      this.cb.onSeek?.(fraction);
    });
  }

  setTrack(track: Track): void {
    this.coverEl.src = track.cover;
    this.coverEl.alt = `${track.title} cover art`;
    this.titleEl.textContent = track.title;
    this.artistEl.textContent = track.artist;
    const showMood = FILTER_CHIPS.includes(track.mood);
    this.moodTagEl.textContent = showMood ? MOOD_LABELS[track.mood] : '';
    this.moodTagEl.hidden = !showMood;
    this.setProgress(0, 0);
  }

  setPlaying(playing: boolean): void {
    this.playBtn.innerHTML = playing ? ICONS.pause : ICONS.play;
    this.playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    this.root.classList.toggle('is-playing', playing);
  }

  setProgress(currentSeconds: number, totalSeconds: number): void {
    this.timeCurEl.textContent = fmtTime(currentSeconds);
    this.timeTotalEl.textContent = fmtTime(totalSeconds);
    const pct = totalSeconds > 0 ? (currentSeconds / totalSeconds) * 100 : 0;
    this.barFillEl.style.width = `${pct}%`;
  }
}
