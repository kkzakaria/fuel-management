import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Badge, badgeVariants } from "@/components/ui/badge"

/**
 * Variantes de couleurs personnalisées pour les badges de statut
 */
export type StatusVariant = "success" | "info" | "warning" | VariantProps<typeof badgeVariants>["variant"]

const statusVariantStyles: Record<string, string> = {
  success: "bg-green-600 text-white hover:bg-green-700 border-transparent",
  info: "bg-blue-600 text-white hover:bg-blue-700 border-transparent",
  warning: "bg-yellow-600 text-white hover:bg-yellow-700 border-transparent",
}

/**
 * Composant StatusBadge
 * Wrapper autour du Badge Shadcn UI avec des variantes de couleurs personnalisées
 */
interface StatusBadgeProps extends Omit<React.ComponentProps<typeof Badge>, "variant"> {
  variant?: StatusVariant
}

export function StatusBadge({ variant = "default", className, ...props }: StatusBadgeProps) {
  // Si c'est une variante personnalisée, utiliser les styles personnalisés
  const customStyle = variant && statusVariantStyles[variant as string]

  return (
    <Badge
      variant={customStyle ? undefined : (variant as VariantProps<typeof badgeVariants>["variant"])}
      className={cn(customStyle, className)}
      {...props}
    />
  )
}
