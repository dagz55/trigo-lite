"use client";

import React from "react";

export default function PickMeUpNowButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group hover:scale-105 active:scale-95 transition-transform focus:outline-none"
      aria-label="Request Ride: Pick Me Up Now"
    >
      <svg
        width="512"
        height="512"
        viewBox="0 0 256 256"
        xmlns="http://www.w3.org/2000/svg"
        style={{ backgroundColor: "#000000" }}
      >
        <defs>
          <linearGradient
            id="autoGradient"
            x1="0.5"
            y1="0"
            x2="0.5"
            y2="1"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor="#46E8BD" />{" "}
            {/* Top: Bluish Green / Cyan */}
            <stop offset="30%" stopColor="#30F0A0" />
            <stop offset="60%" stopColor="#10FF70" /> {/* Mid Green */}
            <stop offset="100%" stopColor="#00FF00" />{" "}
            {/* Bottom: Bright Green */}
          </linearGradient>

          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.8" result="coloredBlur" />
          </filter>

          <g
            id="auto-rickshaw-shapes"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          >
            {/* Main Body Outline */}
            <path d="M 60 130 L 60 100 Q 65 90 75 90 L 125 90 Q 135 90 140 100 L 150 100 L 155 105 L 155 125 Q 155 135 145 140 L 80 140 Q 70 140 65 130 Z" />
            {/* Roof Line */}
            <path d="M 75 90 Q 100 87 125 90" />
            {/* Window Separator (Front Post / A-pillar) */}
            <path d="M 95 90 L 95 140" />
            {/* Window Separator (Door Post / B-pillar) */}
            <path d="M 125 90 L 125 140" />
            {/* Door Handle */}
            <line x1="130" y1="115" x2="134" y2="115" />
            {/* Rear Wheel */}
            <circle cx="80" cy="142" r="13" />
            <circle cx="80" cy="142" r="5" /> {/* Inner circle of rear wheel */}
            {/* Front Wheel */}
            <circle cx="150" cy="142" r="11" />
            {/* Front structure (fork/headlight mount) */}
            <path d="M 140 100 L 148 115 L 150 131" />
            {/* Headlight */}
            <circle cx="143" cy="102" r="3" />
          </g>
        </defs>

        {/* Auto Rickshaw Drawing */}
        {/* The group below centers the rickshaw drawing (defined from x:60-155, y:90-155) within the 256x256 viewBox */}
        {/* Rickshaw width: 155-60 = 95. Rickshaw height: 155-90 = 65. */}
        {/* TranslateX = (256 - 95)/2 - 60 = 80.5 - 60 = 20.5 */}
        {/* TranslateY = (256 - 65)/2 - 90 = 95.5 - 90 = 5.5 */}
        <g transform="translate(20.5, 5.5)">
          {/* Glow Layer: Thicker stroke, blurred */}
          <use
            href="#auto-rickshaw-shapes"
            stroke="url(#autoGradient)"
            strokeWidth="6"
            filter="url(#neonGlow)"
          />
          {/* Main Lines Layer: Thinner stroke, sharp */}
          <use
            href="#auto-rickshaw-shapes"
            stroke="url(#autoGradient)"
            strokeWidth="2"
          />
        </g>
      </svg>
    </button>
  );
}
