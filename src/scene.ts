/**
 * Scene shell: wordmark, tagline, playlist links, online counter,
 * full-bleed Kashmir valley hero (Watuk Puza swaps in a ritual still).
 */

import heroUrl from './assets/hero.jpg';
import watukHeroUrl from './assets/hero-watuk-puza.jpg';

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
    <img class="scene__image" src="${heroUrl}" alt="View from a Kashmiri houseboat: vintage radio on a carved sill, noon chai, and snow mountains across the lake" />
    <img class="scene__image scene__image--watuk" src="${watukHeroUrl}" alt="Watuk Puza: brass kalash, marigold garlands, walnuts, and ritual offerings on a stone floor" />
    <div class="scene__mist" aria-hidden="true"></div>
    <div class="scene__grain" aria-hidden="true"></div>
    <div class="scene__vignette" aria-hidden="true"></div>
    <header class="scene__header">
      <span class="scene__listeners" data-el="listeners">
        <span class="scene__listeners-dot"></span>
        <span data-el="listeners-count">1</span>&nbsp;online
      </span>
      <p class="scene__credit">
        Inspired by
        <a href="https://x.com/s4tr2" target="_blank" rel="noopener noreferrer">Shubham Bhatt</a>
        and made by son gobbur —
        <a href="https://www.instagram.com/dkoul/" target="_blank" rel="noopener noreferrer">Deepak Koul</a>
      </p>
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

export function setWatukHero(root: HTMLElement, on: boolean): void {
  root.classList.toggle('is-watuk', on);
}
