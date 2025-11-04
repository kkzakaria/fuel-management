/**
 * Floating Action Button (FAB)
 * Bouton flottant en bas à droite pour mobile
 */

"use client";

import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  href: string;
  icon: LucideIcon;
  label: string;
  className?: string;
}

export function FloatingActionButton({
  href,
  icon: Icon,
  label,
  className,
}: FloatingActionButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        // Position fixe en bas à droite
        "fixed bottom-20 right-4 z-50",
        // Visible uniquement sur mobile
        "md:hidden",
        // Animation
        "transition-transform duration-200 active:scale-95",
        className
      )}
      aria-label={label}
    >
      <Button
        size="lg"
        className={cn(
          "h-14 w-14 rounded-full shadow-lg",
          "hover:shadow-xl",
          "flex items-center justify-center"
        )}
      >
        <Icon className="h-6 w-6" />
        <span className="sr-only">{label}</span>
      </Button>
    </Link>
  );
}
