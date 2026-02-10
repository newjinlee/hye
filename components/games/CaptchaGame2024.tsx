"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Headphones, Info } from "lucide-react";
import { useGameStore } from "@/store/gameStore";

type GameState = "playing" | "showingPhoto" | "complete";

const TOTAL_IMAGES = 9;
const CORRECT_IMAGES = new Set([4, 5, 6, 7, 8]); // 5, 6, 7, 8, 9번 (0-indexed)

const shuffleArray = (array: number[]): number[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function CaptchaGame2024() {
  const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set());
  const [gameState, setGameState] = useState<GameState>("playing");
  const [showError, setShowError] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [imageOrder, setImageOrder] = useState<number[]>(() =>
    shuffleArray(Array.from({ length: TOTAL_IMAGES }, (_, i) => i)),
  );

  const { completeGame } = useGameStore();

  const toggleImage = (gridIndex: number) => {
    if (gameState !== "playing") return;

    setShowError(false);
    setSelectedImages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(gridIndex)) {
        newSet.delete(gridIndex);
      } else {
        newSet.add(gridIndex);
      }
      return newSet;
    });
  };

  const handleSubmit = () => {
    if (gameState !== "playing") return;

    // 선택된 gridIndex들을 실제 imageIndex로 변환
    const selectedImageIndices = new Set(
      Array.from(selectedImages).map((gridIndex) => imageOrder[gridIndex]),
    );

    // 정답과 정확히 일치하는지 확인
    const isCorrect =
      selectedImageIndices.size === CORRECT_IMAGES.size &&
      Array.from(selectedImageIndices).every((idx) => CORRECT_IMAGES.has(idx));

    if (isCorrect) {
      setGameState("showingPhoto");
    } else {
      setShowError(true);
    }
  };

  const handleRefresh = () => {
    setImageOrder(
      shuffleArray(Array.from({ length: TOTAL_IMAGES }, (_, i) => i)),
    );
    setSelectedImages(new Set());
    setShowError(false);
  };

  const handleAudio = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(
        "Please Select all images with Hey Seung's 2024. Click submit once there are none left.",
      );
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleInfo = () => {
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 2000);
  };

  useEffect(() => {
    if (gameState !== "showingPhoto") return;

    const timeout = setTimeout(() => {
      setGameState("complete");
      completeGame(2024);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [gameState, completeGame]);

  const handleGameComplete = () => {
    setGameState("showingPhoto");
  };

  if (gameState === "showingPhoto") {
    return (
      <div className="flex flex-col items-center">
        <div className="rounded-lg overflow-hidden animate-pulse mb-4 w-64 aspect-square">
          <img
            src="/images/games/2024/success.jpg"
            alt="완성!"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    );
  }

  if (gameState === "complete") {
    return (
      <div className="bg-white/50 backdrop-blur rounded-lg shadow-lg p-6">
        <p className="text-center text-xl font-bold font-main italic mb-4">
          Success!
        </p>
        <p className="text-center">2024년의 데이터가 저장되었습니다.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        {/* 상단 파란 헤더 */}
        <div className="bg-[#4A90D9] text-white p-4">
          <p className="text-lg font-medium font-serif">
            Select all images with
          </p>
          <p className="text-2xl">혜승의 2024</p>
          <p className="text-sm font-serif opacity-90 mt-1">
            Click submit once there are none left
          </p>
        </div>

        {/* 이미지 그리드 */}
        <div className="grid grid-cols-3 gap-0.5 bg-gray-300 p-0.5">
          {imageOrder.map((imageIndex, gridIndex) => (
            <button
              key={gridIndex}
              onClick={() => toggleImage(gridIndex)}
              className="relative aspect-square overflow-hidden bg-gray-200"
            >
              <img
                src={`/images/games/2024/${imageIndex + 1}.jpg`}
                alt={`이미지 ${imageIndex + 1}`}
                className="w-full h-full object-cover"
              />

              {selectedImages.has(gridIndex) && (
                <div className="absolute inset-0 bg-blue-500/30 flex items-end justify-end p-1">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* 에러 메시지 */}
        {showError && (
          <p className="text-red-500 text-center font-serif py-2 text-sm">
            Please try again.
          </p>
        )}

        {/* 하단 바 */}
        <div className="flex items-center justify-between p-3 bg-gray-100">
          <div className="flex items-center gap-3 text-gray-500 relative">
            <button
              onClick={handleRefresh}
              className="hover:text-gray-700 transition p-1"
              title="새로고침"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={handleAudio}
              className="hover:text-gray-700 transition p-1"
              title="음성 듣기"
            >
              <Headphones className="w-5 h-5" />
            </button>
            <div className="relative">
              <button
                onClick={handleInfo}
                className="hover:text-gray-700 transition p-1"
                title="정보"
              >
                <Info className="w-5 h-5" />
              </button>

              {showTooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                  힌트는 없습니다.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {/* <button
              onClick={handleGameComplete}
              className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white text-xs rounded transition font-bold"
            >
              Dev
            </button> */}
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-[#4A90D9] hover:bg-[#3A7BC8] text-white font-serif rounded transition"
            >
              SUBMIT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
