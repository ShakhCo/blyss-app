import { NavLink } from "react-router";
import { Home, Search, CalendarDays, MessageCircle, User } from "lucide-react";
import { useBottomNavStore } from "~/stores/bottomNav";

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    id: "home",
    label: "Asosiy",
    path: "/",
    icon: <Home size={22} />,
  },
  {
    id: "search",
    label: "Qidirish",
    path: "/search",
    icon: <Search size={22} />,
  },
  // {
  //   id: "orders",
  //   label: "Buyurtmalar",
  //   path: "/orders",
  //   icon: <CalendarDays size={22} />,
  // },
  {
    id: "messages",
    label: "Xabarlar",
    path: "/messages",
    icon: <MessageCircle size={22} />,
  },
  {
    id: "profile",
    label: "Profil",
    path: "/profile",
    icon: <User size={22} />,
  },
];

export function BottomNav() {
  const isVisible = useBottomNavStore((state) => state.isVisible);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 px-3 pt-1 transition-all duration-300 ease-out"
      style={{
        transform: isVisible ? "translateY(0)" : "translateY(100%)",
        opacity: isVisible ? 1 : 0,
        paddingBottom: 'calc(var(--tg-safe-area-inset-bottom, 0px) + 12px)',
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

      {/* Nav container */}
      <div className="relative bg-white/95 dark:bg-stone-800/95 backdrop-blur-lg rounded-[1.75rem] shadow-lg shadow-stone-200/50 dark:shadow-stone-950/50 border-t border-t-stone-200 dark:border-t-stone-900">
        <div className="grid grid-cols-4 gap-1 items-center justify-around h-16 px-2 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => (
            <div key={item.id} className="">
              <NavLink
                to={item.path}
                prefetch="intent"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 ${isActive ? "text-primary dark:text-primary" : "text-stone-400 dark:text-stone-500"
                  }`
                }
              >
                {item.icon}
                <span className="text-xs font-medium line-clamp-1">{item.label}</span>
              </NavLink>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
