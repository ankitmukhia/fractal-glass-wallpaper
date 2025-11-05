"use client"

import { useState } from "react";
import { DndContext, useDraggable, DragEndEvent } from "@dnd-kit/core";

function Movable({ position }: { position: { x: number, y: number } }) {
	const { attributes, listeners, setNodeRef } = useDraggable({
		id: "movable",
	});

	const style = {
		transform: `translate(${position.x}px, ${position.y}px)`,
		width: 100,
		height: 100,
		background: "skyblue",
		borderRadius: 8,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		cursor: "grab",
	};

	return (
		<div ref={setNodeRef} {...listeners} {...attributes} style={style}>
			Drag me
		</div>
	);
}

export default function Home() {
	const [position, setPosition] = useState({ x: 0, y: 0 })

	console.log(position)

	const handleDragEnd = (e: DragEndEvent) => {
		const { delta } = e;

		setPosition((prev) => ({
			x: prev.x + delta.x,
			y: prev.y + delta.y
		}))
	}

	return (
		<div className="flex items-center justify-center h-dvh">
			{/* Left side bar */}

			{/* Main preview */}
			<DndContext onDragEnd={handleDragEnd}>
				<div
					style={{
						width: "100vw",
						height: "100vh",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						background: "#f0f0f0",
					}}
				>
					<Movable position={position} />
				</div>
			</DndContext>

			{/* Right side bar */}
		</div>
	);
}
