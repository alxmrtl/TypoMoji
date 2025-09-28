import '@testing-library/jest-dom';

// Mock IndexedDB for tests
import 'fake-indexeddb/auto';

// The auto import sets up everything we need

// Mock Web Audio API
class MockAudioContext {
  createOscillator() {
    return {
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      frequency: { setValueAtTime: jest.fn() },
      type: 'sine',
      onended: null
    };
  }

  createGain() {
    return {
      connect: jest.fn(),
      gain: {
        setValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn()
      }
    };
  }

  get destination() {
    return {};
  }

  get currentTime() {
    return 0;
  }
}

(globalThis as any).AudioContext = MockAudioContext as any;
(globalThis as any).webkitAudioContext = MockAudioContext as any;

// Mock navigator.vibrate
Object.defineProperty(navigator, 'vibrate', {
  writable: true,
  value: jest.fn()
});

// Mock HTMLAudioElement
(globalThis as any).HTMLAudioElement = class MockHTMLAudioElement {
  play = jest.fn().mockResolvedValue(undefined);
  pause = jest.fn();
  load = jest.fn();
  volume = 1;
  currentTime = 0;
  duration = 0;
  preload = 'auto';
  src = '';
} as any;

// Mock crypto.randomUUID for older Node versions
if (!(globalThis as any).crypto) {
  (globalThis as any).crypto = {} as any;
}

if (!(globalThis as any).crypto.randomUUID) {
  (globalThis as any).crypto.randomUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});