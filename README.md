# 🌻 HYE - 졸업 타임라인 프로젝트

졸업을 축하하며 만든 인터랙티브 타임라인 웹사이트입니다. 2019년부터 2026년까지 8년간의 추억을 게임과 갤러리로 담아낸 프로젝트입니다.

## 📋 목차
- [프로젝트 개요](#프로젝트-개요)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [설치 및 실행](#설치-및-실행)
- [프로젝트 구조](#프로젝트-구조)
- [게임 가이드](#게임-가이드)

## 🎯 프로젝트 개요

**HYE**는 졸업생의 대학 생활 8년을 회상하는 인터랙티브 웹 경험입니다.

- **배경**: 각 연도별 추억을 담은 배경 이미지
- **미니어처**: 화면 곳곳에 배치된 연도별 미니어처 아이콘
- **게임**: 각 연도마다 다른 미니게임을 플레이하여 데이터 "저장"
- **갤러리**: 게임 완료 시 해당 연도의 사진 갤러리 언락
- **방명록**: 방문자들이 남길 수 있는 메시지 (Firebase 연동)

## ✨ 주요 기능

### 🎮 8가지 미니게임
| 연도 | 게임명 | 설명 |
|------|--------|------|
| **2019** | 카드 매칭 게임 | 같은 이모지 카드 짝 맞추기 (19번 제한) |
| **2020** | 퍼즐 게임 | 3×3 슬라이딩 퍼즐 (5분 제한) |
| **2021** | 스택 게임 | 블록을 쌓아올려 20층 도달 |
| **2022** | 낱말 잡기 게임 | 떨어지는 단어들을 바구니로 캐치 |
| **2023** | 비디오 플레이어 | 동영상 끝까지 시청 |
| **2024** | CAPTCHA 게임 | 특정 이미지 선택하기 |
| **2025** | 미로 게임 | 미로를 탈출하며 아이템 수집 |
| **2026** | (준비 중) | 추후 추가 예정 |

### 📸 갤러리
- 게임 완료 시 해당 연도의 사진 갤러리 언락
- **상호작용**:
  - 폴라로이드 사진 드래그 이동
  - 사진 클릭으로 확대 보기
  - 년도별 미니어처로 갤러리 탐색

### 📝 방명록 (Note)
- **기능**:
  - 이름과 메시지 입력
  - Firestore 실시간 동기화
  - 무한 스크롤 메시지 애니메이션
  - 랜덤 배경색 말풍선

### 🎵 배경음악
- 자동 재생 시도 (브라우저 정책에 따름)
- 볼륨 조절 슬라이더
- 음소거 토글

### 🔍 특수 효과
- **돋보기 커서**: 특정 영역 마우스 오버 시 줌인 효과
- **시크릿 파인더**: 숨겨진 이미지 발견 기능

## 🛠️ 기술 스택

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (React 19)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
  - Radix UI (Dialog, Slider)
  - Lucide React (Icons)

### State Management
- **Zustand**: 게임 진행 상태 관리
- **SessionStorage**: 진행도 저장

### Backend & Database
- **Firebase**:
  - Firestore: 방명록 데이터 저장
  - Real-time Sync: 메시지 실시간 업데이트

### Build & Development
- **Language**: TypeScript
- **Package Manager**: npm
- **Development Server**: Next.js dev server
- **Linting**: ESLint 9

## 📦 설치 및 실행

### 환경 요구사항
- Node.js 18+ 
- npm 또는 yarn

### 설치

\`\`\`bash
# 저장소 클론
git clone https://github.com/newjinlee/hye.git
cd hye

# 의존성 설치
npm install
\`\`\`

### 환경 설정

\`.env.local\` 파일 생성 (Firebase 설정):

\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
\`\`\`

### 실행

\`\`\`bash
# 개발 서버
npm run dev
# http://localhost:3000 에서 실행

# 프로덕션 빌드
npm run build

# 프로덕션 시작
npm start

# 린트 검사
npm run lint
\`\`\`

## 📂 프로젝트 구조

\`\`\`
hye/
├── app/
│   ├── page.tsx              # 메인 페이지
│   ├── layout.tsx            # Root 레이아웃
│   └── globals.css           # 전역 스타일
├── components/
│   ├── games/                # 미니게임 컴포넌트
│   │   ├── CardGame2019.tsx
│   │   ├── PuzzleGame2020.tsx
│   │   ├── StackGame2021.tsx
│   │   ├── CatchGame2022.tsx
│   │   ├── VideoPlayer2023.tsx
│   │   ├── CaptchaGame2024.tsx
│   │   └── MazeGame2025.tsx
│   ├── ui/                   # shadcn UI 컴포넌트
│   │   ├── dialog.tsx
│   │   └── slider.tsx
│   ├── GameModal.tsx         # 게임 모달
│   ├── GalleryModal.tsx      # 갤러리 모달
│   ├── NoteModal.tsx         # 방명록 모달
│   ├── MusicPlayer.tsx       # 배경음악 플레이어
│   ├── MagnifyingCursor.tsx  # 돋보기 커서
│   └── SecretFinder.tsx      # 시크릿 파인더
├── store/
│   └── gameStore.ts          # Zustand 게임 상태
├── lib/
│   ├── firebase.ts           # Firebase 초기화
│   └── utils.ts              # 유틸리티 함수
├── public/
│   ├── images/               # 게임, 갤러리, 배경 이미지
│   ├── audio/                # 배경음악
│   └── fonts/                # 커스텀 폰트
└── 설정 파일들
    ├── next.config.ts
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── package.json
\`\`\`

## 🎮 게임 가이드

### 2019 - 카드 매칭 게임
- 같은 이모지를 가진 카드를 클릭하여 짝 맞추기
- 19번의 시도 제한
- 모든 카드를 맞춰야 성공

### 2020 - 퍼즐 게임
- 3×3 슬라이딩 퍼즐 완성
- 5분(300초) 제한 시간
- 빈 칸 근처의 타일을 클릭하여 이동

### 2021 - 스택 게임
- 떨어지는 블록을 클릭하여 쌓기
- 20층까지 쌓기
- 중앙에 정확히 맞추면 "Perfect!"

### 2022 - 낱말 잡기
- 화면에서 떨어지는 단어들을 바구니로 캐치
- 마우스 또는 ← → 키로 바구니 이동
- 모든 단어 캐치 시 성공

### 2023 - 비디오 플레이어
- 영상을 끝까지 시청
- 완료 시 자동으로 저장

### 2024 - CAPTCHA 게임
- 혜승의 2024년 이미지들 선택
- 9개 이미지 중 5개 선택 (정답: 5,6,7,8,9번)
- 제출하여 정답 확인

### 2025 - 미로 게임
- 미로 탈출
- 경로상의 아이템 3개 수집
- 화살표 키 또는 WASD로 이동

## 📊 게임 진행도 추적

게임 진행도는 \`SessionStorage\`에 저장되며 다음 정보를 포함합니다:

\`\`\`typescript
{
  [year]: {
    completed: boolean,
    attempts: number,
    lastPlayed?: string (ISO timestamp)
  }
}
\`\`\`

## 🎨 디자인 특징

- **DungGeunMo 폰트**: 8비트 스타일의 전체 텍스트
- **Tailwind CSS**: 반응형 디자인
- **커스텀 커서**: 배경 이미지 기반 커서
- **애니메이션**: Tailwind 애니메이션 + 커스텀 키프레임

## 🔐 보안

- Firestore 보안 규칙으로 데이터 보호
- 환경 변수로 민감 정보 관리
- \`NEXT_PUBLIC_\` 프리픽스로 공개 정보 구분

## 📱 반응형 디자인

- 모바일, 태블릿, 데스크톱 대응
- 터치 이벤트 지원 (필요한 게임)
- 화면 크기별 최적화

## 🚀 배포

[Vercel](https://vercel.com)에 배포 권장:

\`\`\`bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
\`\`\`

## 📄 라이선스

개인 프로젝트입니다.

## 👤 제작자

**cometui** - 졸업을 축하하며

- Instagram: [@cometui](https://instagram.com/cometui)

---

**오류 발견 또는 개선 제안이 있으신가요?** Issue를 등록해주세요! 🌻
