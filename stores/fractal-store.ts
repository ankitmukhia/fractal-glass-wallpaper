import { create } from "zustand";

interface StoreProps {
	resolution: { width: number, height: number }
}

export const useStore = create<StoreProps>(() => ({
	resolution: { width: 1920, height: 1080 }
}));
