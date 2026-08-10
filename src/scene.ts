/**
 * Scene shell: wordmark, tagline, playlist links, listener counter slot,
 * full-bleed Kashmir valley hero.
 */

import heroUrl from './assets/hero.jpg';

export const TAGLINE = 'Kashmiri songs from the valley — mist, mountains, and memory.';

export interface SceneRefs {
  root: HTMLElement;
  listenersEl: HTMLElement;
  listenersCountEl: HTMLElement;
  chipsEl: HTMLElement;
}

export function renderScene(app: HTMLElement): SceneRefs {
  const root = document.createElement('div');
  root.className = 'scene';
  root.innerHTML = `
    <img class="scene__image" src="${heroUrl}" alt="Illustration: a shikara on misty Dal Lake beneath snow-capped Kashmir mountains at dawn" />
    <div class="scene__mist" aria-hidden="true"></div>
    <div class="scene__grain" aria-hidden="true"></div>
    <div class="scene__vignette" aria-hidden="true"></div>
    <header class="scene__header">
      <span class="scene__listeners" data-el="listeners" hidden>
        <span class="scene__listeners-dot"></span>
        <span data-el="listeners-count">0</span>&nbsp;listening
      </span>
      <nav class="scene__playlist-links" data-el="playlist-links"></nav>
    </header>
    <div class="scene__center">
      <div class="scene__brand">
        <h1 class="scene__wordmark">Koshur <br/>Radio</h1>
        <p class="scene__tagline">${TAGLINE}</p>
      </div>
    </div>
    <div class="chips" data-el="chips" role="group" aria-label="Filter songs by mood"></div>
  `;
  app.appendChild(root);

  const q = (sel: string): HTMLElement =>
    root.querySelector<HTMLElement>(`[data-el="${sel}"]`)!;

  return {
    root,
    listenersEl: q('listeners'),
    listenersCountEl: q('listeners-count'),
    chipsEl: q('chips'),
  };
}
