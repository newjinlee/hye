"use client";

import { useState } from "react";
import Image from "next/image";
import { useGameStore } from "@/store/gameStore";

type Card = {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const emojis = ["🌻", "🏛️", "✈️", "🐇", "👩🏻‍🎓", "🥋", "📷", "👩🏻‍💻"];

const createInitialCards = () => {
  const cardPairs = emojis.flatMap((emoji, index) => [
    { id: index * 2, emoji, isFlipped: false, isMatched: false },
    { id: index * 2 + 1, emoji, isFlipped: false, isMatched: false },
  ]);
  return cardPairs.sort(() => Math.random() - 0.5);
};

export default function CardGame2019() {
  const [cards, setCards] = useState<Card[]>(createInitialCards());
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [moves, setMoves] = useState(0);
  const maxMoves = 19;

  const { completeGame, failGame } = useGameStore();

  const initializeGame = () => {
    const cardPairs = emojis.flatMap((emoji, index) => [
      { id: index * 2, emoji, isFlipped: false, isMatched: false },
      { id: index * 2 + 1, emoji, isFlipped: false, isMatched: false },
    ]);
    const shuffled = cardPairs.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedCards([]);
    setGameComplete(false);
    setMoves(0);
  };

  const handleGameComplete = () => {
    setGameComplete(true);
    completeGame(2019); // store에 성공 저장
  };

  const handleGameOver = () => {
    failGame(2019); // store에 실패(시도 횟수) 저장
  };

  const handleCardClick = (id: number) => {
    if (isChecking || flippedCards.length === 2 || moves >= maxMoves) return;

    const card = cards.find((c) => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;

    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);

    setCards(cards.map((c) => (c.id === id ? { ...c, isFlipped: true } : c)));

    if (newFlippedCards.length === 2) {
      setIsChecking(true);
      const newMoves = moves + 1;
      setMoves(newMoves);
      checkMatch(newFlippedCards, newMoves);
    }
  };

  const checkMatch = (flippedIds: number[], currentMoves: number) => {
    const [first, second] = flippedIds.map(
      (id) => cards.find((c) => c.id === id)!,
    );

    setTimeout(() => {
      if (first.emoji === second.emoji) {
        const newCards = cards.map((c) =>
          flippedIds.includes(c.id) ? { ...c, isMatched: true } : c,
        );
        setCards(newCards);

        if (newCards.every((c) => c.isMatched)) {
          handleGameComplete(); // 모든 카드 매칭 시 성공 처리
        }
      } else {
        setCards(
          cards.map((c) =>
            flippedIds.includes(c.id) ? { ...c, isFlipped: false } : c,
          ),
        );

        // 마지막 시도였고 실패한 경우
        if (currentMoves >= maxMoves) {
          handleGameOver();
        }
      }

      setFlippedCards([]);
      setIsChecking(false);
    }, 1000);
  };

  const isGameOver =
    moves >= maxMoves && !gameComplete && !cards.every((c) => c.isMatched);

  return (
    <div className="w-full flex flex-col">
      {!gameComplete && !isGameOver ? (
        <>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`
                  aspect-2/3 overflow-hidden transition-all duration-300
                  ${
                    card.isFlipped || card.isMatched
                      ? "bg-zinc-400 shadow-lg"
                      : "hover:scale-105 cursor-pointer"
                  }
                  ${card.isMatched ? "opacity-30" : ""}
                `}
                disabled={card.isMatched || isChecking}
              >
                {card.isFlipped || card.isMatched ? (
                  <div className="w-full h-full flex items-center justify-center text-3xl">
                    {card.emoji}
                  </div>
                ) : (
                  <div className="relative w-full h-full">
                    <Image
                      src="/images/card.jpg"
                      alt="card back"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-white text-lg">
              {moves} / {maxMoves}
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
          <p className="text-white text-2xl mb-4">💔</p>
          <button
            onClick={initializeGame}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition font-semibold"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="bg-white/50 backdrop-blur rounded-lg shadow-lg p-6 overflow-auto">
          <p className="text-center text-xl font-bold font-main italic mb-4">Success!</p>
          <p className="text-center">2019년의 데이터가 저장되었습니다.</p>
        </div>
      )}
    </div>
  );
}