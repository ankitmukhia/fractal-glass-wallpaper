"use client";

import { getRangeStep } from "@/lib/utils/shape";
import { cn } from "@/lib/utils";

interface RangeInputProps {
  min: number;
  max: number;
  step: number;
  value: number;
  label: string;
  className?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  innerStyle?: string;
  outerStyle?: string;
}

export const RangeInput = ({
  min,
  max,
  step,
  value,
  label,
  onChange,
  innerStyle,
  outerStyle,
  disabled = false,
}: RangeInputProps) => {
  const { percentage } = getRangeStep(max, min, step, value);

  return (
    <div
      className={cn(
        "group relative h-10 border rounded-[14px] overflow-hidden",
        outerStyle,
      )}
    >
      <div className="flex items-center h-full rounded-2xl px-2">
        <input
          aria-label="Fluted glass size"
          className={`slider w-full appearance-none h-full bg-transparent focus:outline-none z-10 ${disabled ? "group-hover:cursor-not-allowed" : "group-hover:cursor-grab active:cursor-grabbing"}`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
        <div
          className={cn(
            `absolute inset-0 flex bg-input/50 rounded-[10px] pointer-events-none`,
            innerStyle,
            {
              "opacity-50 [.group:hover .slider::-webkit-slider-thumb]:bg-none":
                disabled,
            },
          )}
          style={{ width: `${percentage}%` }}
        />

        <div
          className={cn(
            `absolute inset-0 flex items-center font-semibold text-neutral-400 justify-between pointer-events-none px-4`,
            {
              "opacity-50": disabled,
            },
          )}
        >
          <span>{label}</span>
          <span>{Number(value).toFixed(2)}</span>
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
