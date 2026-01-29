/**
 * Simple event emitter for SDK events
 */

type EventHandler<T = unknown> = (data: T) => void;

export class EventEmitter {
  private events: Map<string, Set<EventHandler>>;

  constructor() {
    this.events = new Map();
  }

  /**
   * Register an event handler
   */
  on<T = unknown>(event: string, handler: EventHandler<T>): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(handler as EventHandler);
  }

  /**
   * Unregister an event handler
   */
  off<T = unknown>(event: string, handler: EventHandler<T>): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.delete(handler as EventHandler);
      if (handlers.size === 0) {
        this.events.delete(event);
      }
    }
  }

  /**
   * Emit an event with data
   */
  emit<T = unknown>(event: string, data: T): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`[CookiePot] Error in event handler for "${event}":`, error);
        }
      });
    }
  }

  /**
   * Clear all event handlers for a specific event or all events
   */
  clear(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }

  /**
   * Check if there are any handlers for an event
   */
  hasHandlers(event: string): boolean {
    const handlers = this.events.get(event);
    return handlers ? handlers.size > 0 : false;
  }
}
