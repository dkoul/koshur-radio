/**
 * Mood filter chips — Mix is default; one chip per mood that has tracks.
 */

import type { Track, TrackMood } from './data/tracks';
import type { QueueController } from './player/queue';

const MOOD_LABELS: Record<TrackMood, string> = {
  classic: 'Classic',
  folk: 'Folk',
  contemporary: 'Now',
  film: 'Film',
};

export function renderChips(
  chipsEl: HTMLElement,
  tracks: Track[],
  queue: QueueController
): void {
  const moodsWithTracks = (Object.keys(MOOD_LABELS) as TrackMood[]).filter((m) =>
    tracks.some((t) => t.mood === m)
  );

  const options: Array<{ label: string; value: TrackMood | null }> = [
    { label: 'Mix', value: null },
    ...moodsWithTracks.map((m) => ({ label: MOOD_LABELS[m], value: m })),
  ];

  for (const opt of options) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = opt.label;
    btn.setAttribute('aria-pressed', String(opt.value === queue.currentFilter()));
    btn.addEventListener('click', () => {
      if (opt.value === queue.currentFilter()) return;
      const ok = queue.setFilter(opt.value);
      if (!ok) return;
      chipsEl
        .querySelectorAll('button')
        .forEach((b) => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
    });
    chipsEl.appendChild(btn);
  }
}
