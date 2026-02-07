"use client";

import { useState, useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";

type Tile = {
  id: number;
  currentPos: number;
};

const getNeighbors = (pos: number): number[] => {
  const row = Math.floor(pos / 3);
  const col = pos % 3;
  const neighbors: number[] = [];
  
  if (row > 0) neighbors.push(pos - 3); // 위
  if (row < 2) neighbors.push(pos + 3); // 아래
  if (col > 0) neighbors.push(pos - 1); // 왼쪽
  if (col < 2) neighbors.push(pos + 1); // 오른쪽
  
  return neighbors;
};

// 쉬운 셔플: 완성 상태에서 25번만 섞기
const createShuffledTiles = (): Tile[] => {
  const tiles: Tile[] = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((id) => ({
    id,
    currentPos: id,
  }));
  
  let emptyPos = 8;
  const moves = 25;
  let lastPos = -1; // 되돌아가는 거 방지
  
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
  const [gameComplete, setGameComplete] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasFailedRef = useRef(false);

  const { completeGame, failGame } = useGameStore();

  const isGameOver = timeLeft === 0 && !gameComplete;

  useEffect(() => {
    if (gameComplete || timeLeft === 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          if (!hasFailedRef.current) {
            hasFailedRef.current = true;
            setTimeout(() => failGame(2020), 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameComplete, timeLeft, failGame]);

  const initializeGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    hasFailedRef.current = false;
    setTiles(createShuffledTiles());
    setTimeLeft(300);
    setGameComplete(false);
  };

  const handleGameComplete = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameComplete(true);
    completeGame(2020);
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
    if (gameComplete || isGameOver) return;
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
      {!gameComplete && !isGameOver ? (
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
            <span className={`text-lg font-mono ${timeLeft <= 30 ? "text-red-400" : "text-white"}`}>
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
      ) : isGameOver ? (
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
        <div className="bg-white/50 backdrop-blur rounded-lg shadow-lg p-6">
          <p className="text-center text-xl font-bold font-main italic mb-4">Success!</p>
          <p className="text-center">2020년의 데이터가 저장되었습니다.</p>
        </div>
      )}
    </div>
  );
}