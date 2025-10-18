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
];

interface BottomNavProps {
  userRole: string;
}

export function BottomNav({ userRole }: BottomNavProps) {
  const pathname = usePathname();

  // Filter nav items based on user role and limit to 5 items
  const visibleItems = navItems
    .filter((item) => item.roles.includes(userRole))
    .slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background lg:hidden">
      <div className="flex h-16 items-center justify-around px-2">
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
                "flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "fill-current")} />
              <span className="text-xs font-medium">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
