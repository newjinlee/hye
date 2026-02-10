"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useGameStore } from "@/store/gameStore";

type FallingWord = {
  id: number;
  word: string;
  x: number;
  y: number;
  speed: number;
};

type GameState = "playing" | "showingPhoto" | "complete";

const WORDS = [
  "마라탕",
  "건축",
  "출근",
  "포항",
  "모형",
  "여행",
  "MWM",
  "페스티벌",
  "음악",
  "카메라",
  "친구",
  "쿠킹덤",
  "모델",
  "웃음",
  "설계",
  "꿈",
  "인턴",
  "도면",
  "코로나",
  "지킬앤하이드",
  "놀이공원",
  "나창순",
  "크리스마스파티",
  "케이크",
  "산책",
  "어린이대공원",
  "맛집",
];

const SPAWN_INTERVAL = 1000;
const BASE_SPEED = 3;
const BASKET_WIDTH = 120;
const BASKET_HEIGHT = Math.round(BASKET_WIDTH * (456 / 1419));

const getInitialWindowSize = () => {
  if (typeof window !== "undefined") {
    return { width: window.innerWidth, height: window.innerHeight };
  }
  return { width: 0, height: 0 };
};

const getInitialBasketX = () => {
  if (typeof window !== "undefined") {
    return window.innerWidth / 2 - BASKET_WIDTH / 2;
  }
  return 0;
};

type Props = {
  onClose?: () => void;
};

export default function CatchGame2022({ onClose }: Props) {
  const [fallingWords, setFallingWords] = useState<FallingWord[]>([]);
  const [basketX, setBasketX] = useState(getInitialBasketX);
  const [caughtWords, setCaughtWords] = useState<string[]>([]);
  const [gameState, setGameState] = useState<GameState>("playing");
  const [windowSize, setWindowSize] = useState(getInitialWindowSize);
  const [spawnedCount, setSpawnedCount] = useState(0);
  const [gameKey, setGameKey] = useState(0); // 게임 리셋용 키

  const animationRef = useRef<number | null>(null);
  const spawnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wordIdRef = useRef(0);
  const hasEndedRef = useRef(false);
  const spawnedCountRef = useRef(0);
  const caughtIdsRef = useRef<Set<number>>(new Set());
  const caughtWordsRef = useRef<string[]>([]);
  const basketXRef = useRef(getInitialBasketX());

  const { completeGame } = useGameStore();

  const totalWords = WORDS.length;

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // basketX 변경 시 ref도 업데이트
  useEffect(() => {
    basketXRef.current = basketX;
  }, [basketX]);

  const spawnWord = useCallback(() => {
    if (windowSize.width === 0) return;
    if (spawnedCountRef.current >= totalWords) return;

    const word = WORDS[spawnedCountRef.current];

    const newWord: FallingWord = {
      id: wordIdRef.current++,
      word,
      x: Math.random() * (windowSize.width - 100) + 50,
      y: 0,
      speed: BASE_SPEED + Math.random() * 2,
    };

    setFallingWords((prev) => [...prev, newWord]);
    spawnedCountRef.current += 1;
    setSpawnedCount(spawnedCountRef.current);
  }, [totalWords, windowSize.width]);

  // 게임 루프
  useEffect(() => {
    if (gameState !== "playing" || windowSize.height === 0) return;

    const gameLoop = () => {
      setFallingWords((prev) => {
        const updated: FallingWord[] = [];

        for (const word of prev) {
          if (caughtIdsRef.current.has(word.id)) {
            continue;
          }

          const newY = word.y + word.speed;

          const currentBasketX = basketXRef.current;
          const basketLeft = currentBasketX;
          const basketRight = currentBasketX + BASKET_WIDTH;
          const basketTop = windowSize.height - BASKET_HEIGHT - 20;

          const wordInBasketX =
            word.x > basketLeft - 30 && word.x < basketRight + 30;
          const wordInBasketY = newY > basketTop && newY < windowSize.height;

          if (wordInBasketX && wordInBasketY) {
            if (!caughtIdsRef.current.has(word.id)) {
              caughtIdsRef.current.add(word.id);
              caughtWordsRef.current = [...caughtWordsRef.current, word.word];
              setCaughtWords([...caughtWordsRef.current]);
            }
            continue;
          }

          if (newY > windowSize.height + 30) {
            continue;
          }

          updated.push({ ...word, y: newY });
        }

        if (
          spawnedCountRef.current >= totalWords &&
          updated.length === 0 &&
          !hasEndedRef.current
        ) {
          hasEndedRef.current = true;
          setTimeout(() => setGameState("showingPhoto"), 0);
        }

        return updated;
      });

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, windowSize.height, totalWords, gameKey]); // gameKey 추가

  // 단어 생성 타이머
  useEffect(() => {
    if (gameState !== "playing") return;

    spawnWord();
    spawnTimerRef.current = setInterval(spawnWord, SPAWN_INTERVAL);

    return () => {
      if (spawnTimerRef.current) {
        clearInterval(spawnTimerRef.current);
      }
    };
  }, [gameState, spawnWord, gameKey]); // gameKey 추가

  // 사진 보여주기 → Success 전환
  useEffect(() => {
    if (gameState !== "showingPhoto") return;

    const timeout = setTimeout(() => {
      setGameState("complete");
      completeGame(2022);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [gameState, completeGame]);

  const handleMove = useCallback(
    (clientX: number) => {
      if (gameState !== "playing") return;
      const x = clientX - BASKET_WIDTH / 2;
      const newX = Math.max(0, Math.min(x, windowSize.width - BASKET_WIDTH));
      setBasketX(newX);
      basketXRef.current = newX;
    },
    [gameState, windowSize.width],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      handleMove(e.clientX);
    },
    [handleMove],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX);
      }
    },
    [handleMove],
  );

  useEffect(() => {
    if (gameState !== "playing") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const moveSpeed = 40;

      if (e.key === "ArrowLeft") {
        setBasketX((prev) => {
          const newX = Math.max(0, prev - moveSpeed);
          basketXRef.current = newX;
          return newX;
        });
      } else if (e.key === "ArrowRight") {
        setBasketX((prev) => {
          const newX = Math.min(
            windowSize.width - BASKET_WIDTH,
            prev + moveSpeed,
          );
          basketXRef.current = newX;
          return newX;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, windowSize.width]);

  const initializeGame = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);

    // 모든 state 리셋
    setFallingWords([]);
    const initialX = windowSize.width / 2 - BASKET_WIDTH / 2;
    setBasketX(initialX);
    setCaughtWords([]);
    setSpawnedCount(0);
    setGameState("playing");

    // 모든 ref 리셋
    basketXRef.current = initialX;
    caughtWordsRef.current = [];
    caughtIdsRef.current.clear();
    spawnedCountRef.current = 0;
    hasEndedRef.current = false;
    wordIdRef.current = 0;

    // gameKey 증가로 useEffect 재실행 트리거
    setGameKey((prev) => prev + 1);
  };

  const handleGameComplete = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    setGameState("showingPhoto");
  };

  if (windowSize.width === 0) return null;

  if (gameState === "playing") {
    return createPortal(
      <div
        className="fixed inset-0 z-100"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {fallingWords.map((word) => (
          <div
            key={word.id}
            className="absolute text-xl font-serif pointer-events-none select-none"
            style={{
              left: word.x,
              top: word.y,
              transform: "translateX(-50%)",
              color: "white",
              textShadow:
                "0 0 10px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.7), 2px 2px 4px rgba(0,0,0,0.8)",
            }}
          >
            {word.word}
          </div>
        ))}

        <div
          className="absolute bottom-4 transition-none"
          style={{
            left: basketX,
            width: BASKET_WIDTH,
            height: BASKET_HEIGHT,
          }}
        >
          <img
            src="/images/games/2022/basket.png"
            alt="바구니"
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </div>

        <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
          <div className="bg-black/60 px-4 py-2 rounded-lg text-white font-mono text-lg">
            🌻 {caughtWords.length}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="pointer-events-auto w-10 h-10 rounded-lg text-white text-xl flex items-center justify-center transition cursor-pointer bg-black/60 hover:bg-black/80"
            >
              ✕
            </button>
          )}
        </div>

        <div className="absolute bottom-4 right-4 flex gap-2">
          {/* <button
            onClick={handleGameComplete}
            className="px-4 py-2 bg-green-600/80 hover:bg-green-500 text-white text-sm rounded-lg transition font-bold cursor-pointer"
          >
            Clear(Dev)
          </button> */}
          <button
            onClick={initializeGame}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition cursor-pointer"
          >
            Retry
          </button>
        </div>

        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/50 text-sm pointer-events-none">
          마우스 또는 ← → 키로 이동
        </div>
      </div>,
      document.body,
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      {gameState === "showingPhoto" ? (
        <div className="flex flex-col items-center">
          <div className="rounded-lg overflow-hidden animate-pulse mb-4 w-64 aspect-3/4">
            <img
              src="/images/games/2022/catch.jpg"
              alt="완성!"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-white text-lg">🌻 {caughtWords.length}개 수집!</p>
        </div>
      ) : (
        <div className="bg-white/50 backdrop-blur rounded-lg shadow-lg p-6 max-w-sm">
          <p className="text-center text-xl font-bold font-main italic mb-4">
            Success!
          </p>
          <p className="text-sm leading-relaxed">혜승의 2022년</p>
          <p className="text-sm leading-relaxed font-serif">
            {caughtWords.length > 0 ? caughtWords.join(", ") : "..."}
          </p>
        </div>
      )}
    </div>
  );
}
