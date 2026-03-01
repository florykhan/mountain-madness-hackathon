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
        "fixed left-0 right-0 top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter]:backdrop-blur-md",
        isHome
          ? "border-white/10 bg-black/15 bg-slate-900/25"
          : "border-slate-200 bg-white/85 supports-[backdrop-filter]:bg-white/70"
      )}
    >
      <div className="flex h-14 w-full min-w-0 items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className={cn(
            "flex shrink-0 items-center gap-2 font-semibold",
            isHome ? "text-white" : "text-slate-900"
          )}
        >
          <Wallet className={cn("h-6 w-6", isHome ? "text-white" : "text-primary-600")} />
          {APP_NAME}
        </Link>
        <nav className="flex min-w-0 flex-1 justify-end overflow-x-auto overflow-y-hidden py-2">
          <div className="flex flex-nowrap items-center gap-0.5 sm:gap-1">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "whitespace-nowrap rounded-md px-2 py-1.5 text-sm font-medium transition-colors sm:px-3 sm:py-2",
                    isActive
                      ? isHome
                        ? "bg-white/5 text-white"
                        : "bg-primary-50 text-primary-700"
                      : isHome
                        ? "text-slate-300 hover:bg-white/5 hover:text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
