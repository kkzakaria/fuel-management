/**
 * Header Component
 *
 * Dashboard header with mobile menu, notifications, and user dropdown
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
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
        {/* Tablet Menu Button - Hidden on mobile, visible on tablet, hidden on desktop */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[180px] p-0">
            <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
            <MobileSidebarContent
              userProfile={userProfile}
              onClose={() => setMobileMenuOpen(false)}
            />
          </SheetContent>
        </Sheet>

        {/* Logo - Mobile and Tablet only */}
        <Link href="/" className="flex items-center lg:hidden p-1">
          <Image
            src="/logo.png"
            alt="Logo Transport Manager"
            width={80}
            height={43}
          />
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
