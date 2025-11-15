// multiple gradient palettes can pick randomness
export const solidBackgroundColor = "090909";

export const backgroundGradientPalettes = [
  {
    name: "Serene Nautral Tones",
    colors: ["121216", "17161a"],
  },
];

export const gradientShapeColors = ["DC2525", "DC2525", "DC2525", "DC2525"];

export const defaultRangeValues = {
  distrotion: {
    min: 0.0,
    max: 1.0,
    step: 0.01,
  },
  size: {
    min: 0.0,
    max: 1.0,
    step: 0.01,
  },
  fractalMargin: {
    min: 0.0,
    max: 0.5,
    step: 0.01,
  },
  shadow: {
    min: 0.0,
    max: 1.0,
    step: 0.01,
  },
};

export const exampleImages = [
  {
    alt: "town-img",
    src: "/town.jpg",
  },
  {
    alt: "planet-img",
    src: "/planet.jpg",
  },
  {
    alt: "flower-img",
    src: "/pink-flower.jpg",
  },
  {
    alt: "ring-img",
    src: "/ring.jpeg",
  },
];

export const resolutionsSizes = [
  { name: "Small (4:3)", width: 800, height: 600 },
  { name: "Medium (4:3)", width: 1024, height: 768 },
  { name: "Large (5:4)", width: 1280, height: 1024 },
  { name: "XL Display (4:3)", width: 1600, height: 1200 },
  { name: "Full HD (16:9)", width: 1920, height: 1080 },
];
