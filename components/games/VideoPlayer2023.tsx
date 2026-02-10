"use client";

import { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/store/gameStore";

type Props = {
  onClose?: () => void;
};

export default function VideoPlayer2023({ onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasEnded, setHasEnded] = useState(false);
  
  const { completeGame } = useGameStore();

  // 영상 끝나면 complete 처리
  const handleVideoEnd = () => {
    setHasEnded(true);
    completeGame(2023);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {!hasEnded ? (
        <div className="w-full max-w-md">
          {/* 영상 */}
          <video
            ref={videoRef}
            src="/images/games/2023/video.mp4"
            controls
            autoPlay
            onEnded={handleVideoEnd}
            className="w-full rounded-lg shadow-lg"
          />
          
          {/* 하단 컨트롤 */}
          <div className="flex justify-end gap-2 mt-4">
            {/* <button
              onClick={handleVideoEnd}
              className="px-3 py-2 bg-green-600/80 hover:bg-green-500 text-white text-xs rounded-lg transition font-bold"
            >
              Skip(Dev)
            </button> */}
            {onClose && (
              <button
                onClick={onClose}
                className="px-2 py-2 hover:bg-white/30 text-white rounded-lg transition"
              >
                닫기
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white/50 backdrop-blur rounded-lg shadow-lg p-6">
          <p className="text-center text-xl font-bold font-main italic mb-4">Success!</p>
          <p className="text-center">2023년의 데이터가 저장되었습니다.</p>
        </div>
      )}
    </div>
  );
}