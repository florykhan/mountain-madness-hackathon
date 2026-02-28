"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/calendar", label: "Calendar" },
  { href: "/challenges", label: "Challenges" },
  { href: "/coach", label: "AI Coach" },
  { href: "/settings", label: "Settings" },
];

export function Navbar() {
  const pathname = usePathname();

  const isHome = pathname === "/";

  return (
    <header
      className={cn(
        "top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter]:backdrop-blur-md",
        isHome
          ? "fixed left-0 right-0 border-white/10 bg-black/20 bg-slate-900/30"
          : "sticky border-slate-200 bg-white/95 supports-[backdrop-filter]:bg-white/80"
      )}
    >
      <div className="container flex h-14 items-center justify-between px-4">
        <Link
          href="/"
          className={cn("flex items-center gap-2 font-semibold", isHome ? "text-white" : "text-slate-900")}
        >
          <Wallet className={cn("h-6 w-6", isHome ? "text-white" : "text-primary-600")} />
          {APP_NAME}
        </Link>
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? isHome
                      ? "bg-white/10 text-white"
                      : "bg-primary-50 text-primary-700"
                    : isHome
                      ? "text-slate-300 hover:bg-white/10 hover:text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
