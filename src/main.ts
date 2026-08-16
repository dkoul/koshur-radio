import './styles/base.css';
import './styles/scene.css';
import './styles/player.css';

import { tracks } from './data/tracks';
import { PlayerUI } from './player/ui';
import { QueueController } from './player/queue';
import { renderScene, setWatukHero } from './scene';
import { renderChips } from './chips';
import { mountPresence } from './presence';
import { mountVoiceCommands } from './voice';

const app = document.querySelector<HTMLDivElement>('#app')!;

const scene = renderScene(app);

// Queue is created immediately; the YouTube API loads lazily on first gesture.
let queue: QueueController;

const ui = new PlayerUI(app, {
  onPlayPause: () => void queue.togglePlay(),
  onPrev: () => void queue.prev(),
  onNext: () => void queue.next(),
  onSeek: (f) => void queue.seekToFraction(f),
});

queue = new QueueController(tracks, ui);

renderChips(scene.chipsEl, tracks, queue, (mood) => {
  setWatukHero(scene.root, mood === 'watuk-puza');
});

mountPresence(scene.listenersEl, scene.listenersCountEl);
mountVoiceCommands(queue);

declare global {
  interface Window {
    __koshur?: { queue: QueueController; tracks: typeof tracks };
  }
}
window.__koshur = { queue, tracks };
