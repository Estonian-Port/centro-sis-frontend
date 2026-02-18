type Handler = (...args: any[]) => void;

class SimpleEventEmitter {
  private events: { [event: string]: Handler[] } = {};

  on(event: string, handler: Handler) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(handler);
  }

  off(event: string, handler: Handler) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(h => h !== handler);
  }

  emit(event: string, ...args: any[]) {
    if (!this.events[event]) return;
    this.events[event].forEach(handler => handler(...args));
  }
}

export const EventBus = new SimpleEventEmitter();