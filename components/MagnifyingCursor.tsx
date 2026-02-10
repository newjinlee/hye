"use client";

import { useState, useEffect, useCallback } from "react";

type Props = {
  isActive: boolean;
  zoomLevel?: number;
  size?: number;
};

export default function MagnifyingCursor({
  isActive,
  zoomLevel = 2,
  size = 150,
}: Props) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMouseInWindow, setIsMouseInWindow] = useState(true);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsMouseInWindow(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsMouseInWindow(true);
  }, []);

  useEffect(() => {
    if (!isActive) return;

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isActive, handleMouseMove, handleMouseLeave, handleMouseEnter]);

  // visible을 상태가 아닌 파생값으로 계산
  const visible = isActive && isMouseInWindow;

  if (!visible) return null;

  return (
    <div
      className="fixed pointer-events-none z-9999 rounded-full overflow-hidden"
      style={{
        width: size,
        height: size,
        left: position.x - size / 2,
        top: position.y - size / 2,
        background: `url('/images/background.jpg')`,
        backgroundPosition: `${-position.x * zoomLevel + size / 2}px ${-position.y * zoomLevel + size / 2}px`,
        backgroundSize: `${window.innerWidth * zoomLevel}px ${window.innerHeight * zoomLevel}px`,
        boxShadow: `
      0 0 0 4px rgba(255,255,255,0.5),
      0 0 20px rgba(0,0,0,0.5),
      inset 0 0 30px rgba(255,255,255,0.2)
    `,
      }}
    />
  );
}
