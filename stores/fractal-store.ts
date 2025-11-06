import { create } from "zustand";

interface FractalStore {
	size: number,
	setSize: (v: number) => void;
}

export const useStore = create<FractalStore>((set) => ({
	// initial state
	size: 0,
	setSize: () => set((v) => v)
}));
