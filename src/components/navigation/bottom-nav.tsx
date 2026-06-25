"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sword, BarChart2, Utensils, User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "HQ",       icon: Home },
  { href: "/missions",  label: "Missions",  icon: Sword },
  { href: "/ops",       label: "Ops",       icon: BarChart2 },
  { href: "/nutrition", label: "Rations",   icon: Utensils },
  { href: "/profile",   label: "Profile",   icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className="h-14 flex-shrink-0 flex border-t"
      style={{
        background: "var(--bg-overlay)",
        borderColor: "var(--border-subtle)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
            className="flex-1 flex flex-col items-center justify-center gap-[3px] no-underline transition-colors duration-100 min-h-[44px] relative"
            style={{ color: isActive ? "var(--operative-500)" : "var(--text-disabled)" }}
          >
            {/* Active dot */}
            {isActive && (
              <span
                className="absolute top-1.5 w-1 h-1 rounded-full"
                style={{ background: "var(--operative-500)" }}
                aria-hidden="true"
              />
            )}
            <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
            <span
              className="text-[9px] font-bold uppercase tracking-[0.06em]"
              style={{ lineHeight: 1 }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
