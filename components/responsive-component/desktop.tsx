"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useState, useRef, useEffect } from "react";
import { FluttedGlass } from "@/components/opt-flutted-glass";
/* import { FluttedGlass } from "@/components/flutted-glass"; */
import {
  defaultRangeValues,
  exampleImages,
  resolutionsSizes,
  backgroundGradientPalettes,
} from "@/lib/constants";
import {
  PlusIcon,
  ChevronDownIcon,
  UploadIcon,
  ImageIcon,
  PaintBucketIcon,
  PaletteIcon,
  BoxIcon,
  PaintbrushVerticalIcon,
  XIcon,
  ShuffleIcon,
  CommandIcon,
  MinusIcon,
} from "lucide-react";
import { RightArrowIcon, LeftArrowIcon } from "@/assets/icons/svgs";
import { RangeInput } from "@/components/ui/range-input";
import { useStore } from "@/stores/fractal-store";
import { debounceResolutionUpdate } from "@/lib/debounce-custom-resolution";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { HexColorPicker } from "react-colorful";
import { cn } from "@/lib/utils";
const Movable = dynamic(() => import("@/components/movable"), { ssr: false });

export const Desktop = ({
  exportAsImageAction,
}: {
  exportAsImageAction: () => void;
}) => {
  const store = useStore();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [customResolution, setCustomResolution] = useState<{
    width?: string;
    height?: string;
  }>({
    width: "",
    height: "",
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.4);
  const paletteItemsRef = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (!store.resolution) return;

    setCustomResolution({
      width: String(store.resolution.width),
      height: String(store.resolution.height),
    });
  }, [store.resolution]);

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const render = new FileReader();
      render.onloadend = () => {
        store.setWithImage(true);
        store.setBackgroundImage({ src: render.result as string });
      };
      render.readAsDataURL(file);
    }
  }

  function handleSizeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseFloat(e.target.value);
    store.setFractalSize(v);
  }

  function handleDistrotionChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseFloat(e.target.value);
    store.setDistortion(v);
  }

  function handleFractalMarginChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseFloat(e.target.value);
    store.setFractalMargin(v);
  }

  function handleFractalShadowChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseFloat(e.target.value);
    store.setFractalShadow(v);
  }

  function handleFractalBlurChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseFloat(e.target.value);
    store.setFractalBlur(v);
  }

  function handleFractalStretchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseFloat(e.target.value);
    store.setStretch(v);
  }

  function handleBgGradientFilterChange(
    e: React.ChangeEvent<HTMLInputElement>,
    key: keyof typeof store.backgroundGradientFilters,
  ) {
    const v = parseFloat(e.target.value);
    store.setBackgroundGradientFilters(key, v);
  }

  function handleShapeGradientFilterChange(
    e: React.ChangeEvent<HTMLInputElement>,
    key: keyof typeof store.shapeGradientFilters,
  ) {
    const v = parseFloat(e.target.value);
    store.setShapeGradientFiltersSet(key, v);
  }

  function handleGrainIntensityChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseFloat(e.target.value);
    store.setGrainIntensity(v);
  }

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value: inputValue } = e.target;
    setCustomResolution((prev) => ({
      ...prev,
      [e.target.name]: inputValue,
    }));
    debounceResolutionUpdate({ width: Number(inputValue) });
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value: inputValue } = e.target;
    setCustomResolution((prev) => ({
      ...prev,
      [e.target.name]: inputValue,
    }));
    debounceResolutionUpdate({ height: Number(inputValue) });
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { delta } = e;
    setPosition((prev) => ({
      x: prev.x + delta.x,
      y: prev.y + delta.y,
    }));
  };

  return (
    <div className="flex items-center justify-center h-dvh">
      <div className="flex justify-between h-full w-full p-4">
        {/* Left side bar */}
        <div className="min-w-80 max-w-96 bg-sidebar border rounded-3xl">
          <div className="flex flex-col w-full h-full">
            <div className="p-4">
              <Tabs defaultValue="gradient" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="gradient">
                    <PaletteIcon />
                    Gradient
                  </TabsTrigger>
                  <TabsTrigger value="image">
                    <ImageIcon />
                    Image
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="gradient">
                  <div className="space-y-2 pt-4">
                    <RangeInput
                      label="Size"
                      min={defaultRangeValues.size.min}
                      max={defaultRangeValues.size.max}
                      step={defaultRangeValues.size.step}
                      value={store.fractalSize}
                      onChange={handleSizeChange}
                    />

                    <RangeInput
                      label="Distrotion"
                      min={defaultRangeValues.distrotion.min}
                      max={defaultRangeValues.distrotion.max}
                      step={defaultRangeValues.distrotion.step}
                      value={store.distortion}
                      onChange={handleDistrotionChange}
                    />

                    <RangeInput
                      label="Shadow"
                      min={defaultRangeValues.shadow.min}
                      max={defaultRangeValues.shadow.max}
                      step={defaultRangeValues.shadow.step}
                      value={store.fractalShadow}
                      onChange={handleFractalShadowChange}
                    />

                    <RangeInput
                      label="Stretch"
                      min={defaultRangeValues.stretch.min}
                      max={defaultRangeValues.stretch.max}
                      step={defaultRangeValues.stretch.step}
                      value={store.stretch}
                      onChange={handleFractalStretchChange}
                    />

                    <RangeInput
                      label="Blur"
                      min={defaultRangeValues.blur.min}
                      max={defaultRangeValues.blur.max}
                      step={defaultRangeValues.blur.step}
                      value={store.fractalBlur}
                      onChange={handleFractalBlurChange}
                    />

                    <RangeInput
                      label="Margin"
                      min={defaultRangeValues.fractalMargin.min}
                      max={defaultRangeValues.fractalMargin.max}
                      step={defaultRangeValues.fractalMargin.step}
                      value={store.fractalMargin}
                      onChange={handleFractalMarginChange}
                    />

                    <Tabs defaultValue="background" className="w-full">
                      <div className="py-4">
                        <TabsList className="w-full">
                          <TabsTrigger
                            value="background"
                            disabled={store.withImage}
                          >
                            <PaintBucketIcon />
                            Background
                          </TabsTrigger>
                          <TabsTrigger value="shape" disabled={store.withImage}>
                            <BoxIcon />
                            Shape
                          </TabsTrigger>
                        </TabsList>
                      </div>

                      <TabsContent value="background">
                        <div className="flex flex-col gap-2">
                          <RangeInput
                            label="Blur"
                            min={0}
                            max={1200}
                            step={1}
                            disabled={store.withImage}
                            value={store.backgroundGradientFilters.blur}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) => handleBgGradientFilterChange(e, "blur")}
                          />

                          <RangeInput
                            label="Saturation"
                            min={0}
                            max={200}
                            step={1}
                            disabled={store.withImage}
                            value={store.backgroundGradientFilters.saturation}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) => handleBgGradientFilterChange(e, "saturation")}
                          />

                          <RangeInput
                            label="Contrast"
                            min={0}
                            max={200}
                            step={1}
                            disabled={store.withImage}
                            value={store.backgroundGradientFilters.contrast}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) => handleBgGradientFilterChange(e, "contrast")}
                          />

                          <RangeInput
                            label="Brightness"
                            min={0}
                            max={200}
                            step={2}
                            disabled={store.withImage}
                            value={store.backgroundGradientFilters.brightness}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) => handleBgGradientFilterChange(e, "brightness")}
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="shape">
                        <div className="flex flex-col gap-2">
                          <RangeInput
                            label="Blur"
                            min={0}
                            max={100}
                            step={1}
                            disabled={store.withImage}
                            value={store.shapeGradientFilters.blur}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) => handleShapeGradientFilterChange(e, "blur")}
                          />
                          <RangeInput
                            label="Saturation"
                            min={0}
                            max={200}
                            step={1}
                            disabled={store.withImage}
                            value={store.shapeGradientFilters.saturation}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) =>
                              handleShapeGradientFilterChange(e, "saturation")
                            }
                          />

                          <RangeInput
                            label="Contrast"
                            min={0}
                            max={200}
                            step={1}
                            disabled={store.withImage}
                            value={store.shapeGradientFilters.contrast}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) => handleShapeGradientFilterChange(e, "contrast")}
                          />

                          <RangeInput
                            label="Brightness"
                            min={0}
                            max={200}
                            step={2}
                            disabled={store.withImage}
                            value={store.shapeGradientFilters.brightness}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) =>
                              handleShapeGradientFilterChange(e, "brightness")
                            }
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </TabsContent>

                <TabsContent value="image">
                  <div className="space-y-2">
                    <div
                      className="relative flex items-center justify-center gap-3 border-2 border-dashed hover:border-foreground/50 rounded-md p-3 cursor-pointer"
                      onClick={() => {
                        if (imageInputRef.current) {
                          imageInputRef.current.click();
                        }
                      }}
                    >
                      <UploadIcon className="size-4 text-neutral-400" />
                      <Input
                        ref={imageInputRef}
                        onChange={handleImageSelect}
                        accept="image/*"
                        type="file"
                        className="hidden"
                      />
                      <p className="font-semibold text-neutral-400">
                        Upload Image
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {exampleImages.map((value, index) => (
                        <div
                          key={value.alt}
                          className={cn(`relative aspect-video rounded-lg`, {
                            "border border-foreground/80":
                              index === store.backgroundImage.currentIndex,
                          })}
                          onClick={() => {
                            store.setWithImage(true);
                            store.setBackgroundImage({
                              src: value.src,
                              currentIndex: index,
                            });
                          }}
                        >
                          <Image
                            alt={value.alt}
                            src={value.src}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            fill
                            className="rounded-md border border-border/10 hover:border-border cursor-pointer object-cover"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2 pt-4">
                      <RangeInput
                        label="Size"
                        min={defaultRangeValues.size.min}
                        max={defaultRangeValues.size.max}
                        step={defaultRangeValues.size.step}
                        value={store.fractalSize}
                        onChange={handleSizeChange}
                      />

                      <RangeInput
                        label="Distrotion"
                        min={defaultRangeValues.distrotion.min}
                        max={defaultRangeValues.distrotion.max}
                        step={defaultRangeValues.distrotion.step}
                        value={store.distortion}
                        onChange={handleDistrotionChange}
                      />

                      <RangeInput
                        label="Shadow"
                        min={defaultRangeValues.shadow.min}
                        max={defaultRangeValues.shadow.max}
                        step={defaultRangeValues.shadow.step}
                        value={store.fractalShadow}
                        onChange={handleFractalShadowChange}
                      />

                      <RangeInput
                        label="Stretch"
                        min={defaultRangeValues.stretch.min}
                        max={defaultRangeValues.stretch.max}
                        step={defaultRangeValues.stretch.step}
                        value={store.stretch}
                        onChange={handleFractalStretchChange}
                      />

                      <RangeInput
                        label="Blur"
                        min={defaultRangeValues.blur.min}
                        max={defaultRangeValues.blur.max}
                        step={defaultRangeValues.blur.step}
                        value={store.fractalBlur}
                        onChange={handleFractalBlurChange}
                      />

                      <RangeInput
                        label="Margin"
                        min={defaultRangeValues.fractalMargin.min}
                        max={defaultRangeValues.fractalMargin.max}
                        step={defaultRangeValues.fractalMargin.step}
                        value={store.fractalMargin}
                        onChange={handleFractalMarginChange}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <Separator />

            <div className="space-y-2 p-4">
              <RangeInput
                label="Grain Intensity"
                min={0}
                max={100}
                step={1}
                value={store.grainIntensity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleGrainIntensityChange(e)
                }
              />
            </div>
          </div>
        </div>

        <div className="fixed top-3 left-1/2 z-20 -translate-x-1/2 rounded-[1.25rem]">
          <div className="flex items-center gap-4 p-2">
            <Button
              variant="secondary"
              className="cursor-pointer"
              onClick={store.shuffleShapePosition}
            >
              <ShuffleIcon />
              Shuffle
            </Button>

            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="border dark:border-border/30"
                >
                  <span>{(zoom * 100).toFixed() + "%"}</span>
                  <ChevronDownIcon
                    className={`size-4 text-muted-foreground/70 transition-transform duration-150 ease-in-out ${isOpen && "rotate-180"}`}
                  />
                </Button>
              </PopoverTrigger>

              <PopoverContent
                className="w-44 p-[6px] dark:border-border/30 rounded-lg"
                align="start"
              >
                <div className="flex flex-col items-start">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex justify-between w-full rounded-lg px-2 text-foreground/60 hover:text-foreground dark:hover:bg-accent/10"
                    onClick={() => setZoom((prev) => Math.min(prev + 0.1, 1.0))}
                  >
                    Zoom in
                    <div className="flex items-center gap-[2px] bg-accent p-1 rounded-md">
                      <CommandIcon className="size-3" />{" "}
                      <PlusIcon className="size-3" />
                    </div>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex justify-between w-full rounded-lg px-2 text-foreground/60 hover:text-foreground dark:hover:bg-accent/10"
                    onClick={() => setZoom((prev) => Math.max(prev - 0.1, 0.1))}
                  >
                    Zoom out
                    <div className="flex items-center gap-[2px] bg-accent p-1 rounded-md">
                      <CommandIcon className="size-3" />{" "}
                      <MinusIcon className="size-3" />
                    </div>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex justify-start w-full rounded-lg px-2 text-foreground/60 hover:text-foreground dark:hover:bg-accent/10"
                    onClick={() => setZoom(0.4)}
                  >
                    Zoom to 40%
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex justify-start w-full rounded-lg px-2 text-foreground/60 hover:text-foreground dark:hover:bg-accent/10"
                    onClick={() => setZoom(0.5)}
                  >
                    Zoom to 50%
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex justify-start w-full rounded-lg px-2 text-foreground/60 hover:text-foreground dark:hover:bg-accent/10"
                    onClick={() => setZoom(1.0)}
                  >
                    Zoom to 100%
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <div className="flex gap-2">
              <Button
                onClick={() =>
                  setPosition((prev) => ({ x: prev.x - 40, y: prev.y }))
                }
              >
                <RightArrowIcon />
              </Button>
              <Button
                onClick={() =>
                  setPosition((prev) => ({ x: prev.x + 40, y: prev.y }))
                }
              >
                <LeftArrowIcon />
              </Button>
            </div>

            <RainbowButton className="w-45" onClick={exportAsImageAction}>
              Export
            </RainbowButton>
          </div>
        </div>

        {/* Main preview */}
        <DndContext onDragEnd={handleDragEnd}>
          <div className="relative flex items-center justify-center w-full rounded-3xl overflow-hidden">
            <Movable id="flutted-glass">
              <div
                className="relative cursor-grab active:cursor-grabbing"
                style={{
                  width: store.resolution.width! * zoom,
                  height: store.resolution.height! * zoom,
                  transform: `translate(${position.x}px, ${position.y}px)`,
                }}
              >
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: `${store.resolution.width}px`,
                    height: `${store.resolution.height}px`,
                    transform: `scale(${zoom})`,
                    transformOrigin: "top left",
                  }}
                >
                  <FluttedGlass />
                </div>
              </div>
            </Movable>
          </div>
        </DndContext>

        {/* Right side bar */}
        <div className="min-w-80 max-w-96 bg-sidebar border rounded-3xl">
          <div className="flex flex-col w-full h-full">
            <div className="space-y-4 p-4">
              <DropdownMenu
                open={isOpenDropdown}
                onOpenChange={setIsOpenDropdown}
              >
                <DropdownMenuTrigger asChild className="w-full rounded-lg">
                  <Button variant="outline" className="flex justify-between">
                    <div className="flex items-center gap-2">
                      {
                        resolutionsSizes.find(
                          (size) =>
                            size.width === store.resolution.width &&
                            size.height === store.resolution.height,
                        )?.name
                      }
                      <span className="pl-2 text-muted-foreground/60">
                        {store.resolution.width}x{store.resolution.height}
                      </span>
                    </div>
                    <ChevronDownIcon
                      className={`size-4 text-muted-foreground/70 transition-transform duration-150 ease-in-out ${isOpenDropdown && "rotate-180"}`}
                    />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="start"
                  className="w-[var(--radix-dropdown-menu-trigger-width)] p-[6px] rounded-lg"
                >
                  {resolutionsSizes.map((size) => (
                    <DropdownMenuItem
                      key={size.width}
                      className={cn(
                        `flex flex-col focus:bg-accent/10 w-full p-2 rounded-lg cursor-pointer text-foreground/60 hover:text-foreground`,
                        {
                          "bg-accent focus:bg-acc":
                            store.resolution.width === size.width &&
                            store.resolution.height === size.height,
                        },
                      )}
                      onClick={() =>
                        store.setResolution("direct", {
                          width: size.width,
                          height: size.height,
                        })
                      }
                    >
                      <span className="self-start">
                        {size.width}x{size.height}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="absolute top-[50%] -translate-y-1/2 pl-2">
                    W
                  </span>
                  <Input
                    type="number"
                    name="width"
                    className="pl-7.5 max-w-40"
                    value={customResolution.width}
                    onChange={handleWidthChange}
                  />
                </div>
                <div className="relative">
                  <span className="absolute top-[50%] -translate-y-1/2 pl-2">
                    H
                  </span>
                  <Input
                    type="number"
                    name="height"
                    className="pl-7.5 max-w-40"
                    value={customResolution.height}
                    onChange={handleHeightChange}
                  />
                </div>
                <span className="px-5 text-center">px</span>
              </div>

              <div className="flex items-center justify-between px-1">
                <h1>Background</h1>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-0 size-4 text-neutral-400"
                  onClick={() => {
                    // make it dynamic when you have switch between palette feat
                    const paletteName = store.currentPalette;
                    const palette = store.backgroundGradient.find(
                      (p) => p.name === paletteName,
                    );
                    if (!palette) return;
                    const getPalette = store.newBackgroundGradient.find(
                      (p) => p.name === paletteName,
                    );
                    if (!getPalette) return;
                    const existingColor = getPalette.colors.map(
                      (palette) => palette,
                    );

                    const index = getPalette.colors.length;
                    const newColor = {
                      color: palette.colors[index % palette.colors.length],
                    };

                    const addBackgroundColor = {
                      name: paletteName,
                      colors: [...existingColor, newColor],
                    };

                    store.setNewBackgroundGradient(addBackgroundColor);
                  }}
                  disabled={
                    store.withImage ||
                    store.newBackgroundGradient.find(
                      (p) => p.name === store.currentPalette,
                    )!.colors.length >= 10
                  }
                >
                  <PlusIcon />
                </Button>
              </div>

              <Tabs defaultValue="gradient" className="w-full">
                <div
                  className={`${store.withImage && "hover:cursor-not-allowed"}`}
                >
                  <TabsList className="w-full">
                    <TabsTrigger
                      value="gradient"
                      onClick={() => store.setIsGradient(true)}
                      disabled={store.withImage}
                    >
                      <PaletteIcon />
                      Gradient
                    </TabsTrigger>
                    <TabsTrigger
                      value="solid"
                      onClick={() => store.setIsGradient(false)}
                      disabled={store.withImage}
                    >
                      <PaintbrushVerticalIcon />
                      Solid
                    </TabsTrigger>
                  </TabsList>
                </div>

                <h1 className="px-1 my-2">Palettes</h1>
                <div
                  className={`flex overflow-x-auto no-scrollbar gap-2 justify-start rounded-lg p-[3px] max-w-80 ${store.withImage && "hover:cursor-not-allowed opacity-50"}`}
                >
                  {backgroundGradientPalettes.map((palette, index) => (
                    <button
                      key={palette.name}
                      ref={(el) => {
                        paletteItemsRef.current[index] = el;
                      }}
                      className={cn(`flex border`, {
                        "border-input": store.currentPalette === palette.name,
                        "cursor-pointer": !store.withImage,
                      })}
                      onClick={() => {
                        paletteItemsRef.current[index]?.scrollIntoView({
                          behavior: "smooth",
                          inline: "center",
                        });
                        store.setCurrentPalette(palette.name);
                      }}
                      disabled={store.withImage}
                    >
                      {palette.colors.map((color) => (
                        <div
                          key={color}
                          className="h-9 w-10"
                          style={{
                            backgroundColor: `#${color}`,
                          }}
                        />
                      ))}
                    </button>
                  ))}
                </div>

                <div className="space-y-2 pt-4">
                  <TabsContent value="gradient">
                    {store.newBackgroundGradient
                      .filter(
                        (palette) => palette.name === store.currentPalette,
                      )
                      .map((palette, paletteIdx) => {
                        return (
                          <div
                            key={paletteIdx}
                            className={`flex flex-col gap-3 ${store.withImage && "hover:cursor-not-allowed"}`}
                          >
                            {palette.colors.map(({ color }, index) => (
                              <Popover key={index}>
                                <div className="flex items-center px-2 py-1 border bg-muted rounded-md h-9">
                                  <div className="flex items-center justify-between w-full text-neutral-400">
                                    <div className="flex items-center gap-3">
                                      <PopoverTrigger
                                        asChild
                                        disabled={store.withImage}
                                      >
                                        <Button
                                          className="h-5 px-3 rounded-none border border-input"
                                          style={{
                                            backgroundColor: `#${color}`,
                                          }}
                                        />
                                      </PopoverTrigger>
                                      <span className="tracking-wide lowercase">
                                        {"#" + color}
                                      </span>
                                    </div>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-0 size-4"
                                      onClick={() => {
                                        const findPalette =
                                          store.newBackgroundGradient.find(
                                            (p) => p.name === palette.name,
                                          );
                                        if (!findPalette) return;
                                        const filteredColor =
                                          findPalette.colors.filter(
                                            (_, cI) => cI !== index,
                                          );

                                        const removeColor = {
                                          name: palette.name,
                                          colors: filteredColor,
                                        };

                                        store.setNewBackgroundGradient(
                                          removeColor,
                                        );
                                      }}
                                      disabled={
                                        store.newBackgroundGradient.find(
                                          (p) => p.name === palette.name,
                                        )!.colors.length <= 2 || store.withImage
                                      }
                                    >
                                      <XIcon />
                                    </Button>
                                  </div>

                                  <PopoverContent className="w-auto p-2">
                                    <HexColorPicker
                                      color={color}
                                      onChange={(newHex) =>
                                        store.updateGradientColor(
                                          palette.name,
                                          index,
                                          newHex.slice(1),
                                        )
                                      }
                                    />
                                  </PopoverContent>
                                </div>
                              </Popover>
                            ))}
                          </div>
                        );
                      })}
                  </TabsContent>

                  <TabsContent value="solid">
                    <Popover>
                      <div className="flex ittems-center px-2 py-1 border rounded-md bg-muted h-9">
                        <PopoverTrigger asChild>
                          <div className="flex items-center justify-between w-full text-neutral-400">
                            <div className="flex items-center gap-3">
                              <Button
                                className="h-5 px-3 rounded-none border border-input"
                                style={{
                                  backgroundColor: `#${store.backgroundSolid}`,
                                }}
                              />
                              <div>
                                <span className="text-sm tracking-wide">
                                  {"#" + store.backgroundSolid}
                                </span>
                              </div>
                            </div>
                          </div>
                        </PopoverTrigger>

                        <PopoverContent className="w-auto p-2">
                          <HexColorPicker
                            color={store.backgroundSolid}
                            onChange={(newHex) =>
                              store.setSolidBackground(newHex.slice(1))
                            }
                          />
                        </PopoverContent>
                      </div>
                    </Popover>
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            <Separator />

            <div className="space-y-4 p-4">
              <div className="flex items-center justify-between px-1">
                <h1>Shape</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-0 size-4 text-neutral-400"
                  onClick={() => {
                    const addShape = {
                      color:
                        store.shapeGradient[
                          store.newShape.length % store.shapeGradient.length
                        ],
                    };

                    store.setNewShape([...store.newShape, addShape]);
                  }}
                  disabled={store.newShape.length >= 10 || store.withImage}
                >
                  <PlusIcon />
                </Button>
              </div>

              <div className="flex flex-col gap-3">
                {store.newShape.map(({ color }, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col gap-2 ${store.withImage && "hover:cursor-not-allowed"}`}
                  >
                    <Popover>
                      <div className="flex items-center border rounded-md bg-muted px-2 py-1 h-9">
                        <div className="flex items-center justify-between w-full text-neutral-400">
                          <div className="flex items-center gap-3">
                            <PopoverTrigger asChild disabled={store.withImage}>
                              <Button
                                className="h-5 px-3 rounded-none border border-input"
                                style={{ backgroundColor: `#${color}` }}
                              />
                            </PopoverTrigger>
                            <span className="tracking-wide lowercase">
                              {"#" + color}
                            </span>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-0 size-4"
                            onClick={() => {
                              store.setNewShape(
                                store.newShape.filter(
                                  (_, index) => index !== idx,
                                ),
                              );
                            }}
                            disabled={store.withImage}
                          >
                            <XIcon />
                          </Button>
                        </div>

                        <PopoverContent className="w-auto p-2">
                          <HexColorPicker
                            color={color}
                            onChange={(newHex) =>
                              store.updateShapeColor(idx, newHex.slice(1))
                            }
                          />
                        </PopoverContent>
                      </div>
                    </Popover>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
