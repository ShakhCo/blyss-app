import { useEffect } from "react";
import { Link } from "react-router";
import { AppLayout } from "~/components/AppLayout";
import type { Route } from "./+types/messages";
import { Check, CheckCheck, Pin } from "lucide-react";
import { bottomNav } from "~/stores/bottomNav";

// Mock conversations data
const conversations = [
  {
    id: "support",
    name: "BLYSS Support",
    avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&h=100&fit=crop",
    lastMessage: "Salom! Sizga qanday yordam bera olaman?",
    time: "24/7",
    unread: 0,
    isRead: true,
    isOnline: true,
    isPinned: true,
  },
  {
    id: "1",
    name: "Malika Go'zallik Saloni",
    avatar: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&h=100&fit=crop",
    lastMessage: "Salom! Sizning bronlaringiz tasdiqlandi. Soat 14:00 da kutamiz!",
    time: "10:30",
    unread: 2,
    isRead: false,
    isOnline: true,
    isPinned: false,
  },
  {
    id: "2",
    name: "Zilola Beauty",
    avatar: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=100&h=100&fit=crop",
    lastMessage: "Rahmat! Sizni yana kutamiz 😊",
    time: "Kecha",
    unread: 0,
    isRead: true,
    isOnline: false,
    isPinned: false,
  },
  {
    id: "3",
    name: "Sitora Salon",
    avatar: "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=100&h=100&fit=crop",
    lastMessage: "Yangi aksiya! Barcha xizmatlarga 20% chegirma",
    time: "Kecha",
    unread: 1,
    isRead: false,
    isOnline: true,
    isPinned: false,
  },
  {
    id: "4",
    name: "Baraka Sartaroshxona",
    avatar: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=100&h=100&fit=crop",
    lastMessage: "Sizning so'rovingiz qabul qilindi",
    time: "27.11",
    unread: 0,
    isRead: true,
    isOnline: false,
    isPinned: false,
  },
  {
    id: "5",
    name: "Premium Beauty Studio",
    avatar: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=100&h=100&fit=crop",
    lastMessage: "Salom! Qanday yordam bera olaman?",
    time: "25.11",
    unread: 0,
    isRead: true,
    isOnline: false,
    isPinned: false,
  },
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Xabarlar - Blyss" },
    { name: "description", content: "Sizning xabarlaringiz" },
  ];
}

export default function Messages() {
  const unreadCount = conversations.filter((c) => c.unread > 0).length;

  useEffect(() => {
    bottomNav.show();
  }, []);

  return (
    <AppLayout back>
      <div className="pb-6">
        {/* Header */}
        
        <div className="px-4 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
              Xabarlar
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-1 bg-primary text-white text-xs font-medium rounded-full">
                {unreadCount} yangi
              </span>
            )}
          </div>
        </div>

        {/* Conversations List */}
        <div className="px-4">
          {conversations.length > 0 ? (
            <div className="">
              {conversations.map((conv) => (
                <Link
                  key={conv.id}
                  to={`/chat/${conv.id}`}
                  className="w-full flex items-center gap-3 py-3 rounded-2xl hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors text-left"
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <img
                      src={conv.avatar}
                      alt={conv.name}
                      className="size-14 rounded-full object-cover"
                    />
                    {conv.isOnline && (
                      <span className="absolute bottom-0 right-0 size-3.5 bg-green-500 border-2 border-white dark:border-stone-900 rounded-full" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h3
                          className={`text-sm truncate ${
                            conv.unread > 0
                              ? "font-semibold text-stone-900 dark:text-stone-100"
                              : "font-medium text-stone-700 dark:text-stone-300"
                          }`}
                        >
                          {conv.name}
                        </h3>
                        {conv.isPinned && (
                          <Pin size={12} className="text-stone-400 shrink-0" />
                        )}
                      </div>
                      <span
                        className={`text-xs shrink-0 ${
                          conv.unread > 0
                            ? "text-primary font-medium"
                            : "text-stone-400"
                        }`}
                      >
                        {conv.time}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p
                        className={`text-sm truncate ${
                          conv.unread > 0
                            ? "text-stone-700 dark:text-stone-300"
                            : "text-stone-500 dark:text-stone-400"
                        }`}
                      >
                        {conv.lastMessage}
                      </p>
                      {conv.unread > 0 ? (
                        <span className="shrink-0 size-5 flex items-center justify-center bg-primary text-white text-xs font-medium rounded-full">
                          {conv.unread}
                        </span>
                      ) : conv.isRead ? (
                        <CheckCheck size={16} className="shrink-0 text-primary" />
                      ) : (
                        <Check size={16} className="shrink-0 text-stone-400" />
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-stone-500 dark:text-stone-400">
                Xabarlar topilmadi
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
