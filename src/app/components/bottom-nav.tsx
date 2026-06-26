"use client";

import { usePathname } from "next/navigation";
import { Home, Users, BarChart3 } from "lucide-react";

const NAV = [
  { href: "/", label: "Ringkasan", icon: Home },
  { href: "/dosen", label: "Dosen", icon: Users },
  { href: "/analisis", label: "Analisis", icon: BarChart3 },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Don't show on admin pages
  if (pathname.startsWith("/admin")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t sm:hidden">
      <div className="flex justify-around items-center h-14">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition ${
                active ? "text-[#800000]" : "text-gray-400"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
