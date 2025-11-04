/**
 * Composant Infinite Scroll
 * Charge automatiquement la page suivante au scroll
 */

"use client";

import { useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface InfiniteScrollProps {
  children: React.ReactNode;
  onLoadMore: () => void;
  hasMore: boolean;
  loading?: boolean;
  threshold?: number;
}

export function InfiniteScroll({
  children,
  onLoadMore,
  hasMore,
  loading = false,
  threshold = 0.8,
}: InfiniteScrollProps) {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      {
        threshold,
        rootMargin: "0px 0px 100px 0px", // Commence 100px avant le bas
      }
    );

    observer.observe(target);

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [hasMore, loading, onLoadMore, threshold]);

  return (
    <div className="space-y-3">
      {children}

      {/* Trigger invisible pour l'Intersection Observer */}
      <div ref={observerTarget} className="h-4" />

      {/* Skeleton de chargement */}
      {loading && hasMore && (
        <div className="space-y-3 py-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
          <p className="text-center text-sm text-muted-foreground">
            Chargement...
          </p>
        </div>
      )}

      {/* Message fin de liste */}
      {!hasMore && !loading && (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Tous les trajets ont été chargés
        </p>
      )}
    </div>
  );
}
