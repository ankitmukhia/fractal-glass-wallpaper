"use client"

// next need to work on state managment
import { useState, useRef } from "react";
import { FluttedGlass } from "@/components/flutted-glass"
import { defaultRangeValues } from "@/lib/constants";
import { getRangeStep } from "@/lib/utils/shape";

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
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [size, setSize] = useState<number>(0.29);
	const sizeRef = useRef<number>(size);
	sizeRef.current = size;

	const { percentage } = getRangeStep(defaultRangeValues.distrotion.max, defaultRangeValues.distrotion.min, defaultRangeValues.distrotion.step, size)

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
			<div className="flex justify-between h-full w-full">
				{/* Left side bar */}

				<div className="max-w-[300px] bg-white border-2 border-neutral-200/60 m-4 rounded-3xl">
					<div className="flex flex-col justify-center h-full p-2">
						<div className="group relative h-11 border border-neutral-100 rounded-2xl overflow-hidden">
							<div className="flex items-center h-full rounded-2xl px-2">
								<input
									aria-label="Fluted glass size"
									className="slider appearance-none h-full bg-transparent group-hover:cursor-grab active:cursor-grabbing focus:outline-none z-10"
									type="range"
									min={defaultRangeValues.distrotion.min}
									max={defaultRangeValues.distrotion.max}
									step={defaultRangeValues.distrotion.step}
									value={size}
									onChange={handleSizeChange}
									style={{
										width: 300,
									}}
								/>
								<div
									className="absolute inset-0 flex bg-neutral-200 rounded-2xl pointer-events-none"
									style={{ width: `${percentage}%` }}>
								</div>

								<div className="absolute inset-0 flex items-center font-semibold text-neutral-400 justify-between pointer-events-none px-4">
									<div>Size</div>
									<div>{Number(size).toFixed(2)}</div>
								</div>

								{/* <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
							{dots.map((_, index) => (
								![0,1,2].includes(index) && index !== dots.length - 1 ? <div key={index} className="h-[4px] w-[4px] bg-neutral-200 rounded-full" /> : <div key={index} className="h-[2px] w-[4px] rounded-full" />
							))}
						</div> */}
							</div>
						</div>
					</div>
				</div>

				{/* Main preview */}
				<DndContext onDragEnd={handleDragEnd}>
					<div className="relative flex items-center justify-center my-4 overflow-hidden w-full">
						<Movable>
							<div
								className="relative cursor-grab active:cursor-grabbing"
								style={{
									transform: `translate(${position.x}px, ${position.y}px)`
								}}
							>
								<FluttedGlass size={size} sizeRef={sizeRef} />
							</div>
						</Movable>
					</div>
				</DndContext>

				{/* Right side bar */}
				<div className="min-w-[300px] bg-white border-2 border-neutral-200/60 m-4 rounded-3xl">
					<div className="p-2">
						Third col
					</div>
				</div>
			</div>
		</div>
	);
}
