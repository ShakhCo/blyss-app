import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router";
import { AppLayout } from "~/components/AppLayout";
import type { Route } from "./+types/chat";
import { bottomNav } from "~/stores/bottomNav";
import { useSignal, viewport } from "@tma.js/sdk-react";
import {
  Send,
  Phone,
  MoreVertical,
  CheckCheck,
  Check,
} from "lucide-react";

// Mock conversations data (same as messages page)
const conversationsData: Record<
  string,
  {
    id: string;
    name: string;
    avatar: string;
    isOnline: boolean;
    lastSeen?: string;
  }
> = {
  support: {
    id: "support",
    name: "BLYSS Support",
    avatar:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&h=100&fit=crop",
    isOnline: true,
  },
  "1": {
    id: "1",
    name: "Malika Go'zallik Saloni",
    avatar:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&h=100&fit=crop",
    isOnline: true,
  },
  "2": {
    id: "2",
    name: "Zilola Beauty",
    avatar:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=100&h=100&fit=crop",
    isOnline: false,
    lastSeen: "2 soat oldin",
  },
  "3": {
    id: "3",
    name: "Sitora Salon",
    avatar:
      "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=100&h=100&fit=crop",
    isOnline: true,
  },
  "4": {
    id: "4",
    name: "Baraka Sartaroshxona",
    avatar:
      "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=100&h=100&fit=crop",
    isOnline: false,
    lastSeen: "Kecha",
  },
  "5": {
    id: "5",
    name: "Premium Beauty Studio",
    avatar:
      "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=100&h=100&fit=crop",
    isOnline: false,
    lastSeen: "3 kun oldin",
  },
};

// Mock messages with dates
const mockMessages: Record<
  string,
  Array<{
    id: string;
    text: string;
    time: string;
    date: string;
    isSent: boolean;
    isRead: boolean;
  }>
> = {
  support: [
    {
      id: "1",
      text: "Salom! BLYSS Support xizmatiga xush kelibsiz. Sizga qanday yordam bera olaman?",
      time: "10:00",
      date: "Bugun",
      isSent: false,
      isRead: true,
    },
  ],
  "1": [
    {
      id: "1",
      text: "Salom! Bugun soat 14:00 ga bron qilmoqchiman",
      time: "09:30",
      date: "Bugun",
      isSent: true,
      isRead: true,
    },
    {
      id: "2",
      text: "Salom! Ha, albatta. Qaysi xizmatni tanlaysiz?",
      time: "09:32",
      date: "Bugun",
      isSent: false,
      isRead: true,
    },
    {
      id: "3",
      text: "Soch olish va ukladka",
      time: "09:33",
      date: "Bugun",
      isSent: true,
      isRead: true,
    },
    {
      id: "4",
      text: "Yaxshi, siz uchun joy bor. Soat 14:00 da kutamiz!",
      time: "09:35",
      date: "Bugun",
      isSent: false,
      isRead: true,
    },
    {
      id: "5",
      text: "Rahmat! Ko'rishguncha",
      time: "09:36",
      date: "Bugun",
      isSent: true,
      isRead: true,
    },
    {
      id: "6",
      text: "Salom! Sizning bronlaringiz tasdiqlandi. Soat 14:00 da kutamiz!",
      time: "10:30",
      date: "Bugun",
      isSent: false,
      isRead: false,
    },
  ],
  "2": [
    {
      id: "1",
      text: "Bugungi tashrif uchun rahmat!",
      time: "15:00",
      date: "Kecha",
      isSent: false,
      isRead: true,
    },
    {
      id: "2",
      text: "Sizga ham rahmat! Juda yaxshi xizmat!",
      time: "15:05",
      date: "Kecha",
      isSent: true,
      isRead: true,
    },
    {
      id: "3",
      text: "Rahmat! Sizni yana kutamiz 😊",
      time: "15:10",
      date: "Kecha",
      isSent: false,
      isRead: true,
    },
  ],
  "3": [
    {
      id: "1",
      text: "Yangi aksiya! Barcha xizmatlarga 20% chegirma",
      time: "12:00",
      date: "Kecha",
      isSent: false,
      isRead: false,
    },
  ],
};

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Chat - Blyss" },
    { name: "description", content: "Chat sahifasi" },
  ];
}

export default function Chat() {
  const { id } = useParams();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Get safe area insets and height from Telegram viewport
  const safeAreaInsets = useSignal(viewport.safeAreaInsets);
  const viewportHeight = useSignal(viewport.height);

  const conversation = conversationsData[id || ""] || {
    id: "",
    name: "Noma'lum",
    avatar: "",
    isOnline: false,
  };

  const messages = mockMessages[id || ""] || [];

  // Group messages by date
  const groupedMessages = messages.reduce(
    (groups, msg) => {
      const date = msg.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
      return groups;
    },
    {} as Record<string, typeof messages>
  );

  useEffect(() => {
    bottomNav.hide();
    return () => {
      bottomNav.show();
    };
  }, []);

  // Scroll to bottom helper - find the AppLayout scroll container
  const scrollToBottom = (smooth = true) => {
    // The scroll container is in AppLayout: div.overflow-y-auto.scrollbar-hide
    const scrollContainer = document.querySelector('.overflow-y-auto.scrollbar-hide');
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: smooth ? 'smooth' : 'instant',
      });
    }
  };

  // Scroll to bottom on mount (instant, no animation)
  useEffect(() => {
    scrollToBottom(false);
  }, []);

  // Scroll to bottom when viewport height changes (keyboard opens/closes)
  useEffect(() => {
    if (viewportHeight) {
      // Small delay to let the layout adjust
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [viewportHeight]);


  const handleSend = () => {
    if (!message.trim()) return;
    // In real app, send message to server
    setMessage("");
    inputRef.current?.focus();
  };

  return (
    <AppLayout back>
      {/* Chat Header - Fixed at top */}
      <div className="fixed top-30 sm:top-24 left-0 right-0 z-40 flex items-center gap-3 px-4 py-3 border-b border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 rounded-t-3xl shadow-sm">
        <div className="relative shrink-0">
          <img
            src={conversation.avatar}
            alt={conversation.name}
            className="size-11 rounded-full object-cover ring-2 ring-stone-100 dark:ring-stone-700"
          />
          {conversation.isOnline && (
            <span className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-white dark:border-stone-900 rounded-full" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-stone-900 dark:text-stone-100 truncate text-[15px]">
            {conversation.name}
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
            {conversation.isOnline ? (
              <>
                {/* <span className="size-1.5 bg-green-500 rounded-full" /> */}
                <span>Online</span>
              </>
            ) : conversation.lastSeen ? (
              `So'nggi faollik: ${conversation.lastSeen}`
            ) : (
              "Offline"
            )}
          </p>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            className="p-2.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors active:scale-95"
            aria-label="Qo'ng'iroq qilish"
          >
            <Phone size={20} className="text-stone-600 dark:text-stone-400" />
          </button>
          <button
            type="button"
            className="p-2.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors active:scale-95"
            aria-label="Ko'proq"
          >
            <MoreVertical
              size={20}
              className="text-stone-600 dark:text-stone-400"
            />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="pt-20 px-4 space-y-4" style={{ paddingBottom: `${(safeAreaInsets?.bottom ?? 0) + 70}px` }}>
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date Separator */}
            <div className="flex items-center justify-center my-4">
              <span className="px-3 py-1 bg-stone-100 dark:bg-stone-800 rounded-full text-xs text-stone-500 dark:text-stone-400 font-medium">
                {date}
              </span>
            </div>

            {/* Messages for this date */}
            <div className="space-y-2">
              {dateMessages.map((msg, index) => {
                const isFirstInGroup =
                  index === 0 || dateMessages[index - 1].isSent !== msg.isSent;
                const isLastInGroup =
                  index === dateMessages.length - 1 ||
                  dateMessages[index + 1].isSent !== msg.isSent;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isSent ? "justify-end" : "justify-start"} ${!isLastInGroup ? "mb-0.5" : ""}`}
                  >
                    <div
                      className={`max-w-[80%] px-3.5 py-2 ${msg.isSent
                          ? `bg-primary text-white ${isFirstInGroup && isLastInGroup
                            ? "rounded-2xl rounded-br-md"
                            : isFirstInGroup
                              ? "rounded-2xl rounded-br-md"
                              : isLastInGroup
                                ? "rounded-2xl rounded-tr-md rounded-br-md"
                                : "rounded-2xl rounded-r-md"
                          }`
                          : `bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 ${isFirstInGroup && isLastInGroup
                            ? "rounded-2xl rounded-bl-md"
                            : isFirstInGroup
                              ? "rounded-2xl rounded-bl-md"
                              : isLastInGroup
                                ? "rounded-2xl rounded-tl-md rounded-bl-md"
                                : "rounded-2xl rounded-l-md"
                          }`
                        }`}
                    >
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                        {msg.text}
                      </p>
                      <div
                        className={`flex items-center justify-end gap-1 mt-1 ${msg.isSent ? "text-white/70" : "text-stone-400"
                          }`}
                      >
                        <span className="text-[10px]">{msg.time}</span>
                        {msg.isSent &&
                          (msg.isRead ? (
                            <CheckCheck size={14} className="text-white" />
                          ) : (
                            <Check size={14} className="text-white/60" />
                          ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Floating at bottom */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 px-3 pt-1"
        style={{
          paddingBottom: `${(safeAreaInsets?.bottom ?? 0) + 12}px`,
        }}
      >
        {/* Background blur layer */}
        <div
          className="absolute inset-0 -z-10 backdrop-blur-md"
          style={{
            maskImage:
              "linear-gradient(to top, black 0%, black 70%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to top, black 0%, black 70%, transparent 100%)",
          }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-white/95 via-white/80 to-transparent dark:from-stone-900/95 dark:via-stone-900/80 pointer-events-none" />

        {/* Input container */}
        <div className="relative flex items-center gap-2 bg-white/95 dark:bg-stone-800/95 backdrop-blur-lg rounded-3xl shadow-lg shadow-stone-200/50 dark:shadow-stone-950/50 border border-stone-200 dark:border-stone-700 px-4 py-2">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              // Auto-resize textarea
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            onFocus={() => {
              // Scroll after keyboard animation settles
              setTimeout(() => scrollToBottom(), 300);
            }}
            placeholder="Xabar yozing..."
            rows={1}
            className="flex-1 bg-transparent text-[15px] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none resize-none max-h-[120px] leading-normal"
            style={{ height: "24px", minHeight: "24px" }}
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={!message.trim()}
            className="p-2.5 bg-primary text-white rounded-full hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 shrink-0 self-end"
            aria-label="Xabar yuborish"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
