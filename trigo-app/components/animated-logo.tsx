"use client"

import { useEffect, useRef } from "react"

interface AnimatedLogoProps {
  size?: number | string
  className?: string
}

export function AnimatedLogo({ size = 64, className = "" }: AnimatedLogoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Ensure video plays and loops when component mounts
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error("Error playing logo animation:", error)
      })
    }
  }, [])

  return (
    <div
      className={`relative overflow-hidden rounded-full ${className}`}
      style={{
        width: typeof size === "number" ? `${size}px` : size,
        height: typeof size === "number" ? `${size}px` : size,
      }}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        src="/images/trigo-logo.mp4"
      >
        <source src="/images/trigo-logo.mp4" type="video/mp4" />
        {/* Fallback for browsers that don't support video */}
        <div className="w-full h-full bg-trigo-600 flex items-center justify-center text-white font-bold">TriGO</div>
      </video>
    </div>
  )
}
