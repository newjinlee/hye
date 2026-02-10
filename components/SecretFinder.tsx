"use client";

import { useState, useEffect, useCallback } from "react";

type Props = {
  isActive: boolean;
  hiddenImage: string;
  size?: number;
  targetArea?: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
};

export default function SecretFinder({ 
  isActive, 
  hiddenImage,
  size = 120,
  targetArea
}: Props) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMouseInWindow, setIsMouseInWindow] = useState(true);
  const [windowSize, setWindowSize] = useState(() => {
    if (typeof window !== "undefined") {
      return { width: window.innerWidth, height: window.innerHeight };
    }
    return { width: 0, height: 0 };
  });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsMouseInWindow(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsMouseInWindow(true);
  }, []);

  const handleResize = useCallback(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

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

  const visible = isActive && isMouseInWindow;

  if (!visible || windowSize.width === 0) return null;

  // 타겟 영역이 있으면 그 영역 기준, 없으면 화면 전체 기준
  const bgSize = targetArea 
    ? `${targetArea.width}px ${targetArea.height}px`
    : `${windowSize.width}px ${windowSize.height}px`;

  const bgPosition = targetArea
    ? `${-(position.x - targetArea.left) + size / 2}px ${-(position.y - targetArea.top) + size / 2}px`
    : `${-position.x + size / 2}px ${-position.y + size / 2}px`;

  return (
    <div
      className="fixed pointer-events-none z-9999 rounded-full overflow-hidden"
      style={{
        width: size,
        height: size,
        left: position.x - size / 2,
        top: position.y - size / 2,
        backgroundImage: `url('${hiddenImage}')`,
        backgroundPosition: bgPosition,
        backgroundSize: bgSize,
        backgroundRepeat: "no-repeat",
        boxShadow: `
          0 0 0 3px rgba(255,255,255,0.6),
          0 0 15px rgba(0,0,0,0.4),
          inset 0 0 15px rgba(255,255,255,0.1)
        `,
      }}
    />
  );
}