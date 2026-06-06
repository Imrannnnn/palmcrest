// test/setup.js
// Runs before every Vitest test suite

// ── jest-dom DOM matchers ─────────────────────────────────────────────────────
// Adds toBeInTheDocument(), toHaveTextContent(), etc.
import '@testing-library/jest-dom';

// ── Browser API stubs (not implemented in jsdom) ──────────────────────────────

// IntersectionObserver — used by LandingPage for scroll-reveal animations
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// ResizeObserver — may be needed by layout-aware components
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// window.matchMedia — used by components that check media queries
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

