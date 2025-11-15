import { create } from "zustand";
import {
  backgroundGradientPalettes,
  gradientShapeColors,
  solidBackgroundColor,
} from "@/lib/constants";

type KeyProps = "blur" | "brightness" | "contrast" | "saturation";

interface StoreState {
  fractalSize: number;
  distortion: number;
  fractalMargin: number;
  fractalShadow: number;
  isGradient: boolean;
  resolution: { width: number; height: number };
  withImage: boolean;
  backgroundImage: {
    src: string;
    currentIndex?: number | undefined;
  };
  backgroundSolid: string;
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
  setFractalSize: (size: number) => void;
  setDistortion: (dist: number) => void;
  setFractalMargin: (margin: number) => void;
  setFractalShadow: (shadow: number) => void;
  setWithImage: (img: boolean) => void;
  setResolution: (width: number, height: number) => void;
  setBackgroundImage: ({
    src,
    currentIndex,
  }: {
    src: string;
    currentIndex?: number | undefined;
  }) => void;
  setIsGradient: (isGradient: boolean) => void;
  setSolidBackground: (newHex: string) => void;
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

export const useStore = create<StoreState & StoreActions>((set) => ({
  fractalSize: 0.29,
  distortion: 0.5,
  fractalMargin: 0.0,
  fractalShadow: 0.1,
  resolution: { width: 1920, height: 1080 },
  withImage: false,
  backgroundImage: {
    src: "",
    currentIndex: undefined,
  },
  isGradient: true,
  backgroundGradient: backgroundGradientPalettes,
  backgroundSolid: solidBackgroundColor,
  shapeGradient: gradientShapeColors,
  setResolution: (width, height) =>
    set(() => ({
      resolution: {
        width,
        height,
      },
    })),
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
  setWithImage: (img) =>
    set(() => ({
      withImage: img,
    })),
  setIsGradient: (isGradient) => set(() => ({ isGradient })),
  setBackgroundGradient: (paletteName, idx, newHex) =>
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
  setShapeGradient: (idx, nexHex) =>
    set((state) => ({
      shapeGradient: state.shapeGradient.map((color, colorIdx) =>
        colorIdx === idx ? nexHex : color,
      ),
    })),
  setBackgroundGradientFilters: (key, value) =>
    set((state) => ({
      backgroundGradientFilters: {
        ...state.backgroundGradientFilters,
        [key]: value,
      },
    })),
  setShapeGradientFiltersSet: (key, value) =>
    set((state) => ({
      shapeGradientFilters: {
        ...state.shapeGradientFilters,
        [key]: value,
      },
    })),
  setGrainIntensity: (intensity) =>
    set(() => ({
      grainIntensity: intensity,
    })),
  setFractalSize: (size) =>
    set(() => ({
      fractalSize: size,
    })),
  setDistortion: (dist) =>
    set(() => ({
      distortion: dist,
    })),
  setFractalMargin: (margin) =>
    set(() => ({
      fractalMargin: margin,
    })),
  setFractalShadow: (shadow) =>
    set(() => ({
      fractalShadow: shadow,
    })),
  setBackgroundImage: ({ src, currentIndex }) =>
    set(() => ({
      backgroundImage: {
        src,
        currentIndex,
      },
    })),
  setSolidBackground: (newHex) =>
    set(() => ({
      backgroundSolid: newHex,
    })),
}));
