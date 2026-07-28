import { describe, it, expect } from 'vitest';
import { createState } from './state.ts';

describe('createState', () => {
  it('returns an object with getState, setState, and subscribe', () => {
    const state = createState();
    expect(state).toHaveProperty('getState');
    expect(state).toHaveProperty('setState');
    expect(state).toHaveProperty('subscribe');
    expect(typeof state.getState).toBe('function');
    expect(typeof state.setState).toBe('function');
    expect(typeof state.subscribe).toBe('function');
  });

  it('initialises with an empty object when no initial is provided', () => {
    const state = createState();
    expect(state.getState()).toEqual({});
  });

  it('initialises with the provided initial data', () => {
    const initial = { watchlist: [], deTitles: {}, filters: {} };
    const state = createState(initial);
    expect(state.getState()).toEqual(initial);
  });

  it('setState merges partial state into existing state', () => {
    const state = createState({ watchlist: [], filters: {} });
    state.setState({ filters: { query: 'Naruto' } });
    expect(state.getState()).toEqual({
      watchlist: [],
      filters: { query: 'Naruto' },
    });
  });

  it('setState does not mutate the previous state object', () => {
    const state = createState({ a: 1 });
    const before = state.getState();
    state.setState({ b: 2 });
    expect(before).toEqual({ a: 1 });
    expect(before).not.toBe(state.getState());
  });

  it('subscribe calls the listener immediately on setState', () => {
    const state = createState({ count: 0 });
    const calls = [];
    const unsubscribe = state.subscribe((s) => calls.push(s.count));
    state.setState({ count: 1 });
    expect(calls).toEqual([1]);
    unsubscribe();
  });

  it('subscribe calls all listeners on setState', () => {
    const state = createState({ count: 0 });
    const calls1 = [];
    const calls2 = [];
    state.subscribe((s) => calls1.push(s.count));
    state.subscribe((s) => calls2.push(s.count));
    state.setState({ count: 42 });
    expect(calls1).toEqual([42]);
    expect(calls2).toEqual([42]);
  });

  it('subscribe returns an unsubscribe function that stops notifications', () => {
    const state = createState({ count: 0 });
    const calls = [];
    const unsubscribe = state.subscribe((s) => calls.push(s.count));
    state.setState({ count: 1 });
    expect(calls).toEqual([1]);
    unsubscribe();
    state.setState({ count: 2 });
    expect(calls).toEqual([1]);
  });

  it('setState with an empty object does not change state', () => {
    const state = createState({ a: 1 });
    state.setState({});
    expect(state.getState()).toEqual({ a: 1 });
  });

  it('override existing properties with setState', () => {
    const state = createState({ value: 'old' });
    state.setState({ value: 'new' });
    expect(state.getState()).toEqual({ value: 'new' });
  });
});
