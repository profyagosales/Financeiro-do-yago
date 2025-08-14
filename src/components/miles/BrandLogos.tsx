import React from "react";

export function LiveloLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="32" height="32" rx="8" fill="#7F00FF" />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fontSize="12"
        fontFamily="sans-serif"
        fill="white"
      >
        L
      </text>
    </svg>
  );
}

export default LiveloLogo;
