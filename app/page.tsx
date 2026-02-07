import Image from 'next/image';
import Link from 'next/link';

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
        {miniatures.map((item) => (
          <Link
            key={item.year}
            href={`/${item.year}`}
            className="absolute group cursor-pointer"
            style={{ top: item.top, left: item.left }}
          >
            {/* 미니어처 이미지 */}
            <div className="relative w-12 h-12 transition-transform duration-300 hover:scale-125 hover:drop-shadow-2xl">
              <Image
                src={`/images/miniatures/${item.year}.png`}
                alt={`${item.year}`}
                fill
                className="object-contain opacity-30 hover:opacity-100"
              />
            </div>

            {/* 년도 라벨 (hover시 표시) */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="bg-black/70 text-white px-3 py-1 rounded text-sm font-bold whitespace-nowrap">
                {item.year}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}