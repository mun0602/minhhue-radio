import "@testing-library/jest-dom";

// 1. Mock ResizeObserver
class MockResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}
window.ResizeObserver = window.ResizeObserver || MockResizeObserver;

// 2. Mock Service Worker
if (typeof window !== "undefined") {
  Object.defineProperty(navigator, "serviceWorker", {
    writable: true,
    value: {
      register: jest.fn().mockImplementation(() => Promise.resolve({ scope: "/" })),
    },
  });
  
  // Mock fetch
  window.fetch = jest.fn();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).fetch = window.fetch;
}

// 3. Mock HTMLAudioElement & Audio
class AudioMock {
  src = "";
  volume = 1.0;
  playbackRate = 1.0;
  currentTime = 0;
  duration = 180; // Giá trị mặc định giả lập 3 phút
  paused = true;
  private listeners: { [key: string]: Array<() => void> } = {};

  constructor(src?: string) {
    if (src) this.src = src;
    
    // Gắn instance này vào global để các bài test có thể truy cập nếu cần
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).lastAudioInstance = this;
  }

  addEventListener = jest.fn((event: string, callback: () => void) => {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  });

  removeEventListener = jest.fn((event: string, callback: () => void) => {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
  });

  // Helper để trigger các sự kiện từ ngoài bài test
  _triggerEvent(event: string) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((cb) => cb());
    }
  }

  play = jest.fn().mockImplementation(() => {
    this.paused = false;
    // Kích hoạt bất đồng bộ để mô phỏng sự kiện play và loadedmetadata của trình duyệt
    setTimeout(() => {
      this._triggerEvent("play");
      this._triggerEvent("loadedmetadata");
    }, 0);
    return Promise.resolve();
  });

  pause = jest.fn().mockImplementation(() => {
    this.paused = true;
    setTimeout(() => {
      this._triggerEvent("pause");
    }, 0);
  });

  load = jest.fn();
}

Object.defineProperty(window, "Audio", {
  writable: true,
  value: AudioMock,
});
