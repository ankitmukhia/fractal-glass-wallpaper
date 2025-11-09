"use client";

import { getRangeStep } from "@/lib/utils/shape";

interface RangeInputProps {
  min: number;
  max: number;
  step: number;
  size: number;
  label: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const RangeInput = ({
  min,
  max,
  step,
  size,
  label,
  onChange,
}: RangeInputProps) => {
  const { percentage } = getRangeStep(max, min, step, size);

  return (
    <div className="group relative h-11 border border-neutral-100 rounded-2xl overflow-hidden">
      <div className="flex items-center h-full rounded-2xl px-2">
        <input
          aria-label="Fluted glass size"
          className="slider appearance-none h-full bg-transparent group-hover:cursor-grab active:cursor-grabbing focus:outline-none z-10"
          type="range"
          min={min}
          max={max}
          step={step}
          value={size}
          onChange={onChange}
          style={{
            width: 300,
          }}
        />
        <div
          className="absolute inset-0 flex bg-neutral-100 rounded-2xl pointer-events-none"
          style={{ width: `${percentage}%` }}
        ></div>

        <div className="absolute inset-0 flex items-center font-semibold text-neutral-400 justify-between pointer-events-none px-4">
          <div>{label}</div>
          <div>{Number(size).toFixed(2)}</div>
        </div>

        {/* <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
							{dots.map((_, index) => (
								![0,1,2].includes(index) && index !== dots.length - 1 ? <div key={index} className="h-[4px] w-[4px] bg-neutral-200 rounded-full" /> : <div key={index} className="h-[2px] w-[4px] rounded-full" />
							))}
						</div> */}
      </div>
    </div>
  );
};
