"use client"

// next need to work on state managment
import { useState, useRef } from "react";
import { FluttedGlass } from "@/components/flutted-glass"
import { defaultRangeValues } from "@/lib/constants";
import { PlusIcon, ChevronDownIcon, Plus, MinusIcon, ChevronRightIcon, ChevronLeftIcon } from "lucide-react";
import { RangeInput } from "@/components/ui/range-input";
import { useStore } from "@/stores/fractal-store";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { DndContext, useDraggable, DragEndEvent } from "@dnd-kit/core";

function Movable({ children }: { children: React.ReactNode }) {
	const { attributes, listeners, setNodeRef, transform } = useDraggable({
		id: "movable",
	});

	// live offset while dragging
	const style = transform ? {
		transform: `translate3d(${transform?.x}px, ${transform?.y}px, 0)`,
	} : undefined;

	return (
		<div ref={setNodeRef} {...listeners} {...attributes} style={style}>
			{children}
		</div>
	);
}

export default function Home() {
	const store = useStore();
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [size, setSize] = useState<number>(0.29);
	const [zoom, setZoom] = useState(0.4);
	const sizeRef = useRef<number>(size);
	sizeRef.current = size;

	function handleSizeChange(e: React.ChangeEvent<HTMLInputElement>) {
		const v = parseFloat(e.target.value);
		setSize(v);
		sizeRef.current = v;
	}

	const handleDragEnd = (e: DragEndEvent) => {
		const { delta } = e;

		setPosition((prev) => ({
			x: prev.x + delta.x,
			y: prev.y + delta.y
		}))
	};

	return (
		<div className="flex items-center justify-center h-dvh">
			<div className="flex justify-between h-full w-full p-4">
				{/* Left side bar */}

				<div className="max-w-[300px] bg-white border-2 border-neutral-200/60 rounded-3xl">
					<div className="flex flex-col h-full p-4 space-y-2">
						<RangeInput
							label="Distrotion"
							min={0}
							max={100}
							step={2}
							size={40}
							onChange={handleSizeChange}
						/>

						<RangeInput
							label="Size"
							min={defaultRangeValues.distrotion.min}
							max={defaultRangeValues.distrotion.max}
							step={defaultRangeValues.distrotion.step}
							size={size}
							onChange={handleSizeChange}
						/>
					</div>
				</div>

				<div className="fixed top-4 left-1/2 -translate-x-1/2 z-10 border border-neutral-200/60 bg-white rounded-3xl p-2">
					<div className="flex gap-4">
						<div>
							<DropdownMenu>
								<DropdownMenuTrigger asChild className="rounded-xl">
									<Button variant="outline">100%
										<ChevronDownIcon className="size-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									{/* <DropdownMenuSeparator /> */}
									<DropdownMenuItem
										onClick={() => setZoom(prev => Math.min(prev + 0.1, 1.0))}
									>
										Zoom in
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.1))}
									>
										Zoom out
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => setZoom(1.0)}
									>
										Zoom to 100%
									</DropdownMenuItem>
									<DropdownMenuItem

									>
										Zoom to fit
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
						<div className="flex gap-2">
							<Button
								variant="link"
								className="rounded-xl"
								onClick={() => {}}
							>
								<ChevronLeftIcon />	
							</Button>
							<Button
								variant="link"
								className="rounded-xl"
								onClick={() => {}}
							>
								<ChevronRightIcon />	
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
						<Movable>
							<div
								className="relative cursor-grab active:cursor-grabbing"
								style={{
									width: store.resolution.width * zoom,
									height: store.resolution.height * zoom,
									transform: `translate(${position.x}px, ${position.y}px)`
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
									<FluttedGlass size={size} sizeRef={sizeRef} />
								</div>
							</div>
						</Movable>
					</div>
				</DndContext>

				{/* Right side bar */}
				<div className="min-w-[300px] bg-white border-2 border-neutral-200/60 rounded-3xl">
					<div className="p-4 space-y-4">
						<div className="flex items-center justify-between">
							<h1 className="text-sm font-semibold tracking-wide text-neutral-500">Background</h1>
							<PlusIcon className="size-4" />
						</div>

						<div className="flex flex-col gap-2">
							{Array.from({ length: 5 }).map((_, idx) => (
								<div key={idx} className="flex items-center gap-2 border border-neutral-100 h-11 px-1 rounded-2xl font-semibold text-neutral-700">
									<div className="bg-orange-400 size-7 rounded-lg border border-orange-100" />
									<span className="">F4F4F4</span>
								</div>
							))}
						</div>

						<div className="flex items-center justify-between">
							<h1 className="text-sm font-semibold tracking-wide text-neutral-500">Shape</h1>
							<PlusIcon className="size-4" />
						</div>

						<div className="flex flex-col gap-2">
							{Array.from({ length: 5 }).map((_, idx) => (
								<div key={idx} className="flex items-center gap-2 border border-neutral-100 h-11 px-1 rounded-2xl font-semibold text-neutral-700">
									<div className="bg-blue-600 size-7 rounded-lg border border-orange-100" />
									<span>F4F4F4</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
