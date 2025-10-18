/**
 * Alert Badge Component
 *
 * Badge showing active alert count with dropdown
 */

"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAlerts } from "@/hooks/use-alerts";
import { AlertDropdown } from "./alert-dropdown";

export function AlertBadge() {
  const { alertCount, loading } = useAlerts({
    limit: 5,
    enabled: true,
    autoRefresh: true,
    refreshInterval: 60000, // Refresh every minute
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {!loading && alertCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 min-w-[1.25rem] rounded-full px-1 text-xs"
            >
              {alertCount > 99 ? "99+" : alertCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <AlertDropdown />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
