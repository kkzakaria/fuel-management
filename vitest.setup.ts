import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup après chaque test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia (nécessaire pour certains composants Radix UI)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }),
});

// Mock IntersectionObserver (utilisé par certains composants)
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  constructor() {}
  disconnect(): void {}
  observe(): void {}
  unobserve(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

global.IntersectionObserver = MockIntersectionObserver as typeof IntersectionObserver;

// Mock ResizeObserver (utilisé par Recharts)
class MockResizeObserver implements ResizeObserver {
  constructor() {}
  disconnect(): void {}
  observe(): void {}
  unobserve(): void {}
}

global.ResizeObserver = MockResizeObserver as typeof ResizeObserver;
