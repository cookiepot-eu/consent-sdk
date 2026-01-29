import { describe, it, expect, vi } from 'vitest';
import { EventEmitter } from '../../src/lib/event-emitter';

describe('EventEmitter', () => {
  it('should register and trigger event handlers', () => {
    const emitter = new EventEmitter();
    const handler = vi.fn();

    emitter.on('test', handler);
    emitter.emit('test', { foo: 'bar' });

    expect(handler).toHaveBeenCalledWith({ foo: 'bar' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should support multiple handlers for the same event', () => {
    const emitter = new EventEmitter();
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    emitter.on('test', handler1);
    emitter.on('test', handler2);
    emitter.emit('test', 'data');

    expect(handler1).toHaveBeenCalledWith('data');
    expect(handler2).toHaveBeenCalledWith('data');
  });

  it('should unregister event handlers', () => {
    const emitter = new EventEmitter();
    const handler = vi.fn();

    emitter.on('test', handler);
    emitter.off('test', handler);
    emitter.emit('test', 'data');

    expect(handler).not.toHaveBeenCalled();
  });

  it('should handle removing non-existent handlers', () => {
    const emitter = new EventEmitter();
    const handler = vi.fn();

    // Should not throw
    expect(() => {
      emitter.off('test', handler);
    }).not.toThrow();
  });

  it('should not trigger handlers for different events', () => {
    const emitter = new EventEmitter();
    const handler = vi.fn();

    emitter.on('event1', handler);
    emitter.emit('event2', 'data');

    expect(handler).not.toHaveBeenCalled();
  });

  it('should handle errors in event handlers gracefully', () => {
    const emitter = new EventEmitter();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const errorHandler = vi.fn(() => {
      throw new Error('Handler error');
    });
    const successHandler = vi.fn();

    emitter.on('test', errorHandler);
    emitter.on('test', successHandler);
    emitter.emit('test', 'data');

    expect(errorHandler).toHaveBeenCalled();
    expect(successHandler).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('should clear all handlers for a specific event', () => {
    const emitter = new EventEmitter();
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    emitter.on('test', handler1);
    emitter.on('other', handler2);
    emitter.clear('test');

    emitter.emit('test', 'data');
    emitter.emit('other', 'data');

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalled();
  });

  it('should clear all handlers when no event specified', () => {
    const emitter = new EventEmitter();
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    emitter.on('test1', handler1);
    emitter.on('test2', handler2);
    emitter.clear();

    emitter.emit('test1', 'data');
    emitter.emit('test2', 'data');

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
  });

  it('should correctly report if handlers exist', () => {
    const emitter = new EventEmitter();
    const handler = vi.fn();

    expect(emitter.hasHandlers('test')).toBe(false);

    emitter.on('test', handler);
    expect(emitter.hasHandlers('test')).toBe(true);

    emitter.off('test', handler);
    expect(emitter.hasHandlers('test')).toBe(false);
  });

  it('should support type-safe event data', () => {
    const emitter = new EventEmitter();
    const handler = vi.fn<[{ count: number }]>();

    emitter.on<{ count: number }>('test', handler);
    emitter.emit<{ count: number }>('test', { count: 42 });

    expect(handler).toHaveBeenCalledWith({ count: 42 });
  });
});
