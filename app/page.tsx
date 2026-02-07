'use client';

import { useState } from 'react';
import Image from 'next/image';
import GameModal from '../components/GameModal'; // 경로는 실제 환경에 맞게 확인해주세요
import CardGame2019 from '../components/games/CardGame2019'; // 경로는 실제 환경에 맞게 확인해주세요

const miniatures = [
  { year: 2019, top: '17%', left: '10%' },
  { year: 2020, top: '10%', left: '35%' },
  { year: 2021, top: '50%', left: '10%' },
  { year: 2022, top: '50%', left: '58%' },
  { year: 2023, top: '68%', left: '50%' },
  { year: 2024, top: '90%', left: '73%' },
  { year: 2025, top: '21%', left: '82%' },
  { year: 2026, top: '80%', left: '25%' },
];

export default function Home() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const handleMiniatureClick = (e: React.MouseEvent, year: number) => {
    e.stopPropagation(); // 배경 클릭 등 이벤트 전파 방지
    setSelectedYear(year);
  };

  const closeModal = () => {
    setSelectedYear(null);
  };

  const selectedMiniature = miniatures.find(m => m.year === selectedYear);

  return (
    <main className="relative w-full h-screen overflow-hidden">
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
          
          return (
            <button
              key={item.year}
              onClick={(e) => handleMiniatureClick(e, item.year)}
              // 선택되었을 때(z-index 상승, 크기 확대) 스타일 적용
              className={`absolute group cursor-pointer w-12 h-12 transition-all duration-300 ${
                isSelected ? 'z-60 scale-125' : 'z-10'
              }`}
              style={{ top: item.top, left: item.left }}
            >
              {/* 미니어처 이미지 */}
              <div className="relative w-full h-full transition-transform duration-300 hover:scale-125 hover:drop-shadow-2xl">
                <Image
                  src={`/images/miniatures/${item.year}.png`}
                  alt={`${item.year}`}
                  fill
                  sizes="48px"
                  className={`object-contain transition-opacity duration-300 hover:opacity-100 ${
                    isSelected ? 'opacity-100' : 'opacity-25'
                  }`}
                />
              </div>

              {/* 년도 라벨 (hover시 혹은 선택되었을 때 표시하고 싶다면 조건 추가 가능) */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <span className="bg-black/70 text-white px-3 py-1 rounded text-sm font-bold whitespace-nowrap">
                  {item.year}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 게임 모달 */}
      {selectedYear !== null && (
        <GameModal 
          isOpen={true} 
          onClose={closeModal}
          year={selectedYear}
          miniaturePosition={selectedMiniature ? { top: selectedMiniature.top, left: selectedMiniature.left } : undefined}
        >
          {selectedYear === 2019 ? (
            <CardGame2019 />
          ) : (
            <div className="text-center text-white">
              <h2 className="text-4xl font-bold mb-4">{selectedYear}</h2>
              <p>준비중입니다...</p>
            </div>
          )}
        </GameModal>
      )}
    </main>
  );
}