import { create } from "zustand";
import {
  backgroundGradientPalettes,
  gradientShapeColors,
  solidBackgroundColor,
} from "@/lib/constants";
import { generateBlobData } from "@/lib/utils/shape";

type KeyProps = "blur" | "brightness" | "contrast" | "saturation";
type Resolution = {
  width: number;
  height: number;
};
type ResolutionType = "partial" | "direct";

export type BlobData = {
  x: number;
  y: number;
  radius: number;
  stretchY: number;
  rotation: number;
  points: { x: number; y: number }[];
};

interface StoreState {
  fractalSize: number;
  distortion: number;
  fractalMargin: number;
  fractalShadow: number;
  stretch: number;
  fractalBlur: number;

  currentPalette: string;
  isGradient: boolean;
  resolution: Resolution | Partial<Resolution>;
  withImage: boolean;
  backgroundImage: {
    src: string;
    currentIndex?: number | undefined;
  };
  backgroundSolid: string;
  backgroundGradient: Array<{ name: string; colors: Array<string> }>;
  newBackgroundGradient: Array<{
    name: string;
    colors: Array<{ color: string }>;
  }>;
  shapeGradient: Array<string>;
  newShape: Array<{ color: string; blobData?: BlobData }>;
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
  setFractalBlur: (shadow: number) => void;
  setStretch: (shadow: number) => void;

  setWithImage: (img: boolean) => void;
  setCurrentPalette: (newPalette: string) => void;
  setResolution: {
    (updateType: ResolutionType, data: Partial<Resolution> | Resolution): void;
  };
  setBackgroundImage: ({
    src,
    currentIndex,
  }: {
    src: string;
    currentIndex?: number | undefined;
  }) => void;
  setIsGradient: (isGradient: boolean) => void;
  setSolidBackground: (newHex: string) => void;
  updateGradientColor: (
    paletteName: string,
    idx: number,
    newHex: string,
  ) => void;
  setNewBackgroundGradient: (background: {
    name: string;
    colors: Array<{ color: string }>;
  }) => void;
  setNewShape: (shape: Array<{ color: string }>) => void;
  updateShapeColor: (idx: number, newHex: string) => void;
  shuffleShapePosition: () => void;
  setBackgroundGradientFilters: (key: KeyProps, value: number) => void;
  setShapeGradientFiltersSet: (key: KeyProps, value: number) => void;
  setGrainIntensity: (intensity: number) => void;
}

export const useStore = create<StoreState & StoreActions>((set, get) => ({
  fractalSize: 0.3,
  distortion: 0.5,
  fractalMargin: 0.0,
  fractalShadow: 0.3,
  stretch: 0.0,
  fractalBlur: 0.0,

  resolution: {
    width: 1920,
    height: 1080,
  },
  currentPalette: "Complementary",
  withImage: false,
  backgroundImage: {
    src: "",
    currentIndex: undefined,
  },
  isGradient: true,
  backgroundGradient: backgroundGradientPalettes,
  newBackgroundGradient: backgroundGradientPalettes.map((palette) => ({
    name: palette.name,
    colors: palette.colors.map((color) => ({ color })),
  })),
  backgroundSolid: solidBackgroundColor,
  shapeGradient: gradientShapeColors,
  newShape: gradientShapeColors.map((color) => ({
    color,
  })),
  setResolution: (updateType, data) =>
    set((state) => {
      if (updateType === "partial") {
        return {
          resolution: { ...state.resolution, ...data },
        };
      }
      return { resolution: data };
    }),
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
  setCurrentPalette: (newPalette) =>
    set(() => ({ currentPalette: newPalette })),
  updateGradientColor: (paletteName, idx, newHex) => {
    const { newBackgroundGradient } = get();
    set(() => ({
      newBackgroundGradient: newBackgroundGradient.map((palette) =>
        palette.name === paletteName
          ? {
              ...palette,
              colors: palette.colors.map(({ color }, colorIdx) => ({
                color: colorIdx === idx ? newHex : color,
              })),
            }
          : palette,
      ),
    }));
  },
  setNewBackgroundGradient: (newBackground) => {
    const { newBackgroundGradient } = get();

    const newbg = newBackgroundGradient.map((palette) =>
      palette.name === newBackground.name
        ? { ...palette, colors: newBackground.colors }
        : palette,
    );

    set({ newBackgroundGradient: newbg });
  },
  setNewShape: (shape) => {
    set({ newShape: shape });
  },
  updateShapeColor: (idx, newHex) => {
    const { newShape } = get();
    // keep the  x, y cordation as it is, just update the color.

    set(() => ({
      newShape: newShape.map((shape, index) => ({
        ...shape,
        color: index === idx ? newHex : shape.color,
      })),
    }));
  },
  shuffleShapePosition: () => {
    const { newShape, resolution } = get();

    set({
      newShape: newShape.map((shape) => ({
        color: shape.color,
        blobData: generateBlobData(resolution.width!, resolution.height!),
      })),
    });
  },
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
  setFractalBlur: (blur) =>
    set(() => ({
      fractalBlur: blur,
    })),
  setStretch: (stretch) =>
    set(() => ({
      stretch,
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
