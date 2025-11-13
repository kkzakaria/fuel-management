/**
 * Bottom Navigation Component
 *
 * Mobile bottom navigation bar with quick access icons
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  TruckIcon,
  Users,
  Car,
  Building2,
  FileText,
  Settings,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    roles: ["admin", "gestionnaire", "chauffeur", "personnel"],
  },
  {
    title: "Trajets",
    href: "/trajets",
    icon: TruckIcon,
    roles: ["admin", "gestionnaire", "chauffeur", "personnel"],
  },
  {
    title: "Chauffeurs",
    href: "/chauffeurs",
    icon: Users,
    roles: ["admin", "gestionnaire"],
  },
  {
    title: "Véhicules",
    href: "/vehicules",
    icon: Car,
    roles: ["admin", "gestionnaire"],
  },
  {
    title: "Sous-traitance",
    href: "/sous-traitance",
    icon: Building2,
    roles: ["admin", "gestionnaire", "personnel"],
  },
  {
    title: "Rapports",
    href: "/rapports",
    icon: FileText,
    roles: ["admin", "gestionnaire"],
  },
  {
    title: "Paramètres",
    href: "/parametres",
    icon: Settings,
    roles: ["admin", "gestionnaire", "chauffeur", "personnel"],
  },
];

interface BottomNavProps {
  userRole: string;
}

export function BottomNav({ userRole }: BottomNavProps) {
  const pathname = usePathname();

  // Filter nav items based on user role and limit to 6 items
  const visibleItems = navItems
    .filter((item) => item.roles.includes(userRole))
    .slice(0, 6);

  return (
    <nav className="fixed bottom-2 left-2 right-2 z-50 sm:hidden">
      <div className="mx-auto max-w-md rounded-full bg-blue-800 px-2 py-1 shadow-2xl">
        <div className="flex items-center justify-around">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-shrink-0 items-center justify-center gap-1 rounded-full transition-all duration-300",
                  isActive
                    ? "bg-blue-500 px-3 py-1.5 text-white"
                    : "h-9 w-9 text-white/70 hover:text-white",
                )}
              >
                <Icon className={cn("h-4 w-4", isActive && "stroke-[2.5]")} />
                {isActive && (
                  <span className="text-xs font-medium whitespace-nowrap">
                    {item.title}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
