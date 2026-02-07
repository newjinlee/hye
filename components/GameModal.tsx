'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  year: number;
  children: React.ReactNode;
  miniaturePosition?: { top: string; left: string };
}

// SSR 안전한 mounted 체크
function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function GameModal({ 
  isOpen, 
  onClose, 
  year, 
  children,
  miniaturePosition 
}: GameModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [lineCoords, setLineCoords] = useState<{x1: number; y1: number; x2: number; y2: number} | null>(null);
  const isMounted = useIsMounted();

  // 모달 위치 계산 (미니어처 위치 기반)
  const getModalPosition = () => {
    if (!miniaturePosition) return { left: '50%', transform: 'translateX(-50%)' };
    
    const miniLeft = parseFloat(miniaturePosition.left);
    
    if (miniLeft < 50) {
      return { left: '55%', transform: 'translateX(0)' };
    } else {
      return { right: '55%', transform: 'translateX(0)' };
    }
  };

  // 연결선 좌표 계산
  useEffect(() => {
    if (!isOpen || !miniaturePosition || !modalRef.current) return;

    const calculateLine = () => {
      const modal = modalRef.current;
      if (!modal) return;

      const modalRect = modal.getBoundingClientRect();
      const miniLeft = (parseFloat(miniaturePosition.left) / 100) * window.innerWidth;
      const miniTop = (parseFloat(miniaturePosition.top) / 100) * window.innerHeight;

      const x1 = miniLeft + 24;
      const y1 = miniTop + 24;

      const miniLeftPercent = parseFloat(miniaturePosition.left);
      let x2, y2;
      
      if (miniLeftPercent < 50) {
        x2 = modalRect.left;
        y2 = modalRect.top + modalRect.height / 2;
      } else {
        x2 = modalRect.right;
        y2 = modalRect.top + modalRect.height / 2;
      }

      setLineCoords({ x1, y1, x2, y2 });
    };

    const timer = setTimeout(calculateLine, 50);
    window.addEventListener('resize', calculateLine);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculateLine);
    };
  }, [isOpen, miniaturePosition]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !isMounted) return null;

  const modalPosition = getModalPosition();

  const modalContent = (
    <>
      {/* 연결선 - SVG */}
      {lineCoords && (
        <svg 
          className="fixed inset-0 z-60 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        >
          <line
            x1={lineCoords.x1}
            y1={lineCoords.y1}
            x2={lineCoords.x2}
            y2={lineCoords.y2}
            stroke="white"
            strokeWidth="2"
            strokeDasharray="8,4"
            opacity="0.7"
          />
        </svg>
      )}

      {/* 배경 오버레이 */}
      <div 
        className="fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
      />

      {/* 모달 */}
      <div
        ref={modalRef}
        className="fixed top-1/2 z-70 -translate-y-1/2 max-w-md w-full bg-white/10 backdrop-blur-md rounded-lg px-6 pt-12 pb-6 shadow-xl"
        style={modalPosition}
        onClick={(e) => e.stopPropagation()}
      >
        {/* SVG 점선 border */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none rounded-lg"
          style={{ overflow: 'visible' }}
        >
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeDasharray="8,4"
            opacity="0.7"
            rx="8"
            ry="8"
          />
        </svg>

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/30 text-white transition z-10"
        >
          ✕
        </button>
        
        {children}
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}