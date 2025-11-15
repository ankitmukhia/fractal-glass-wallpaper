"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useState, useRef } from "react";
import { FluttedGlass } from "@/components/flutted-glass";
import { defaultRangeValues, exampleImages } from "@/lib/constants";
import {
	PlusIcon,
	ChevronDownIcon,
	UploadIcon,
	ImageIcon,
	PaintBucketIcon,
	PaletteIcon,
	BoxIcon,
	PaintbrushVerticalIcon,
	XIcon
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
import { cn } from "@/lib/utils";
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
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(0.4);

	function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (file) {
			const render = new FileReader();
			render.onloadend = () => {
				store.setWithImage(true);
				store.setBackgroundImage({ src: render.result as string });
			}
			render.readAsDataURL(file)
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
				<div className="min-w-80 max-w-96 bg-sidebar border-1 rounded-3xl">
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

										{/* It controls that bg edge strtching */}
										<RangeInput
											label="Stretch"
											min={0}
											max={100}
											step={2}
											value={60}
											onChange={() => { }}
										/>

										<RangeInput
											label="Blur"
											min={0}
											max={100}
											step={2}
											value={20}
											onChange={() => { }}
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
													<TabsTrigger value="background">
														<PaintBucketIcon />
														Background
													</TabsTrigger>
													<TabsTrigger value="shape">
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
														value={store.backgroundGradientFilters.blur}
														onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBgGradientFilterChange(e, "blur")}
													/>

													<RangeInput
														label="Saturation"
														min={0}
														max={200}
														step={1}
														value={store.backgroundGradientFilters.saturation}
														onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBgGradientFilterChange(e, "saturation")}
													/>

													<RangeInput
														label="Contrast"
														min={0}
														max={200}
														step={1}
														value={store.backgroundGradientFilters.contrast}
														onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBgGradientFilterChange(e, "contrast")}
													/>

													<RangeInput
														label="Brightness"
														min={0}
														max={200}
														step={2}
														value={store.backgroundGradientFilters.brightness}
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
														value={store.shapeGradientFilters.blur}
														onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleShapeGradientFilterChange(e, "blur")}
													/>
													<RangeInput
														label="Saturation"
														min={0}
														max={200}
														step={1}
														value={store.shapeGradientFilters.saturation}
														onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleShapeGradientFilterChange(e, "saturation")}
													/>

													<RangeInput
														label="Contrast"
														min={0}
														max={200}
														step={1}
														value={store.shapeGradientFilters.contrast}
														onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleShapeGradientFilterChange(e, "contrast")}
													/>

													<RangeInput
														label="Brightness"
														min={0}
														max={200}
														step={2}
														value={store.shapeGradientFilters.brightness}
														onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleShapeGradientFilterChange(e, "brightness")}
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
											<p className="font-semibold text-neutral-400">Upload Image</p>
										</div>

										<div className="grid grid-cols-2 gap-2">
											{exampleImages.map((value, index) => (
												<div
													key={value.alt}
													className={cn(`relative aspect-video rounded-lg`, {
														"border border-foreground/80": index === store.backgroundImage.currentIndex
													})}
													onClick={() => {
														store.setWithImage(true);
														store.setBackgroundImage({ src: value.src, currentIndex: index });
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
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleGrainIntensityChange(e)}
							/>
						</div>
					</div>
				</div>

				<div className="fixed top-4 left-1/2 -translate-x-1/2 z-10 border bg-accent rounded-3xl p-2">
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
							<div className="flex items-center justify-between">
								<h1 className="text-sm font-semibold tracking-wide">
									Background
								</h1>
								<PlusIcon className="size-4" />
							</div>

							<Tabs defaultValue="gradient" className="w-full">
								<TabsList className="w-full">
									<TabsTrigger value="gradient" onClick={() => store.setIsGradient(true)}>
										<PaletteIcon />
										Gradient
									</TabsTrigger>
									<TabsTrigger value="solid" onClick={() => store.setIsGradient(false)}>
										<PaintbrushVerticalIcon />
										Solid
									</TabsTrigger>
								</TabsList>

								<div className="space-y-2 pt-4">
									<TabsContent value="gradient">
										{store.backgroundGradient.map((palette, paletteIdx) => (
											<div key={paletteIdx} className="flex flex-col gap-3">
												{palette.colors.map((hex, index) => (
													<Popover key={index}>
														<div className="flex items-center px-2 py-1 border bg-muted rounded-md h-9">
															<PopoverTrigger asChild>
																<div className="flex items-center justify-between w-full font-semibold text-neutral-400">
																	<div className="flex items-center gap-3">
																		<Button
																			className="h-5 px-3 rounded-none border border-input"
																			style={{ backgroundColor: `#${hex}` }}
																		/>
																		<span className="tracking-wide lowercase">{"#" + hex}</span>
																	</div>
																	<div>
																		<XIcon className="size-4" />
																	</div>
																</div>
															</PopoverTrigger>

															<PopoverContent className="w-auto p-2">
																<HexColorPicker color={hex} onChange={(newHex) => store.setBackgroundGradient(palette.name, index, newHex.slice(1))} />
															</PopoverContent>
														</div>
													</Popover>
												))}
											</div>
										))}
									</TabsContent>

									<TabsContent value="solid">
										<Popover>
											<div className="flex ittems-center px-2 py-1 border rounded-md bg-muted h-9">
												<PopoverTrigger asChild>
													<div className="flex items-center justify-between w-full font-semibold text-neutral-400">
														<div className="flex items-center gap-3">
															<Button
																className="h-5 px-3 rounded-none border border-input"
																style={{ backgroundColor: `#${store.backgroundSolid}` }}
															/>
															<div>
																<span className="text-sm tracking-wide">{"#" + store.backgroundSolid}</span>
															</div>
														</div>

														<div>
															<XIcon className="size-4" />
														</div>
													</div>
												</PopoverTrigger>

												<PopoverContent className="w-auto p-2">
													<HexColorPicker color={store.backgroundSolid} onChange={(newHex) => store.setSolidBackground(newHex.slice(1))} />
												</PopoverContent>
											</div>
										</Popover>
									</TabsContent>
								</div>
							</Tabs>
						</div>

						<Separator />

						<div className="space-y-4 p-4">
							<div className="flex items-center justify-between">
								<h1 className="text-sm font-semibold tracking-wide">
									Shape
								</h1>
								<PlusIcon className="size-4" />
							</div>

							<div className="flex flex-col gap-3">
								{store.shapeGradient.map((color, idx) => (
									<div key={idx} className="flex flex-col gap-2">
										<Popover>
											<div className="flex items-center border rounded-md bg-muted px-2 py-1 h-9">
												<PopoverTrigger asChild>
													<div className="flex items-center justify-between w-full font-semibold text-neutral-400">
														<div className="flex items-center gap-3">
															<Button
																className="h-5 px-3 rounded-none border border-input"
																style={{ backgroundColor: `#${color}` }}
															/>
															<span className="tracking-wide lowercase">{"#" + color}</span>
														</div>
														<div>
															<XIcon className="size-4" />
														</div>
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
		</div>
	)
}
