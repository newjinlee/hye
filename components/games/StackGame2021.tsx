"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useGameStore } from "@/store/gameStore";

type Block = {
  x: number;
  width: number;
};

type GameState = "playing" | "showingPhoto" | "complete" | "gameOver";

// 이미지 비율에 맞춘 설정
const IMAGE_WIDTH = 1179;
const IMAGE_HEIGHT = 1447;
const GAME_WIDTH = 280;
const GAME_HEIGHT = Math.round(GAME_WIDTH * (IMAGE_HEIGHT / IMAGE_WIDTH)); // 약 344px
const TARGET_FLOORS = 20; // 20층
const BLOCK_HEIGHT = GAME_HEIGHT / TARGET_FLOORS; // 약 17.2px
const INITIAL_BLOCK_WIDTH = 250;
const SPEED_INITIAL = 1.5;
const SPEED_INCREMENT = 0.1;

export default function StackGame2021() {
  const [blocks, setBlocks] = useState<Block[]>([
    { x: (GAME_WIDTH - INITIAL_BLOCK_WIDTH) / 2, width: INITIAL_BLOCK_WIDTH },
  ]);
  const [currentBlock, setCurrentBlock] = useState<Block>({
    x: 0,
    width: INITIAL_BLOCK_WIDTH,
  });
  const [gameState, setGameState] = useState<GameState>("playing");
  const [perfectCount, setPerfectCount] = useState(0);

  const directionRef = useRef<1 | -1>(1);
  const speedRef = useRef(SPEED_INITIAL);
  const animationRef = useRef<number | null>(null);

  const { completeGame, failGame } = useGameStore();

  const currentFloor = blocks.length;

  // 블록 움직임 애니메이션
  useEffect(() => {
    if (gameState !== "playing") return;

    const animate = () => {
      setCurrentBlock((prev) => {
        let newX = prev.x + directionRef.current * speedRef.current;

        if (newX <= 0) {
          newX = 0;
          directionRef.current = 1;
        } else if (newX + prev.width >= GAME_WIDTH) {
          newX = GAME_WIDTH - prev.width;
          directionRef.current = -1;
        }

        return { ...prev, x: newX };
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState]);

  // 사진 보여주기 → Success 전환
  useEffect(() => {
    if (gameState !== "showingPhoto") return;

    const timeout = setTimeout(() => {
      setGameState("complete");
      completeGame(2021);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [gameState, completeGame]);

  const dropBlock = useCallback(() => {
    if (gameState !== "playing") return;

    const lastBlock = blocks[blocks.length - 1];

    const overlapStart = Math.max(currentBlock.x, lastBlock.x);
    const overlapEnd = Math.min(
      currentBlock.x + currentBlock.width,
      lastBlock.x + lastBlock.width,
    );
    const overlapWidth = overlapEnd - overlapStart;

    if (overlapWidth <= 0) {
      setGameState("gameOver");
      failGame(2021);
      return;
    }

    const isPerfect = Math.abs(currentBlock.x - lastBlock.x) < 5;

    if (isPerfect) {
      setPerfectCount((prev) => prev + 1);
      setBlocks((prev) => [
        ...prev,
        { x: lastBlock.x, width: lastBlock.width },
      ]);
    } else {
      setBlocks((prev) => [...prev, { x: overlapStart, width: overlapWidth }]);
    }

    if (currentFloor + 1 >= TARGET_FLOORS) {
      setGameState("showingPhoto");
      return;
    }

    const newWidth = isPerfect ? lastBlock.width : overlapWidth;
    setCurrentBlock({
      x: directionRef.current === 1 ? 0 : GAME_WIDTH - newWidth,
      width: newWidth,
    });

    speedRef.current += SPEED_INCREMENT;
  }, [blocks, currentBlock, currentFloor, gameState, failGame]);

  // 스페이스바로 블록 떨어뜨리기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        dropBlock();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dropBlock]);

  const initializeGame = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setBlocks([
      { x: (GAME_WIDTH - INITIAL_BLOCK_WIDTH) / 2, width: INITIAL_BLOCK_WIDTH },
    ]);
    setCurrentBlock({ x: 0, width: INITIAL_BLOCK_WIDTH });
    directionRef.current = 1;
    setGameState("playing");
    setPerfectCount(0);
    speedRef.current = SPEED_INITIAL;
  };

  const handleGameComplete = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setGameState("showingPhoto");
  };

  return (
    <div className="w-full flex flex-col items-center">
      {gameState === "playing" ? (
        <>
          <div
            className="relative bg-linear-to-b from-zinc-400 to-zinc-600 rounded-lg overflow-hidden cursor-pointer mb-4"
            style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
            onClick={dropBlock}
          >
            {/* 쌓인 블록들 */}
            <div className="absolute bottom-0 left-0 right-0">
              {blocks.map((block, index) => (
                <div
                  key={index}
                  className="absolute overflow-hidden"
                  style={{
                    left: block.x,
                    bottom: index * BLOCK_HEIGHT,
                    width: block.width,
                    height: BLOCK_HEIGHT,
                  }}
                >
                  <div
                    className="w-full h-full bg-cover"
                    style={{
                      backgroundImage: `url('/images/games/2021/block.jpg')`,
                      backgroundPosition: `${(block.x / GAME_WIDTH) * 100}% ${((TARGET_FLOORS - index - 1) / (TARGET_FLOORS - 1)) * 100}%`,
                      backgroundSize: `${GAME_WIDTH}px ${GAME_HEIGHT}px`,
                    }}
                  />
                  <div className="absolute inset-0 border-b border-x border-white/30" />
                </div>
              ))}
            </div>

            {/* 현재 움직이는 블록 */}
            <div
              className="absolute overflow-hidden"
              style={{
                left: currentBlock.x,
                bottom: blocks.length * BLOCK_HEIGHT,
                width: currentBlock.width,
                height: BLOCK_HEIGHT,
              }}
            >
              <div
                className="w-full h-full bg-cover"
                style={{
                  backgroundImage: `url('/images/games/2021/block.jpg')`,
                  backgroundPosition: `${(currentBlock.x / GAME_WIDTH) * 100}% ${((TARGET_FLOORS - blocks.length - 1) / (TARGET_FLOORS - 1)) * 100}%`,
                  backgroundSize: `${GAME_WIDTH}px ${GAME_HEIGHT}px`,
                }}
              />
              <div className="absolute inset-0 border border-white/50" />
            </div>

            {/* 층수 표시 */}
            <div className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm font-mono">
              {currentFloor} / {TARGET_FLOORS}
            </div>

            {/* 안내 문구 */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/70 text-xs">
              클릭 또는 스페이스바
            </div>
          </div>

          {/* 하단 컨트롤 */}
          <div className="w-full flex justify-end gap-2">
            <button
              onClick={handleGameComplete}
              className="px-3 py-2 bg-green-600/80 hover:bg-green-500 text-white text-xs rounded-lg transition font-bold"
            >
              Clear(Dev)
            </button>

            <button
              onClick={initializeGame}
              className="px-2 py-2 hover:bg-white/30 text-white rounded-lg transition"
            >
              Retry
            </button>
          </div>
        </>
      ) : gameState === "showingPhoto" ? (
        <div className="flex flex-col items-center">
          <div
            className="rounded-lg overflow-hidden animate-pulse mb-4"
            style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
          >
            <img
              src="/images/games/2021/block.jpg"
              alt="완성!"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      ) : gameState === "gameOver" ? (
        <div className="text-center py-8">
          <p className="text-white/70 mb-1">{currentFloor}층에서 무너졌어요</p>
          <p className="text-white/50 text-sm mb-4">
            Perfect: {perfectCount}회
          </p>
          <button
            onClick={initializeGame}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition font-semibold"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="bg-white/50 backdrop-blur rounded-lg shadow-lg p-6">
          <p className="text-center text-xl font-bold font-main italic mb-4">
            Success!
          </p>
          <p className="text-center">2021년의 데이터가 저장되었습니다.</p>
        </div>
      )}
    </div>
  );
}
