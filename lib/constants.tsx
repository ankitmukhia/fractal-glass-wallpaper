import {
  PaletteIcon,
  PaintBucketIcon,
  ImageIcon,
  RectangleVerticalIcon,
} from "lucide-react";
export const solidBackgroundColor = "090909";

/*
 * "Complementary"
 * "Square"
 * "Monochromatic"
 * "Triadic"
 * "Analogous"
 * "Split"
 */
export const backgroundGradientPalettes = [
  {
    name: "Complementary",
    colors: ["0A0A0A", "212121", "383838", "4F4F4F"],
  },
  {
    name: "Monochromatic",
    colors: ["141414", "2a2a2a"],
  },
  {
    name: "Analogous",
    colors: ["1a2b1f", "1a1f2b"],
  },
  {
    name: "Square",
    colors: ["1f1b2d", "2d1b1b", "1b2d1f", "1b1f2d"],
  },
  {
    name: "Triadic",
    colors: ["1b2d2d", "2d1b2d", "2d2d1b"],
  },
  {
    name: "Split",
    colors: ["1a2235", "351a22"],
  },
];

export const gradientShapeColors = ["DC2525"];

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
  blur: {
    min: 0.0,
    max: 1.0,
    step: 0.01,
  },
  stretch: {
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

export const RESOLUTION_PRESETS = [
  {
    name: "16:9",
    width: 1920,
    height: 1080,
    category: "",
  },
  {
    name: "3:2",
    width: 1920,
    height: 1280,
    category: "",
  },
  {
    name: "4:3",
    width: 1920,
    height: 1440,
    category: "",
  },
  {
    name: "5:4",
    width: 1920,
    height: 1536,
    category: "",
  },
  {
    name: "1:1",
    width: 1920,
    height: 1920,
    category: "",
  },
  {
    name: "4:5",
    width: 1080,
    height: 1350,
    category: "",
  },
  {
    name: "3:4",
    width: 1080,
    height: 1440,
    category: "",
  },
  {
    name: "2:3",
    width: 1080,
    height: 1620,
    category: "",
  },
  {
    name: "9:16",
    width: 1080,
    height: 1920,
    category: "",
  },
  // Mobile Devices
  {
    name: "iPhone 15",
    width: 1179,
    height: 2556,
    category: "Mobile Devices",
  },
  {
    name: "iPhone 15 Pro",
    width: 1179,
    height: 2556,
    category: "Mobile Devices",
  },
  {
    name: "iPhone 15 Pro Max",
    width: 1290,
    height: 2796,
    category: "Mobile Devices",
  },
  {
    name: "Android (S)",
    width: 720,
    height: 1520,
    category: "Mobile Devices",
  },
  {
    name: "Android (M)",
    width: 1080,
    height: 2400,
    category: "Mobile Devices",
  },
  {
    name: "Android (L)",
    width: 1440,
    height: 3200,
    category: "Mobile Devices",
  },

  // Tablets
  { name: 'iPad Pro 12.9"', width: 2048, height: 2732, category: "Tablets" },
  { name: "iPad Air", width: 1668, height: 2388, category: "Tablets" },
  { name: "Samsung Tab S7", width: 2560, height: 1600, category: "Tablets" },

  // Desktop & Monitors
  {
    name: "2K (QHD)",
    width: 2560,
    height: 1440,
    category: "Desktop & Monitors",
  },
  {
    name: "Full HD",
    width: 1920,
    height: 1080,
    category: "Desktop & Monitors",
  },
  { name: "4K UHD", width: 3840, height: 2160, category: "Desktop & Monitors" },

  // Use:
  { name: "Open Graph", width: 1200, height: 630, category: "Metadata" },

  // Facebook
  { name: "Story/Reels", width: 1080, height: 1920, category: "Facebook" },
  { name: "Event Cover", width: 1920, height: 1005, category: "Facebook" },

  // Instagram
  { name: "Square Post", width: 1080, height: 1080, category: "Instagram" },
  { name: "Portrait Post", width: 1080, height: 1350, category: "Instagram" },
  { name: "Story/Reels", width: 1080, height: 1920, category: "Instagram" },

  // Twitter
  { name: "Post Image", width: 1600, height: 900, category: "Twitter" },
  { name: "Header", width: 1500, height: 500, category: "Twitter" },

  // LinkedIn
  { name: "Post", width: 1200, height: 627, category: "LinkedIn" },
  { name: "Banner", width: 1584, height: 396, category: "LinkedIn" },
];

export const mobileBarIcons = [
  { name: "Edits", icon: PaletteIcon },
  { name: "Image", icon: ImageIcon },
  { name: "Screens", icon: RectangleVerticalIcon },
  { name: "Background", icon: PaintBucketIcon },
];
