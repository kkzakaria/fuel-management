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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background sm:hidden">
      <div className="flex min-h-[72px] items-center justify-around px-2 pb-safe">
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
                "flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1.5 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("h-6 w-6", isActive && "fill-current")} />
              <span className="text-xs font-medium">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
