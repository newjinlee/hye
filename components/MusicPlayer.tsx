"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Volume1 } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(20);
  const [prevVolume, setPrevVolume] = useState(50);
  const [showVolume, setShowVolume] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasTriedAutoplay = useRef(false);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;

    if (volume > 0) {
      setPrevVolume(volume);
      setVolume(0);
      audioRef.current.volume = 0;
    } else {
      setVolume(prevVolume);
      audioRef.current.volume = prevVolume / 100;
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  // 자동재생 시도 + 실패하면 첫 클릭에 재생
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener("ended", handleEnded);

    // 자동재생 시도
    const tryAutoplay = async () => {
      if (hasTriedAutoplay.current) return;
      hasTriedAutoplay.current = true;

      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        // 자동재생 실패 → 첫 클릭에 재생
        const playOnFirstClick = () => {
          audio.play();
          setIsPlaying(true);
          document.removeEventListener("click", playOnFirstClick);
        };
        document.addEventListener("click", playOnFirstClick);
      }
    };

    tryAutoplay();

    return () => audio.removeEventListener("ended", handleEnded);
  }, []);

  // 볼륨 변경 시 audio에 반영
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const volumeIcon = volume === 0 
    ? <VolumeX className="w-5 h-5 text-white" />
    : volume < 50 
      ? <Volume1 className="w-5 h-5 text-white" />
      : <Volume2 className="w-5 h-5 text-white" />;

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <audio ref={audioRef} src="/audio/bgm.m4a" loop />

      <button
        onClick={togglePlay}
        className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-full transition"
        title={isPlaying ? "일시정지" : "재생"}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 text-white" />
        ) : (
          <Play className="w-5 h-5 text-white" />
        )}
      </button>

      <div
        className="relative flex items-center"
        onMouseEnter={() => setShowVolume(true)}
        onMouseLeave={() => setShowVolume(false)}
      >
        <button
          onClick={toggleMute}
          className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-full transition"
          title={volume === 0 ? "음소거 해제" : "음소거"}
        >
          {volumeIcon}
        </button>

        <div
          className={`
            absolute right-0 top-full mt-2 px-4 py-3 bg-black/70 backdrop-blur rounded-lg
            flex flex-col items-center gap-2
            transition-all duration-200
            ${showVolume ? "opacity-100 visible" : "opacity-0 invisible"}
          `}
        >
          <Slider
            value={[volume]}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
            orientation="vertical"
            className="h-24"
          />
          <p className="text-white/70 text-xs">{volume}%</p>
        </div>
      </div>
    </div>
  );
}