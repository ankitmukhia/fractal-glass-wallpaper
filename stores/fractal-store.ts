import { create } from "zustand";
import {
  backgroundGradientPalettes,
  gradientShapePalettes,
} from "@/lib/constants";

type KeyProps = "blur" | "brightness" | "contrast" | "saturation";

interface StoreState {
  resolution: { width: number; height: number };
  backgroundGradient: Array<{ name: string; colors: Array<string> }>;
  shapeGradient: Array<{ name: string; colors: Array<string> }>;
  backgroundGradientFilters: {
    blur: number;
    brightness: number;
    contrast: number;
    saturation: number;
  };
  shapeGradientFilters: {
    blur: number;
    brightness: number;
    contrast: number;
    saturation: number;
  };
}

interface StoreActions {
  setBackgroundGradient: (hex: string) => void;
  setShapeGradient: (hex: string) => void;
  setBackgroundGradientFilters: (key: KeyProps, value: number) => void;
  setShapeGradientFiltersSet: (key: KeyProps, value: number) => void;
}

// Make color update reusable for all gradients shapes and text more if there is
export const useStore = create<StoreState & StoreActions>((set) => ({
  resolution: { width: 1920, height: 1080 },
  backgroundGradient: backgroundGradientPalettes,
  shapeGradient: gradientShapePalettes,
  backgroundGradientFilters: {
    blur: 10,
    brightness: 100,
    contrast: 100,
    saturation: 100,
  },
  shapeGradientFilters: {
    blur: 10,
    brightness: 100,
    contrast: 100,
    saturation: 100,
  },
  setBackgroundGradient: () =>
    set((state) => ({
      backgroundGradient: backgroundGradientPalettes,
    })),
  setShapeGradient: () =>
    set((state) => ({
      shapeGradient: gradientShapePalettes,
    })),
  setBackgroundGradientFilters: (key: KeyProps, value: number) =>
    set((state) => ({
      backgroundGradientFilters: {
        ...state.backgroundGradientFilters,
        [key]: value,
      },
    })),
  setShapeGradientFiltersSet: (key: KeyProps, value: number) =>
    set((state) => ({
      shapeGradientFilters: {
        ...state.shapeGradientFilters,
        [key]: value,
      },
    })),
}));
