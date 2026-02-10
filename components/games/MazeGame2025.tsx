"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useGameStore } from "@/store/gameStore";

type Cell = {
  x: number;
  y: number;
  visited: boolean;
  walls: { top: boolean; right: boolean; bottom: boolean; left: boolean };
};

type GameState = "intro" | "playing" | "showingPhoto" | "complete";
type CollectibleItem = {
  id: number;
  x: number;
  y: number;
  emoji: string;
  image: string;
  collected: boolean;
};

const CANVAS_SIZE = 320;
const DIFFICULTY = 25;
const CELL_SIZE = CANVAS_SIZE / DIFFICULTY;

// 아이템 설정 (이모지, 이미지 경로)
const ITEM_CONFIG = [
  { emoji: "💪🏻", image: "/images/games/2025/item1.jpg" },
  { emoji: "🎮", image: "/images/games/2025/item2.jpg" },
  { emoji: "✨", image: "/images/games/2025/item3.jpg" },
];

const createMaze = () => {
  const cols = DIFFICULTY;
  const rows = DIFFICULTY;
  const newMaze: Cell[] = [];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      newMaze.push({
        x,
        y,
        visited: false,
        walls: { top: true, right: true, bottom: true, left: true },
      });
    }
  }

  const stack: Cell[] = [];
  let current = newMaze[0];
  current.visited = true;
  stack.push(current);

  const index = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= cols || y >= rows) return -1;
    return x + y * cols;
  };

  while (stack.length > 0) {
    current = stack.pop()!;
    const neighbors: { cell: Cell; direction: string }[] = [];
    const directions = [
      { x: 0, y: -1, key: "top", opposite: "bottom" },
      { x: 1, y: 0, key: "right", opposite: "left" },
      { x: 0, y: 1, key: "bottom", opposite: "top" },
      { x: -1, y: 0, key: "left", opposite: "right" },
    ];

    for (const d of directions) {
      const idx = index(current.x + d.x, current.y + d.y);
      if (idx !== -1 && !newMaze[idx].visited) {
        neighbors.push({ cell: newMaze[idx], direction: d.key });
      }
    }

    if (neighbors.length > 0) {
      stack.push(current);
      const chosen = neighbors[Math.floor(Math.random() * neighbors.length)];
      const next = chosen.cell;

      // @ts-expect-error dynamic key access
      current.walls[chosen.direction] = false;
      const oppositeDir = directions.find(
        (d) => d.key === chosen.direction,
      )!.opposite;
      // @ts-expect-error dynamic key access
      next.walls[oppositeDir] = false;

      next.visited = true;
      stack.push(next);
    }
  }

  return newMaze;
};

// 아이템 위치 생성 (시작점, 도착점 제외)
const createItems = (): CollectibleItem[] => {
  const positions = new Set<string>();
  positions.add("0,0"); // 시작점 제외
  positions.add(`${DIFFICULTY - 1},${DIFFICULTY - 1}`); // 도착점 제외

  const items: CollectibleItem[] = [];

  ITEM_CONFIG.forEach((config, index) => {
    let x: number, y: number;
    do {
      x = Math.floor(Math.random() * DIFFICULTY);
      y = Math.floor(Math.random() * DIFFICULTY);
    } while (positions.has(`${x},${y}`));

    positions.add(`${x},${y}`);
    items.push({
      id: index,
      x,
      y,
      emoji: config.emoji,
      image: config.image,
      collected: false,
    });
  });

  return items;
};

export default function MazeGame2025() {
  const [maze, setMaze] = useState<Cell[]>(() => createMaze());
  const [player, setPlayer] = useState({ x: 0, y: 0 });
  const [gameState, setGameState] = useState<GameState>("intro");
  const [moveCount, setMoveCount] = useState(0);
  const [items, setItems] = useState<CollectibleItem[]>(() => createItems());
  const [showingItem, setShowingItem] = useState<CollectibleItem | null>(null);

  const goal = { x: DIFFICULTY - 1, y: DIFFICULTY - 1 };
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { completeGame } = useGameStore();

  const collectedCount = items.filter((item) => item.collected).length;

  const startGame = () => {
    setMaze(createMaze());
    setItems(createItems());
    setPlayer({ x: 0, y: 0 });
    setMoveCount(0);
    setShowingItem(null);
    setGameState("playing");
  };

  // 화면 그리기
  useEffect(() => {
    if (gameState !== "playing") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#ffffff";
    ctx.beginPath();

    maze.forEach((cell) => {
      const x = cell.x * CELL_SIZE;
      const y = cell.y * CELL_SIZE;
      if (cell.walls.top) {
        ctx.moveTo(x, y);
        ctx.lineTo(x + CELL_SIZE, y);
      }
      if (cell.walls.right) {
        ctx.moveTo(x + CELL_SIZE, y);
        ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE);
      }
      if (cell.walls.bottom) {
        ctx.moveTo(x + CELL_SIZE, y + CELL_SIZE);
        ctx.lineTo(x, y + CELL_SIZE);
      }
      if (cell.walls.left) {
        ctx.moveTo(x, y + CELL_SIZE);
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // 수집 아이템 그리기
    ctx.font = `${CELL_SIZE * 0.8}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    items.forEach((item) => {
      if (!item.collected) {
        ctx.fillText(
          item.emoji,
          item.x * CELL_SIZE + CELL_SIZE / 2,
          item.y * CELL_SIZE + CELL_SIZE / 2,
        );
      }
    });

    // 도착점
    ctx.fillText(
      "🌻",
      goal.x * CELL_SIZE + CELL_SIZE / 2,
      goal.y * CELL_SIZE + CELL_SIZE / 2,
    );

    // 플레이어
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(
      player.x * CELL_SIZE + CELL_SIZE / 2,
      player.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 3,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }, [maze, player, goal, gameState, items]);

  // 이동 로직
  const handleMove = useCallback(
    (dx: number, dy: number) => {
      if (gameState !== "playing" || showingItem) return;

      setPlayer((prev) => {
        const currentIndex = prev.x + prev.y * DIFFICULTY;
        const currentCell = maze[currentIndex];
        if (!currentCell) return prev;

        let canMove = false;
        if (dy === -1 && !currentCell.walls.top) canMove = true;
        if (dx === 1 && !currentCell.walls.right) canMove = true;
        if (dy === 1 && !currentCell.walls.bottom) canMove = true;
        if (dx === -1 && !currentCell.walls.left) canMove = true;

        if (!canMove) return prev;

        const nextX = prev.x + dx;
        const nextY = prev.y + dy;

        setMoveCount((c) => c + 1);

        // 아이템 체크
        const foundItem = items.find(
          (item) => item.x === nextX && item.y === nextY && !item.collected,
        );
        if (foundItem) {
          setItems((prevItems) =>
            prevItems.map((item) =>
              item.id === foundItem.id ? { ...item, collected: true } : item,
            ),
          );
          setTimeout(() => setShowingItem(foundItem), 50);
        }

        // 도착점 체크
        if (nextX === goal.x && nextY === goal.y) {
          setTimeout(() => setGameState("showingPhoto"), 100);
        }

        return { x: nextX, y: nextY };
      });
    },
    [maze, gameState, goal, items, showingItem],
  );

  useEffect(() => {
    if (gameState !== "playing") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          handleMove(0, -1);
          break;
        case "ArrowDown":
        case "s":
        case "S":
          handleMove(0, 1);
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          handleMove(-1, 0);
          break;
        case "ArrowRight":
        case "d":
        case "D":
          handleMove(1, 0);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, handleMove]);

  useEffect(() => {
    if (gameState !== "showingPhoto") return;

    const timeout = setTimeout(() => {
      setGameState("complete");
      completeGame(2025);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [gameState, completeGame]);

  const closeItemModal = () => {
    setShowingItem(null);
  };

  // 인트로 화면
  if (gameState === "intro") {
    return (
      <div className="w-full flex flex-col items-center">
        <div className="relative rounded-lg overflow-hidden mb-4">
          <img
            src="/images/games/2025/project.jpg"
            alt="졸업작품"
            className="w-72 h-auto object-cover rounded-lg"
          />
        </div>
        <button
          onClick={startGame}
          className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg transition"
        >
          Start
        </button>
      </div>
    );
  }

  // 사진 보여주기
  if (gameState === "showingPhoto") {
    return (
      <div className="flex flex-col items-center">
        <div className="rounded-lg overflow-hidden animate-pulse mb-4 w-64 aspect-square">
          <img
            src="/images/games/2025/success.jpg"
            alt="완성!"
            className="w-full h-full object-cover"
          />
        </div>
        <p className="text-white text-lg">탈출 성공!</p>
      </div>
    );
  }

  // 완료 화면
  if (gameState === "complete") {
    return (
      <div className="bg-white/50 backdrop-blur rounded-lg shadow-lg p-6">
        <p className="text-center text-xl font-bold font-main italic mb-4">
          Success!
        </p>
        <p className="text-center">2025년의 데이터가 저장되었습니다.</p>
      </div>
    );
  }

  // 게임 플레이 화면
  return (
    <div className="w-full flex flex-col items-center">
      {/* 상단 정보 */}
      <div className="flex items-center w-full justify-center gap-24 text-white text-sm">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-400 rounded-full" /> 혜승
          <span className="ml-2">🌻</span> 졸업
        </div>
        {/* 수집 현황 */}
        <div className="flex gap-2 mb-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={`w-8 h-8 rounded flex items-center justify-center text-lg ${
                item.collected ? "bg-white/30" : "bg-white/10"
              }`}
            >
              {item.collected ? item.emoji : "?"}
            </div>
          ))}
        </div>
      </div>

      {/* 미로 캔버스 */}
      <div className="relative rounded-lg overflow-hidden border-2 border-white/30 mb-4">
        <img
          src="/images/games/2025/project.jpg"
          alt="배경"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="relative z-10"
        />

        {/* 아이템 모달 */}
        {showingItem && (
          <div className="absolute inset-0 z-20 bg-black/70 flex items-center justify-center">
            <div className="bg-transparent rounded-lg p-2 max-w-[80%] shadow-xl">
              <img
                src={showingItem.image}
                alt="수집한 아이템"
                className="w-full h-auto rounded"
              />
              <button
                onClick={closeItemModal}
                className="mt-2 w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm transition"
              >
                continue
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 안내 & 방향키 */}
      <div className="grid grid-cols-3 gap-1 w-28">
        <div />
        <button
          onClick={() => handleMove(0, -1)}
          className="p-2 bg-white/20 hover:bg-white/30 active:bg-white/40 rounded text-white text-sm"
        >
          ↑
        </button>
        <div />
        <button
          onClick={() => handleMove(-1, 0)}
          className="p-2 bg-white/20 hover:bg-white/30 active:bg-white/40 rounded text-white text-sm"
        >
          ←
        </button>
        <button
          onClick={() => handleMove(0, 1)}
          className="p-2 bg-white/20 hover:bg-white/30 active:bg-white/40 rounded text-white text-sm"
        >
          ↓
        </button>
        <button
          onClick={() => handleMove(1, 0)}
          className="p-2 bg-white/20 hover:bg-white/30 active:bg-white/40 rounded text-white text-sm"
        >
          →
        </button>
        <div />
      </div>

      {/* 버튼들 */}
      <div className="flex gap-2 mb-4 w-full justify-end">
        <button
          onClick={startGame}
          className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white text-sm rounded-lg transition"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
