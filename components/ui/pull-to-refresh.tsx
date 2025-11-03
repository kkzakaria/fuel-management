/**
 * Pull To Refresh Component
 * Composant wrapper pour ajouter la fonctionnalité pull-to-refresh
 * sur mobile
 */

"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullToRefreshProps {
  /** Contenu à afficher */
  children: ReactNode;
  /** Callback appelé lors du refresh */
  onRefresh: () => Promise<void> | void;
  /** Désactiver le pull-to-refresh */
  disabled?: boolean;
  /** Distance minimale de pull (px) */
  pullDistance?: number;
  /** Classe CSS personnalisée */
  className?: string;
}

export function PullToRefresh({
  children,
  onRefresh,
  disabled = false,
  pullDistance = 80,
  className,
}: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullPosition, setPullPosition] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled || typeof window === "undefined") return;

    const container = containerRef.current;
    if (!container) return;

    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      // Ne déclencher que si on est en haut de la page
      if (window.scrollY > 0 || isRefreshing || !e.touches[0]) return;

      startY = e.touches[0].clientY;
      touchStartY.current = startY;
      isDragging = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isRefreshing || window.scrollY > 0 || !e.touches[0]) return;

      currentY = e.touches[0].clientY;
      const diff = currentY - startY;

      // Ne tirer que vers le bas et seulement si on est en haut
      if (diff > 0 && window.scrollY === 0) {
        isDragging = true;
        setIsPulling(true);

        // Résistance progressive (effet élastique)
        const resistance = Math.min(diff * 0.5, pullDistance * 1.5);
        setPullPosition(resistance);

        // Empêcher le scroll par défaut pendant le pull
        if (diff > 10) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = async () => {
      if (!isDragging || isRefreshing) {
        setIsPulling(false);
        setPullPosition(0);
        return;
      }

      isDragging = false;

      // Déclencher le refresh si on a tiré assez loin
      if (pullPosition >= pullDistance) {
        setIsRefreshing(true);
        setPullPosition(pullDistance); // Fixer à la position de refresh

        try {
          await onRefresh();
        } catch (error) {
          console.error("Erreur lors du refresh:", error);
        } finally {
          // Animation de retour
          setTimeout(() => {
            setIsRefreshing(false);
            setIsPulling(false);
            setPullPosition(0);
          }, 300);
        }
      } else {
        // Pas assez tiré, annuler
        setIsPulling(false);
        setPullPosition(0);
      }
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);
    container.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [disabled, isRefreshing, pullDistance, onRefresh, pullPosition]);

  const showRefreshIndicator = isPulling || isRefreshing;
  const opacity = Math.min(pullPosition / pullDistance, 1);
  const scale = Math.min(0.6 + (pullPosition / pullDistance) * 0.4, 1);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Indicateur de refresh */}
      {showRefreshIndicator && (
        <div
          className="absolute left-0 right-0 flex items-center justify-center transition-all duration-300"
          style={{
            top: pullPosition - 40,
            opacity,
            transform: `scale(${scale})`,
          }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Loader2
              className={cn(
                "h-5 w-5 text-primary",
                isRefreshing && "animate-spin"
              )}
            />
          </div>
        </div>
      )}

      {/* Contenu avec transformation */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: isPulling ? `translateY(${Math.min(pullPosition, pullDistance)}px)` : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
