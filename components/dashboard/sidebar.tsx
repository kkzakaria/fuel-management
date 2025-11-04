/**
 * Sidebar Component
 *
 * Desktop sidebar and mobile sheet navigation
 * Displays menu based on user role
 */

"use client";

import Link from "next/link";
import Image from "next/image";
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
import type { Profile } from "@/lib/supabase/types";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[]; // Roles that can see this item
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
    roles: ["admin"],
  },
];

interface SidebarProps {
  userProfile: Profile;
}

export function Sidebar({ userProfile }: SidebarProps) {
  const pathname = usePathname();

  // Filter nav items based on user role
  const visibleItems = navItems.filter((item) =>
    item.roles.includes(userProfile.role),
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r bg-card lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/" className="flex items-center gap-3 font-semibold">
              <Image
                src="/logo-suivi-carburant.png"
                alt="Logo Suivi Carburant"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span>Transport Manager</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
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
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
