"use client";

import { useState } from "react";
import Image from "next/image";

type Card = {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const emojis = ["🌻", "🤓", "👨🏻‍🌾", "📚", "⚽", "🎮", "🍕", "🌈"];

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
  const maxMoves = 19; // 2019년이니까 19번!

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

  const handleCardClick = (id: number) => {
    if (isChecking || flippedCards.length === 2 || moves >= maxMoves) return;

    const card = cards.find((c) => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;

    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);

    setCards(cards.map((c) => (c.id === id ? { ...c, isFlipped: true } : c)));

    if (newFlippedCards.length === 2) {
      setIsChecking(true);
      setMoves(moves + 1);
      checkMatch(newFlippedCards);
    }
  };

  const checkMatch = (flippedIds: number[]) => {
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
          setGameComplete(true);
        }
      } else {
        setCards(
          cards.map((c) =>
            flippedIds.includes(c.id) ? { ...c, isFlipped: false } : c,
          ),
        );
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
          {/* 카드 그리드 - 4x4 */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`
                  aspect-2/3 overflow-hidden transition-all duration-300
                  ${
                    card.isFlipped || card.isMatched
                      ? "bg-zinc-500 shadow-lg"
                      : "hover:scale-105 cursor-pointer"
                  }
                  ${card.isMatched ? "opacity-30" : ""}
                `}
                disabled={card.isMatched || isChecking}
              >
                {card.isFlipped || card.isMatched ? (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
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

          {/* 재시작 버튼 */}
          <div className="flex justify-between items-center">
            <span className="text-white text-lg font-bold">
              {moves} / {maxMoves}
            </span>
            <button
              onClick={initializeGame}
              className="px-2 py-2 hover:bg-white/30 text-white rounded-lg transition font-semibold"
            >
              Retry
            </button>
          </div>
        </>
      ) : isGameOver ? (
        // 게임 오버
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
        // 게임 완료 - 사진 갤러리
        <div className="bg-white/90 backdrop-blur rounded-lg shadow-lg p-6 overflow-auto">
          <p className="text-center text-xl font-bold mb-4">Success!</p>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div
                key={num}
                className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden"
              >
                <span className="text-gray-400">사진 {num}</span>
              </div>
            ))}
          </div>
          <div className="text-center">
            <button
              onClick={initializeGame}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition font-semibold"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
