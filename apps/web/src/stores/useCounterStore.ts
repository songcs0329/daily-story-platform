import { create } from 'zustand';

export interface CounterState {
  count: number;
}

export interface CounterActions {
  increment: () => void;
  decrement: () => void;
}

export type CounterStore = CounterState & CounterActions;

const initialState: CounterState = {
  count: 0,
};

const useCounterStore = create<CounterStore>((set) => ({
  ...initialState,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));

export default useCounterStore;
