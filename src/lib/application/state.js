/**
 * createState — A minimal state store (like a mini-Redux).
 *
 * @template T
 * @param {T} [initial={}] - Initial state.
 * @returns {{ getState: () => T, setState: (partial: Partial<T>) => void, subscribe: (fn: (state: T) => void) => () => void }}
 */
export function createState(initial = {}) {
  let state = { ...initial };
  const listeners = new Set();

  return {
    getState: () => state,
    setState: (partial) => {
      state = { ...state, ...partial };
      listeners.forEach((fn) => fn(state));
    },
    subscribe: (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
