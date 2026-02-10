"use client";

import { useState, useEffect } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

type Note = {
  id: string;
  name: string;
  message: string;
  color: string;
  createdAt: Date | null;
};

// 말풍선 색상 팔레트
const BUBBLE_COLORS = ["bg-zinc-200", "bg-zinc-300", "bg-zinc-400"];

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function NoteModal({ isOpen, onClose }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 실시간 메시지 구독
  useEffect(() => {
    if (!isOpen) return;

    const q = query(collection(db, "notes"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotes: Note[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        message: doc.data().message,
        color: doc.data().color,
        createdAt: doc.data().createdAt?.toDate() || null,
      }));
      setNotes(newNotes);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const randomColor =
      BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];

    try {
      await addDoc(collection(db, "notes"), {
        name: name.trim(),
        message: message.trim(),
        color: randomColor,
        createdAt: serverTimestamp(),
      });
      setName("");
      setMessage("");
    } catch (error) {
      console.error("Error adding note:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div
        className="relative w-[90vw] h-[85vh] max-w-4xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-50 p-2 bg-white/20 hover:bg-white/30 rounded-full transition"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* 타이틀 */}
        <h2 className="text-white text-xl text-center mb-4">Note</h2>

        {/* 말풍선 영역 */}
        <div className="flex-1 overflow-y-auto px-4 pb-32">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          ) : notes.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-white/50">Empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note, index) => (
                <div
                  key={note.id}
                  className={`
      relative max-w-[60%] p-4 rounded-2xl shadow-lg
      ${note.color}
      ${index % 2 === 0 ? "ml-0 rounded-bl-sm" : "ml-auto rounded-br-sm"}
    `}
                >
                  <p className="text-black text-sm mb-1">{note.name}</p>

                  {/* 무한 스크롤 메시지 */}
                  <div className="overflow-hidden group">
                    <p
                      className="text-black font-serif whitespace-nowrap group-hover:paused"
                      style={{
                        animation: `marquee ${Math.max(5, note.message.length * 0.2)}s linear infinite`,
                      }}
                    >
                      {note.message}
                    </p>
                  </div>

                  {note.createdAt && (
                    <p className="text-black font-serif text-xs mt-2">
                      {note.createdAt.toLocaleDateString("ko-KR")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 하단 고정: 입력폼 */}
        <div className="absolute bottom-0 left-0 right-0">
          {/* 입력 폼 */}
          <form
            onSubmit={handleSubmit}
            className="mx-4 mb-4 p-4 bg-white/10 backdrop-blur rounded-xl"
          >
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름"
                maxLength={10}
                className="shrink-0 w-24 px-3 py-2 bg-white/20 text-white placeholder-white/50 rounded-lg outline-none focus:ring-2 focus:ring-white/30"
              />
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="메시지를 남겨주세요..."
                maxLength={100}
                className="flex-1 px-3 py-2 bg-white/20 text-white font-serif placeholder-white/50 rounded-lg outline-none focus:ring-2 focus:ring-white/30"
              />
              <button
                type="submit"
                disabled={isSubmitting || !name.trim() || !message.trim()}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-white/30 text-xs text-right">
              {message.length}/100
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
