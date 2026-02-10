// components/GalleryModal.tsx
"use client";

import { useState, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { useGameStore, GameYear } from "@/store/gameStore";

const GAME_YEARS: GameYear[] = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

const PHOTOS_PER_YEAR: Record<GameYear, number> = {
  2019: 5,
  2020: 8,
  2021: 9,
  2022: 9,
  2023: 9,
  2024: 11,
  2025: 6,
  2026: 1,
};

const generatePolaroidPositions = (count: number) => {
  const positions = [];
  for (let i = 0; i < count; i++) {
    positions.push({
      rotation: Math.floor(Math.random() * 30) - 15,
      x: 5 + Math.floor(Math.random() * 70),
      y: 5 + Math.floor(Math.random() * 50),
    });
  }
  return positions;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

type Position = { x: number; y: number; rotation: number };

export default function GalleryModal({ isOpen, onClose }: Props) {
  const { progress } = useGameStore();
  const [selectedYear, setSelectedYear] = useState<GameYear>(2019);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [topZIndex, setTopZIndex] = useState<number | null>(null);

  // 년도별 폴라로이드 위치 상태
  const [positions, setPositions] = useState<Record<GameYear, Position[]>>(() => {
    const posMap: Record<GameYear, Position[]> = {
      2019: [], 2020: [], 2021: [], 2022: [],
      2023: [], 2024: [], 2025: [], 2026: [],
    };
    GAME_YEARS.forEach((year) => {
      posMap[year] = generatePolaroidPositions(PHOTOS_PER_YEAR[year]);
    });
    return posMap;
  });

  // 드래그 관련 ref
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const dragStartPolaroid = useRef<{ x: number; y: number } | null>(null);
  const hasDragged = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const isCompleted = (year: GameYear) => progress[year]?.completed || false;
  const currentYearCompleted = isCompleted(selectedYear);
  const photoCount = PHOTOS_PER_YEAR[selectedYear];

  const currentIndex = GAME_YEARS.indexOf(selectedYear);
  const prevYear = currentIndex > 0 ? GAME_YEARS[currentIndex - 1] : null;
  const nextYear = currentIndex < GAME_YEARS.length - 1 ? GAME_YEARS[currentIndex + 1] : null;

  // 드래그 시작
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, index: number) => {
    e.preventDefault();
    
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    dragStartPos.current = { x: clientX, y: clientY };
    dragStartPolaroid.current = { 
      x: positions[selectedYear][index].x, 
      y: positions[selectedYear][index].y 
    };
    hasDragged.current = false;
    setDraggingIndex(index);
    setTopZIndex(index);
  };

  // 드래그 중
  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (draggingIndex === null || !dragStartPos.current || !dragStartPolaroid.current || !containerRef.current) return;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - dragStartPos.current.x;
    const deltaY = clientY - dragStartPos.current.y;

    // 5px 이상 움직이면 드래그로 인식
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      hasDragged.current = true;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const newX = dragStartPolaroid.current.x + (deltaX / containerRect.width) * 100;
    const newY = dragStartPolaroid.current.y + (deltaY / containerRect.height) * 100;

    // 경계 제한 (0% ~ 85%)
    const clampedX = Math.max(0, Math.min(85, newX));
    const clampedY = Math.max(0, Math.min(75, newY));

    setPositions((prev) => {
      const newPositions = { ...prev };
      newPositions[selectedYear] = [...prev[selectedYear]];
      newPositions[selectedYear][draggingIndex] = {
        ...prev[selectedYear][draggingIndex],
        x: clampedX,
        y: clampedY,
      };
      return newPositions;
    });
  };

  // 드래그 종료
  const handleDragEnd = (index: number, imagePath: string) => {
    // 드래그 안 했으면 클릭으로 처리 (사진 확대)
    if (!hasDragged.current) {
      setSelectedPhoto(imagePath);
    }
    
    setDraggingIndex(null);
    dragStartPos.current = null;
    dragStartPolaroid.current = null;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div
        className="relative w-[90vw] h-[85vh] max-w-5xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-50 p-2 bg-white/20 hover:bg-white/30 rounded-full transition"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={() => prevYear && setSelectedYear(prevYear)}
            disabled={!prevYear}
            className="p-2 text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <h2 className="text-white text-2xl min-w-100px text-center">
            {selectedYear}
          </h2>

          <button
            onClick={() => nextYear && setSelectedYear(nextYear)}
            disabled={!nextYear}
            className="p-2 text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* 중앙: 폴라로이드 사진들 */}
        <div 
          ref={containerRef}
          className="flex-1 relative overflow-hidden"
          onMouseMove={handleDragMove}
          onMouseUp={() => draggingIndex !== null && handleDragEnd(draggingIndex, `/images/gallery/${selectedYear}/${draggingIndex + 1}.jpg`)}
          onMouseLeave={() => draggingIndex !== null && handleDragEnd(draggingIndex, `/images/gallery/${selectedYear}/${draggingIndex + 1}.jpg`)}
          onTouchMove={handleDragMove}
          onTouchEnd={() => draggingIndex !== null && handleDragEnd(draggingIndex, `/images/gallery/${selectedYear}/${draggingIndex + 1}.jpg`)}
        >
          {currentYearCompleted ? (
            <>
              {Array.from({ length: photoCount }, (_, i) => {
                const pos = positions[selectedYear][i];
                const imagePath = `/images/gallery/${selectedYear}/${i + 1}.jpg`;
                const isHovered = hoveredIndex === i;
                const isDragging = draggingIndex === i;
                const isTop = topZIndex === i;

                return (
                  <div
                    key={i}
                    className={`
                      absolute cursor-grab transition-shadow duration-300
                      ${isDragging ? "cursor-grabbing scale-105" : ""}
                      ${isHovered && !isDragging ? "scale-105" : ""}
                    `}
                    style={{
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                      transform: `rotate(${pos.rotation}deg)`,
                      zIndex: isTop ? 40 : isDragging ? 30 : isHovered ? 20 : 10,
                      transition: isDragging ? "none" : "transform 0.3s, box-shadow 0.3s",
                    }}
                    onMouseEnter={() => !isDragging && setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onMouseDown={(e) => handleDragStart(e, i)}
                    onTouchStart={(e) => handleDragStart(e, i)}
                  >
                    <div className={`
                      bg-white p-2 pb-8 rounded-sm transition-shadow
                      ${isDragging ? "shadow-2xl" : "shadow-xl hover:shadow-2xl"}
                    `}>
                      <div className="w-28 h-28 bg-gray-200 overflow-hidden pointer-events-none">
                        <img
                          src={imagePath}
                          alt={`${selectedYear} - ${i + 1}`}
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Lock className="w-12 h-12 text-white/50" />
              </div>
            </div>
          )}
        </div>

        {/* 하단: 년도별 미니어처 탭 */}
        <div className="flex justify-center items-end gap-8 py-4 mt-4">
          {GAME_YEARS.map((year) => {
            const completed = isCompleted(year);
            const isSelected = selectedYear === year;

            return (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`
                  relative group w-12 h-12 transition-all duration-300
                  ${isSelected ? "scale-125 z-20" : "z-10"}
                `}
              >
                <div
                  className={`
                    relative w-full h-full transition-transform duration-300 hover:scale-125
                    ${completed
                      ? "drop-shadow-[0_0_8px_rgba(241,194,50,0.8)]"
                      : "hover:drop-shadow-2xl"
                    }
                  `}
                >
                  <img
                    src={`/images/miniatures/gallery/${year}.png`}
                    alt={`${year}`}
                    className={`
                      w-full h-full object-contain transition-opacity duration-300 hover:opacity-100
                      ${isSelected || completed ? "opacity-100" : "opacity-40"}
                      ${!completed ? "grayscale" : ""}
                    `}
                  />
                </div>

                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <span className="bg-black/70 text-white px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap">
                    {year}
                  </span>
                </div>

                {!completed && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 확대 보기 모달 */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/90"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPhoto(null);
          }}
        >
          <div className="bg-white p-3 pb-6 shadow-2xl max-w-2xl max-h-[85vh]">
            <img
              src={selectedPhoto}
              alt="확대 사진"
              className="w-full h-auto max-h-[75vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}