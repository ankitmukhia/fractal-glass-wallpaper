"use client";

import { getRangeStep } from "@/lib/utils/shape";

interface RangeInputProps {
  min: number;
  max: number;
  step: number;
  value: number;
  label: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const RangeInput = ({
  min,
  max,
  step,
  value,
  label,
  onChange,
}: RangeInputProps) => {
  const { percentage } = getRangeStep(max, min, step, value);

  return (
    <div className="group relative h-10 border rounded-[14px] overflow-hidden">
      <div className="flex items-center h-full rounded-2xl px-2">
        <input
          aria-label="Fluted glass size"
          className="slider appearance-none h-full bg-transparent group-hover:cursor-grab active:cursor-grabbing focus:outline-none z-10"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          style={{
            width: 300,
          }}
        />
        <div
          className="absolute inset-0 flex bg-input/50 rounded-[10px] pointer-events-none"
          style={{ width: `${percentage}%` }}
        ></div>

        <div className="absolute inset-0 flex items-center font-semibold text-neutral-400 justify-between pointer-events-none px-4">
          <div>{label}</div>
          <div>{Number(value).toFixed(2)}</div>
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
