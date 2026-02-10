// page.tsx 수정
"use client";

import { useState } from "react";
import Image from "next/image";
import GameModal from "../components/GameModal";
import GalleryModal from "../components/GalleryModal";
import CardGame2019 from "../components/games/CardGame2019";
import { useGameStore, GameYear } from "@/store/gameStore";
import PuzzleGame2020 from "@/components/games/PuzzleGame2020";
import StackGame2021 from "@/components/games/StackGame2021";
import CatchGame2022 from "@/components/games/CatchGame2022";
import VideoPlayer2023 from "@/components/games/VideoPlayer2023";
import CaptchaGame2024 from "@/components/games/CaptchaGame2024";
import MazeGame2025 from "@/components/games/MazeGame2025";
import MusicPlayer from "@/components/MusicPlayer";

const miniatures = [
  { year: 2019, top: "17%", left: "10%" },
  { year: 2020, top: "10%", left: "35%" },
  { year: 2021, top: "50%", left: "10%" },
  { year: 2022, top: "50%", left: "58%" },
  { year: 2023, top: "68%", left: "50%" },
  { year: 2024, top: "90%", left: "73%" },
  { year: 2025, top: "21%", left: "82%" },
  { year: 2026, top: "80%", left: "25%" },
];

const GAME_YEARS: GameYear[] = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

export default function Home() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const { progress } = useGameStore();

  // 하나라도 완료된 게임이 있는지 확인
  const hasAnyCompleted = GAME_YEARS.some(year => progress[year]?.completed);

  const handleMiniatureClick = (e: React.MouseEvent, year: number) => {
    e.stopPropagation();
    setSelectedYear(year);
  };

  const closeModal = () => {
    setSelectedYear(null);
  };

  const selectedMiniature = miniatures.find((m) => m.year === selectedYear);

  return (
    <main className="relative w-full h-screen overflow-hidden">
      <MusicPlayer />
      
      {/* 배경 이미지 */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/images/background.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* 미니어처 배치 */}
      <div className="relative w-full h-full">
        {miniatures.map((item) => {
          const isSelected = selectedYear === item.year;
          const isCompleted =
            progress[item.year as GameYear]?.completed || false;

          return (
            <button
              key={item.year}
              onClick={(e) => handleMiniatureClick(e, item.year)}
              className={`absolute group cursor-pointer w-12 h-12 transition-all duration-300 ${
                isSelected ? "z-60 scale-125" : "z-10"
              }`}
              style={{ top: item.top, left: item.left }}
            >
              <div
                className={`relative w-full h-full transition-transform duration-300 hover:scale-125 ${
                  isCompleted
                    ? "drop-shadow-[0_0_8px_rgba(241,194,50,0.8)]"
                    : "hover:drop-shadow-2xl"
                }`}
              >
                <Image
                  src={`/images/miniatures/${item.year}.png`}
                  alt={`${item.year}`}
                  fill
                  sizes="48px"
                  className={`object-contain transition-opacity duration-300 hover:opacity-100 ${
                    isSelected || isCompleted ? "opacity-100" : "opacity-25"
                  }`}
                />
              </div>

              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <span className="bg-black/70 text-white px-3 py-1 rounded text-sm font-bold whitespace-nowrap">
                  {item.year}
                </span>
              </div>
            </button>
          );
        })}

        {/* 갤러리 미니어처 (하나라도 완료 시 표시) */}
        {hasAnyCompleted && (
          <button
            onClick={() => setIsGalleryOpen(true)}
            className="absolute group cursor-pointer w-12 h-12 transition-all duration-300 z-10"
            style={{ top: "35%", left: "54%" }}
          >
            <div className="relative w-full h-full transition-transform duration-300 hover:scale-125 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
              <Image
                src="/images/miniatures/gallery.png"
                alt="Gallery"
                fill
                sizes="48px"
                className="object-contain"
              />
            </div>

            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <span className="bg-black/70 text-white px-3 py-1 rounded text-sm whitespace-nowrap">
                Gallery
              </span>
            </div>
          </button>
        )}
      </div>

      {/* 게임 모달 */}
      {selectedYear !== null && (
        <GameModal
          isOpen={true}
          onClose={closeModal}
          year={selectedYear}
          miniaturePosition={
            selectedMiniature
              ? { top: selectedMiniature.top, left: selectedMiniature.left }
              : undefined
          }
        >
          {selectedYear === 2019 ? (
            <CardGame2019 />
          ) : selectedYear === 2020 ? (
            <PuzzleGame2020 />
          ) : selectedYear === 2021 ? (
            <StackGame2021 />
          ) : selectedYear === 2022 ? (
            <CatchGame2022 />
          ) : selectedYear === 2023 ? (
            <VideoPlayer2023 />
          ) : selectedYear === 2024 ? (
            <CaptchaGame2024 />
          ) : selectedYear === 2025 ? (
            <MazeGame2025 />
          ) : (
            <div className="text-center text-white">
              <h2 className="text-4xl font-bold mb-4">{selectedYear}</h2>
              <p>준비중입니다...</p>
            </div>
          )}
        </GameModal>
      )}

      {/* 갤러리 모달 */}
      <GalleryModal 
        isOpen={isGalleryOpen} 
        onClose={() => setIsGalleryOpen(false)} 
      />
    </main>
  );
}