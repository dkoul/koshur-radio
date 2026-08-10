/**
 * Listener counter — pluggable provider.
 * v1 ships with a no-op provider; the UI stays hidden until a real backend exists.
 */

export interface CounterProvider {
  fetchCount(): Promise<number | null>;
}

export class NoopCounterProvider implements CounterProvider {
  async fetchCount(): Promise<number | null> {
    return null;
  }
}

export async function mountCounter(
  provider: CounterProvider,
  listenersEl: HTMLElement,
  countEl: HTMLElement
): Promise<void> {
  try {
    const count = await provider.fetchCount();
    if (count !== null && count > 0) {
      countEl.textContent = String(count);
      listenersEl.hidden = false;
    }
  } catch {
    // Counter is decorative; never let it break the page.
  }
}
