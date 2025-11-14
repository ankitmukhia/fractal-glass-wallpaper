"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";

export default function Movable({ children, id }: { children: React.ReactNode, id: string }){
	const { attributes, listeners, setNodeRef, transform } = useDraggable({
		id
	});

	// live offset while dragging
	const style = transform
		? {
			transform: `translate3d(${transform?.x}px, ${transform?.y}px, 0)`,
		}
		: undefined;

	return (
		<div ref={setNodeRef} {...listeners} {...attributes} style={style}>
			{children}
		</div>
	);
}
