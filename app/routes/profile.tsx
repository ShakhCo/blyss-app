import { useEffect } from "react";
import { useOutletContext, Link } from "react-router";
import { AppLayout } from "~/components/AppLayout";
import type { Route } from "./+types/profile";
import type { TmaContext } from "~/root";
import { bottomNav } from "~/stores/bottomNav";
import {
  Calendar,
  Heart,
  MapPin,
  CreditCard,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Star,
  Gift,
} from "lucide-react";

// Mock user stats
const userStats = {
  bookings: 12,
  favorites: 8,
  reviews: 5,
};

// Menu items configuration
const menuSections = [
  {
    title: "Mening hisobim",
    items: [
      {
        id: "bookings",
        icon: Calendar,
        label: "Bronlarim",
        badge: "2 faol",
        href: "/bookings",
      },
      {
        id: "favorites",
        icon: Heart,
        label: "Sevimlilar",
        badge: null,
        href: "/favorites",
      },
      {
        id: "addresses",
        icon: MapPin,
        label: "Manzillarim",
        badge: null,
        href: "/addresses",
      },
      {
        id: "payments",
        icon: CreditCard,
        label: "To'lov usullari",
        badge: null,
        href: "/payments",
      },
    ],
  },
  {
    title: "Sozlamalar",
    items: [
      {
        id: "notifications",
        icon: Bell,
        label: "Bildirishnomalar",
        badge: null,
        href: "/notifications",
      },
      {
        id: "settings",
        icon: Settings,
        label: "Sozlamalar",
        badge: null,
        href: "/settings",
      },
    ],
  },
  {
    title: "Qo'llab-quvvatlash",
    items: [
      {
        id: "help",
        icon: HelpCircle,
        label: "Yordam markazi",
        badge: null,
        href: "/help",
      },
      {
        id: "gift",
        icon: Gift,
        label: "Do'stlarni taklif qilish",
        badge: "10,000 so'm",
        href: "/referral",
      },
    ],
  },
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Profil - Blyss" },
    { name: "description", content: "Sizning profilingiz" },
  ];
}

export default function Profile() {
  const { user } = useOutletContext<TmaContext>();

  useEffect(() => {
    bottomNav.show();
  }, []);

  return (
    <AppLayout>
      <div className="pb-24">
        {/* Profile Header */}
        <div className="px-4 pt-6 pb-6">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              {user?.photo_url ? (
                <img
                  src={user.photo_url}
                  alt={user.first_name}
                  className="size-20 rounded-full object-cover ring-4 ring-primary/20"
                />
              ) : (
                <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center ring-4 ring-primary/20">
                  <span className="text-2xl font-bold text-primary">
                    {user?.first_name?.charAt(0) || "U"}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 size-6 bg-green-500 rounded-full border-3 border-white dark:border-stone-900" />
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                {user?.first_name} {user?.last_name}
              </h1>
              {user?.username && (
                <p className="text-stone-500 dark:text-stone-400 text-sm">
                  @{user.username}
                </p>
              )}
              <button
                type="button"
                className="mt-2 text-sm text-primary font-medium"
              >
                Profilni tahrirlash
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-4 mb-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-stone-50 dark:bg-stone-800/50 rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Calendar size={20} className="text-primary" />
              </div>
              <p className="text-xl font-bold text-stone-900 dark:text-stone-100">
                {userStats.bookings}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Bronlar
              </p>
            </div>
            <div className="bg-stone-50 dark:bg-stone-800/50 rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Heart size={20} className="text-primary" />
              </div>
              <p className="text-xl font-bold text-stone-900 dark:text-stone-100">
                {userStats.favorites}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Sevimli
              </p>
            </div>
            <div className="bg-stone-50 dark:bg-stone-800/50 rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Star size={20} className="text-primary" />
              </div>
              <p className="text-xl font-bold text-stone-900 dark:text-stone-100">
                {userStats.reviews}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Sharhlar
              </p>
            </div>
          </div>
        </div>

        {/* Loyalty Card */}
        <div className="px-4 mb-6">
          <div className="bg-gradient-to-r from-primary to-orange-400 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium opacity-90">
                Bonus ballar
              </span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                Gold
              </span>
            </div>
            <p className="text-3xl font-bold mb-1">2,450</p>
            <p className="text-sm opacity-80">
              Keyingi daraja uchun 550 ball kerak
            </p>
            <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full"
                style={{ width: "82%" }}
              />
            </div>
          </div>
        </div>

        {/* Menu Sections */}
        <div className="px-4 space-y-6">
          {menuSections.map((section) => (
            <div key={section.title}>
              <h2 className="text-sm font-semibold text-stone-500 dark:text-stone-400 mb-2 px-1">
                {section.title}
              </h2>
              <div className="bg-stone-50 dark:bg-stone-800/50 rounded-2xl overflow-hidden">
                {section.items.map((item, index) => (
                  <Link
                    key={item.id}
                    to={item.href}
                    className={`flex items-center gap-3 px-4 py-3.5 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors ${
                      index !== section.items.length - 1
                        ? "border-b border-stone-200 dark:border-stone-700"
                        : ""
                    }`}
                  >
                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon size={20} className="text-primary" />
                    </div>
                    <span className="flex-1 font-medium text-stone-900 dark:text-stone-100">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight
                      size={18}
                      className="text-stone-400 shrink-0"
                    />
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Logout Button */}
          <button
            type="button"
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-red-50 dark:bg-red-900/20 rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <div className="size-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
              <LogOut size={20} className="text-red-500" />
            </div>
            <span className="flex-1 font-medium text-red-500 text-left">
              Chiqish
            </span>
          </button>
        </div>

        {/* App Version */}
        <div className="px-4 mt-8 text-center">
          <p className="text-xs text-stone-400 dark:text-stone-500">
            Blyss v1.0.0
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
