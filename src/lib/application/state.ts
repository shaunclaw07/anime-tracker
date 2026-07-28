/**
 * State store interface — minimal pub/sub store.
 */
export interface Store<T> {
  getState: () => T;
  setState: (partial: Partial<T>) => void;
  subscribe: (fn: (state: T) => void) => () => void;
}

/**
 * createState — A minimal state store (like a mini-Redux).
 *
 * @param initial - Initial state (default: {})
 * @returns Store interface with getState, setState, subscribe
 */
export function createState<T extends Record<string, unknown>>(initial: T = {} as T): Store<T> {
  let state = { ...initial };
  const listeners = new Set<(state: T) => void>();

  return {
    getState: (): T => state,
    setState: (partial: Partial<T>): void => {
      state = { ...state, ...partial };
      listeners.forEach((fn) => fn(state));
    },
    subscribe: (fn: (state: T) => void): (() => void) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
