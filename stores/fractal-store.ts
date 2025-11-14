// have type of gradient/color you are changing state.
// have one color state so you change that color each time you change in itration.
import { create } from "zustand";
import {
  backgroundGradientPalettes,
  gradientShapeColors,
} from "@/lib/constants";

type KeyProps = "blur" | "brightness" | "contrast" | "saturation";

interface StoreState {
  resolution: { width: number; height: number };
  backgroundGradient: Array<{ name: string; colors: Array<string> }>;
  shapeGradient: Array<string>;
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
  grainIntensity: number;
}

interface StoreActions {
  setBackgroundGradient: (
    paletteName: string,
    idx: number,
    newHex: string,
  ) => void;
  setShapeGradient: (idx: number, newHex: string) => void;
  setBackgroundGradientFilters: (key: KeyProps, value: number) => void;
  setShapeGradientFiltersSet: (key: KeyProps, value: number) => void;
  setGrainIntensity: (intensity: number) => void;
}

// Make color update reusable for all gradients shapes and text more if there is
export const useStore = create<StoreState & StoreActions>((set) => ({
  resolution: { width: 1920, height: 1080 },
  backgroundGradient: backgroundGradientPalettes,
  shapeGradient: gradientShapeColors,
  backgroundGradientFilters: {
    blur: 0,
    brightness: 100,
    contrast: 100,
    saturation: 100,
  },
  shapeGradientFilters: {
    blur: 40,
    brightness: 100,
    contrast: 100,
    saturation: 100,
  },
  grainIntensity: 25,
  setBackgroundGradient: (paletteName: string, idx: number, newHex: string) =>
    set((state) => ({
      backgroundGradient: state.backgroundGradient.map((palette) =>
        palette.name === paletteName
          ? {
              ...palette,
              colors: palette.colors.map((color, colorIdx) =>
                colorIdx === idx ? newHex : color,
              ),
            }
          : palette,
      ),
    })),
  setShapeGradient: (idx: number, nexHex: string) =>
    set((state) => ({
      shapeGradient: state.shapeGradient.map((color, colorIdx) =>
        colorIdx === idx ? nexHex : color,
      ),
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
  setGrainIntensity: (intensity: number) =>
    set(() => ({
      grainIntensity: intensity,
    })),
}));
