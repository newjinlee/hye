"use client";

import { useState, useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";

type Tile = {
  id: number;
  currentPos: number;
};

type GameState = "playing" | "showingPhoto" | "complete" | "gameOver";

const getNeighbors = (pos: number): number[] => {
  const row = Math.floor(pos / 3);
  const col = pos % 3;
  const neighbors: number[] = [];
  
  if (row > 0) neighbors.push(pos - 3);
  if (row < 2) neighbors.push(pos + 3);
  if (col > 0) neighbors.push(pos - 1);
  if (col < 2) neighbors.push(pos + 1);
  
  return neighbors;
};

const createShuffledTiles = (): Tile[] => {
  const tiles: Tile[] = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((id) => ({
    id,
    currentPos: id,
  }));
  
  let emptyPos = 8;
  const moves = 20;
  let lastPos = -1;
  
  for (let i = 0; i < moves; i++) {
    const neighbors = getNeighbors(emptyPos).filter(n => n !== lastPos);
    const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
    
    const tile = tiles.find(t => t.currentPos === randomNeighbor)!;
    const emptyTile = tiles.find(t => t.id === 8)!;
    
    tile.currentPos = emptyPos;
    lastPos = emptyPos;
    emptyTile.currentPos = randomNeighbor;
    emptyPos = randomNeighbor;
  }
  
  return tiles;
};

const isComplete = (positions: number[]): boolean => {
  return positions.every((pos, idx) => pos === idx);
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export default function PuzzleGame2020() {
  const [tiles, setTiles] = useState<Tile[]>(() => createShuffledTiles());
  const [timeLeft, setTimeLeft] = useState(300);
  const [gameState, setGameState] = useState<GameState>("playing");
  const [completedTime, setCompletedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasFailedRef = useRef(false);

  const { completeGame, failGame } = useGameStore();

  // 게임 타이머
  useEffect(() => {
    if (gameState !== "playing" || timeLeft === 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          if (!hasFailedRef.current) {
            hasFailedRef.current = true;
            setTimeout(() => {
              failGame(2020);
              setGameState("gameOver");
            }, 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, timeLeft, failGame]);

  // 사진 보여주기 → Success 전환 (3초)
  useEffect(() => {
    if (gameState !== "showingPhoto") return;

    const timeout = setTimeout(() => {
      setGameState("complete");
      completeGame(2020);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [gameState, completeGame]);

  const initializeGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    hasFailedRef.current = false;
    setTiles(createShuffledTiles());
    setTimeLeft(300);
    setGameState("playing");
    setCompletedTime(0);
  };

  const handleGameComplete = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCompletedTime(300 - timeLeft);
    setGameState("showingPhoto");
  };

  const getEmptyTilePos = (): number => {
    return tiles.find((t) => t.id === 8)?.currentPos ?? 8;
  };

  const canMove = (pos: number): boolean => {
    const emptyPos = getEmptyTilePos();
    const emptyRow = Math.floor(emptyPos / 3);
    const emptyCol = emptyPos % 3;
    const tileRow = Math.floor(pos / 3);
    const tileCol = pos % 3;

    return (
      (Math.abs(emptyRow - tileRow) === 1 && emptyCol === tileCol) ||
      (Math.abs(emptyCol - tileCol) === 1 && emptyRow === tileRow)
    );
  };

  const handleTileClick = (clickedPos: number) => {
    if (gameState !== "playing") return;
    if (!canMove(clickedPos)) return;

    const emptyPos = getEmptyTilePos();

    const newTiles = tiles.map((tile) => {
      if (tile.currentPos === clickedPos) {
        return { ...tile, currentPos: emptyPos };
      }
      if (tile.currentPos === emptyPos) {
        return { ...tile, currentPos: clickedPos };
      }
      return tile;
    });

    setTiles(newTiles);

    const positions = new Array(9);
    newTiles.forEach((t) => {
      positions[t.currentPos] = t.id;
    });

    if (isComplete(positions)) {
      handleGameComplete();
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {gameState === "playing" ? (
        <>
          <div className="grid grid-cols-3 gap-1 mb-4 bg-black/30 p-1 rounded-lg">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((pos) => {
              const tile = tiles.find((t) => t.currentPos === pos);
              const isEmpty = tile?.id === 8;
              const movable = canMove(pos);

              return (
                <button
                  key={pos}
                  onClick={() => handleTileClick(pos)}
                  disabled={isEmpty || !movable}
                  className={`
                    w-20 sm:w-24 aspect-4/3 relative overflow-hidden transition-all duration-150
                    ${isEmpty ? "bg-transparent" : "bg-zinc-700"}
                    ${!isEmpty && movable ? "hover:brightness-110 cursor-pointer ring-2 ring-white/30" : ""}
                    ${!isEmpty && !movable ? "cursor-default" : ""}
                  `}
                >
                  {!isEmpty && (
                    <div
                      className="absolute inset-0 bg-cover bg-no-repeat"
                      style={{
                        backgroundImage: `url('/images/games/2020/puzzle.jpg')`,
                        backgroundPosition: `${(tile!.id % 3) * 50}% ${Math.floor(tile!.id / 3) * 50}%`,
                        backgroundSize: "300%",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="w-full flex justify-between items-center">
            <span
              className={`text-lg font-mono ${timeLeft <= 30 ? "text-red-400" : "text-white"}`}
            >
              ⏱ {formatTime(timeLeft)}
            </span>

            <div className="flex gap-2">
              {/* <button
                onClick={handleGameComplete}
                className="px-3 py-2 bg-green-600/80 hover:bg-green-500 text-white text-xs rounded-lg transition font-bold"
              >
                Clear(Dev)
              </button> */}

              <button
                onClick={initializeGame}
                className="px-2 py-2 hover:bg-white/30 text-white rounded-lg transition"
              >
                Retry
              </button>
            </div>
          </div>
        </>
      ) : gameState === "showingPhoto" ? (
        // 완성 사진 3초 보여주기
        <div className="flex flex-col items-center">
          <div className="grid grid-cols-3 gap-1 mb-4 bg-black/30 p-1 rounded-lg overflow-hidden animate-pulse">
            <div className="col-span-3 w-[calc(5rem*3+0.25rem*2)] sm:w-[calc(6rem*3+0.25rem*2)] aspect-4/3">
              <img
                src="/images/games/2020/puzzle.jpg"
                alt="완성!"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <p className="text-white text-lg">Success!</p>
        </div>
      ) : gameState === "gameOver" ? (
        <div className="text-center py-8">
          <p className="text-white/70 mb-4">시간 초과!</p>
          <button
            onClick={initializeGame}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition font-semibold"
          >
            Retry
          </button>
        </div>
      ) : (
        // complete
        <div className="bg-white/50 backdrop-blur rounded-lg shadow-lg p-6">
          <p className="text-center text-xl font-bold font-main italic mb-4">
            Success!
          </p>
          <p className="text-center">2020년의 데이터가 저장되었습니다.</p>
        </div>
      )}
    </div>
  );
}