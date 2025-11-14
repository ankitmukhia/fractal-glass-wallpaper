"use client";

import dynamic from "next/dynamic";
import { useState, useRef } from "react";
import { FluttedGlass } from "@/components/flutted-glass";
import { defaultRangeValues } from "@/lib/constants";
import {
	PlusIcon,
	ChevronDownIcon,
	UploadIcon,
} from "lucide-react";
import { RangeInput } from "@/components/ui/range-input";
import { useStore } from "@/stores/fractal-store";
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
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { HexColorPicker } from "react-colorful";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
const Movable = dynamic(() => import("@/components/movable"), { ssr: false });

export const Desktop = () => {
	const store = useStore();
	const imageInputRef = useRef<HTMLInputElement>(null);
	const [bgImage, setBgImage] = useState({ src: "", withImage: false });
	const [position, setPosition] = useState({ x: 0, y: 0 });

	const [size, setSize] = useState<number>(0.29);
	const [zoom, setZoom] = useState(0.4);
	const sizeRef = useRef<number>(size);
	sizeRef.current = size;

	const [distrotion, setDistrotion] = useState(0.5);
	const distortionRef = useRef<number>(distrotion);
	distortionRef.current = distrotion;

	const [fractalMargin, setFractalMargin] = useState(0.0);
	const fractalMarginRef = useRef<number>(fractalMargin);
	fractalMarginRef.current = fractalMargin;

	const [fractalShadow, setFractalShadow] = useState(0.10);
	const fractalShadowRef = useRef<number>(fractalShadow);
	fractalShadowRef.current = fractalShadow;

	function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (file) {
			const render = new FileReader();
			render.onloadend = () => {
				setBgImage({ src: render.result as string, withImage: true })
			}
			render.readAsDataURL(file)
		}
	}

	function handleSizeChange(e: React.ChangeEvent<HTMLInputElement>) {
		const v = parseFloat(e.target.value);
		setSize(v);
		sizeRef.current = v;
	}

	function handleDistrotionChange(e: React.ChangeEvent<HTMLInputElement>) {
		const v = parseFloat(e.target.value);
		setDistrotion(v);
		distortionRef.current = v;
	}

	function handleFractalMarginChange(e: React.ChangeEvent<HTMLInputElement>) {
		const v = parseFloat(e.target.value);
		setFractalMargin(v);
		fractalMarginRef.current = v;
	}

	function handleFractalShadowChange(e: React.ChangeEvent<HTMLInputElement>) {
		const v = parseFloat(e.target.value);
		setFractalShadow(v);
		fractalShadowRef.current = v;
	}

	function handleBgGradientFilterChange(e: React.ChangeEvent<HTMLInputElement>, key: keyof typeof store.backgroundGradientFilters) {
		const v = parseFloat(e.target.value);
		store.setBackgroundGradientFilters(key, v);
	}

	function handleShapeGradientFilterChange(e: React.ChangeEvent<HTMLInputElement>, key: keyof typeof store.shapeGradientFilters) {
		const v = parseFloat(e.target.value);
		store.setShapeGradientFiltersSet(key, v);
	}

	function handleGrainIntensityChange(e: React.ChangeEvent<HTMLInputElement>) {
		const v = parseFloat(e.target.value);
		store.setGrainIntensity(v);
	}

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

				<div className="max-w-[300px] bg-white border-2 border-neutral-200/60 rounded-3xl">
					<div className="flex flex-col w-full h-full">
						<div className="p-4">
							<div
								className="relative flex items-center gap-2 border border-neutral-100 rounded-xl p-2 cursor-pointer"
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
								<p className="font-semibold text-neutral-400">Upload Image</p>
							</div>
						</div>

						<Separator className="bg-neutral-100" />

						<div className="space-y-2 p-4">
							<RangeInput
								label="Size"
								min={defaultRangeValues.size.min}
								max={defaultRangeValues.size.max}
								step={defaultRangeValues.size.step}
								size={size}
								onChange={handleSizeChange}
							/>

							<RangeInput
								label="Distrotion"
								min={defaultRangeValues.distrotion.min}
								max={defaultRangeValues.distrotion.max}
								step={defaultRangeValues.distrotion.step}
								size={distrotion}
								onChange={handleDistrotionChange}
							/>

							<RangeInput
								label="Shadow"
								min={defaultRangeValues.shadow.min}
								max={defaultRangeValues.shadow.max}
								step={defaultRangeValues.shadow.step}
								size={fractalShadow}
								onChange={handleFractalShadowChange}
							/>

							{/* It controls that bg edge strtching */}
							<RangeInput
								label="Stretch"
								min={0}
								max={100}
								step={2}
								size={60}
								onChange={() => { }}
							/>

							<RangeInput
								label="Blur"
								min={0}
								max={100}
								step={2}
								size={20}
								onChange={() => { }}
							/>

							<RangeInput
								label="Margin"
								min={defaultRangeValues.fractalMargin.min}
								max={defaultRangeValues.fractalMargin.max}
								step={defaultRangeValues.fractalMargin.step}
								size={fractalMargin}
								onChange={handleFractalMarginChange}
							/>
						</div>

						<Separator className="bg-neutral-100" />

						<Tabs defaultValue="background" className="w-full p-4">
							<TabsList className="w-full h-10">
								<TabsTrigger value="background">
									Background
								</TabsTrigger>
								<TabsTrigger value="shape">
									Shape
								</TabsTrigger>
							</TabsList>

							<Separator className="bg-neutral-100" />

							<TabsContent value="background">
								<div className="flex flex-col gap-2">
									<RangeInput
										label="Blur"
										min={0}
										max={100}
										step={1}
										size={store.backgroundGradientFilters.blur}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBgGradientFilterChange(e, "blur")}
									/>

									<RangeInput
										label="Saturation"
										min={0}
										max={200}
										step={1}
										size={store.backgroundGradientFilters.saturation}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBgGradientFilterChange(e, "saturation")}
									/>

									<RangeInput
										label="Contrast"
										min={0}
										max={200}
										step={1}
										size={store.backgroundGradientFilters.contrast}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBgGradientFilterChange(e, "contrast")}
									/>

									<RangeInput
										label="Brightness"
										min={0}
										max={200}
										step={2}
										size={store.backgroundGradientFilters.brightness}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBgGradientFilterChange(e, "brightness")}
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
										size={store.shapeGradientFilters.blur}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleShapeGradientFilterChange(e, "blur")}
									/>
									<RangeInput
										label="Saturation"
										min={0}
										max={200}
										step={1}
										size={store.shapeGradientFilters.saturation}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleShapeGradientFilterChange(e, "saturation")}
									/>

									<RangeInput
										label="Contrast"
										min={0}
										max={200}
										step={1}
										size={store.shapeGradientFilters.contrast}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleShapeGradientFilterChange(e, "contrast")}
									/>

									<RangeInput
										label="Brightness"
										min={0}
										max={200}
										step={2}
										size={store.shapeGradientFilters.brightness}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleShapeGradientFilterChange(e, "brightness")}
									/>
								</div>
							</TabsContent>
						</Tabs>

						<Separator className="bg-neutral-100" />

						<div className="space-y-2 p-4">
							<RangeInput
								label="Grain Intensity"
								min={0}
								max={100}
								step={1}
								size={store.grainIntensity}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleGrainIntensityChange(e)}
							/>
						</div>
					</div>
				</div>

				<div className="fixed top-4 left-1/2 -translate-x-1/2 z-10 border border-neutral-200/60 bg-white rounded-3xl p-2">
					<div className="flex gap-4">
						<div>
							<DropdownMenu>
								<DropdownMenuTrigger asChild className="rounded-xl">
									<Button variant="outline">
										100%
										<ChevronDownIcon className="size-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									{/* <DropdownMenuSeparator /> */}
									<DropdownMenuItem
										onClick={() => setZoom((prev) => Math.min(prev + 0.1, 1.0))}
									>
										Zoom in
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => setZoom((prev) => Math.max(prev - 0.1, 0.1))}
									>
										Zoom out
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setZoom(1.0)}>
										Zoom to 100%
									</DropdownMenuItem>
									<DropdownMenuItem>Zoom to fit</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
						<div className="flex gap-2">
							<Button
								variant="link"
								className="rounded-xl"
								onClick={() =>
									setPosition((prev) => ({ x: prev.x - 40, y: prev.y }))
								}
							>
								<svg className="inline-flex size-5 fill-primary rotate-180" width="20" height="20" viewBox="0 0 20 20"><path d="M12.183 4.3a.75.75 0 0 1 1.061 0l3.44 3.441a3.25 3.25 0 0 1 0 4.596l-3.44 3.441a.75.75 0 0 1-1.061-1.061l3.441-3.441a1.75 1.75 0 0 0 .298-.397l.043-.091H3.13a.75.75 0 0 1-.743-.648l-.007-.102a.75.75 0 0 1 .75-.75h12.836l-.044-.09c-.052-.095-.114-.186-.184-.272l-.114-.125-3.44-3.441a.75.75 0 0 1 0-1.061z"></path></svg>
							</Button>
							<Button
								variant="link"
								className="rounded-xl"
								onClick={() =>
									setPosition((prev) => ({ x: prev.x + 40, y: prev.y }))
								}
							>
								<svg className="inline-flex size-5 fill-primary" width="20" height="20" viewBox="0 0 20 20"><path d="M12.183 4.3a.75.75 0 0 1 1.061 0l3.44 3.441a3.25 3.25 0 0 1 0 4.596l-3.44 3.441a.75.75 0 0 1-1.061-1.061l3.441-3.441a1.75 1.75 0 0 0 .298-.397l.043-.091H3.13a.75.75 0 0 1-.743-.648l-.007-.102a.75.75 0 0 1 .75-.75h12.836l-.044-.09c-.052-.095-.114-.186-.184-.272l-.114-.125-3.44-3.441a.75.75 0 0 1 0-1.061z"></path></svg>
							</Button>
						</div>

						<Button className="bg-neutral-200 text-neutral-700 border border-neutral-300">
							Export
						</Button>
					</div>
				</div>

				{/* Main preview */}
				<DndContext onDragEnd={handleDragEnd}>
					<div className="relative flex items-center justify-center w-full rounded-3xl overflow-hidden">
						<Movable id="flutted-glass">
							<div
								className="relative cursor-grab active:cursor-grabbing"
								style={{
									width: store.resolution.width * zoom,
									height: store.resolution.height * zoom,
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
									<FluttedGlass
										size={size}
										sizeRef={sizeRef}
										distortion={distrotion}
										distortionRef={distortionRef}
										fractalMargin={fractalMargin}
										fractalMarginRef={fractalMarginRef}
										fractalShadow={fractalShadow}
										fractalShadowRef={fractalShadowRef}
										bgImage={bgImage}
									/>
								</div>
							</div>
						</Movable>
					</div>
				</DndContext>

				{/* Right side bar */}
				<div className="min-w-[300px] bg-white border-2 border-neutral-200/60 rounded-3xl">
					<div className="p-4 space-y-4">
						<div className="flex items-center justify-between">
							<h1 className="text-sm font-semibold tracking-wide">
								Background
							</h1>
							<PlusIcon className="size-4" />
						</div>

						<div className="flex flex-col gap-2">
							{store.backgroundGradient.map((palette, paletteIdx) => (
								<div key={paletteIdx} className="flex flex-col gap-2">
									{palette.colors.map((hex, index) => (
										<Popover key={index}>
											<div className="flex items-center px-1 border border-neutral-100 rounded-xl h-11">
												<PopoverTrigger asChild>
													<div className="flex items-center gap-2 font-semibold text-neutral-400">
														<Button
															className="h-9 w-9 rounded-lg"
															style={{ backgroundColor: `#${hex}` }}
														/>
														<div>
															<span className="text-sm tracking-wide">{"#" + hex}</span>
														</div>
													</div>
												</PopoverTrigger>

												<PopoverContent className="w-auto p-10">
													<HexColorPicker color={hex} onChange={(newHex) => store.setBackgroundGradient(palette.name, index, newHex.slice(1))} />
												</PopoverContent>
											</div>
										</Popover>
									))}
								</div>
							))}
						</div>
					</div>

					<div className="p-4 space-y-4">
						<div className="flex items-center justify-between">
							<h1 className="text-sm font-semibold tracking-wide">
								Shape
							</h1>
							<PlusIcon className="size-4" />
						</div>

						<div className="flex flex-col gap-2">
							{store.shapeGradient.map((color, idx) => (
								<div key={idx} className="flex flex-col gap-2">
									<Popover>
										<div className="flex items-center px-1 border border-neutral-100 rounded-xl h-11">
											<PopoverTrigger asChild>
												<div className="flex items-center gap-2 font-semibold text-neutral-400">
													<Button
														className="h-9 w-9 rounded-lg"
														style={{ backgroundColor: `#${color}` }}
													/>
													<span className="text-sm tracking-wide">{"#" + color}</span>
												</div>
											</PopoverTrigger>

											<PopoverContent className="w-auto p-2">
												<HexColorPicker
													color={color}
													onChange={(newHex) => store.setShapeGradient(idx, newHex.slice(1))}
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
	)
}
