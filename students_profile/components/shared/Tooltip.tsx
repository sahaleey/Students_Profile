import React, { ReactNode } from "react";

interface TooltipProps {
  text: string;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export default function Tooltip({
  text,
  children,
  position = "top",
}: TooltipProps) {
  // Map positions to Tailwind classes
  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-gray-800 border-l-transparent border-r-transparent border-b-transparent",
    bottom:
      "bottom-full left-1/2 -translate-x-1/2 border-b-gray-800 border-l-transparent border-r-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-l-gray-800 border-t-transparent border-b-transparent border-r-transparent",
    right:
      "right-full top-1/2 -translate-y-1/2 border-r-gray-800 border-t-transparent border-b-transparent border-l-transparent",
  };

  return (
    <div className="group relative flex w-fit items-center justify-center">
      {/* The element being hovered */}
      {children}

      {/* The Tooltip Bubble */}
      <div
        className={`absolute z-50 hidden group-hover:flex flex-col items-center whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${positionClasses[position]}`}
      >
        <span className="bg-gray-800 text-white text-[11px] font-bold px-2.5 py-1.5 rounded shadow-lg tracking-wide">
          {text}
        </span>
        {/* The little triangle pointer */}
        <div
          className={`absolute border-[4px] ${arrowClasses[position]}`}
        ></div>
      </div>
    </div>
  );
}
