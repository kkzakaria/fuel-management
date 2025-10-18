/**
 * Header Component
 *
 * Dashboard header with mobile menu, notifications, and user dropdown
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, TruckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AlertBadge } from "./alert-badge";
import { UserDropdown } from "./user-dropdown";
import { MobileSidebarContent } from "./mobile-sidebar-content";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/supabase/types";

interface HeaderProps {
  user: User;
  userProfile: Profile;
}

export function Header({ user, userProfile }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
        {/* Mobile Menu Button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
            <MobileSidebarContent
              userProfile={userProfile}
              onClose={() => setMobileMenuOpen(false)}
            />
          </SheetContent>
        </Sheet>

        {/* Logo - Mobile only */}
        <Link href="/" className="flex items-center gap-2 lg:hidden">
          <TruckIcon className="h-6 w-6" />
          <span className="font-semibold">Transport Manager</span>
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Alerts Badge */}
        <AlertBadge />

        {/* User Dropdown */}
        <UserDropdown user={user} userProfile={userProfile} />
      </div>
    </header>
  );
}
