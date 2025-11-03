/**
 * Dashboard Layout
 *
 * Main layout for dashboard with sidebar and header
 * Mobile-first responsive design with hybrid navigation
 * Includes PWA features: offline indicator and install prompt
 */

import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentUserProfile } from "@/lib/auth/server";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { OfflineIndicator } from "@/components/offline/offline-indicator";
import { InstallPrompt } from "@/components/pwa/install-prompt";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const profile = await getCurrentUserProfile();
  if (!profile || !profile.is_active) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Indicateur de connexion offline et synchronisation */}
      <OfflineIndicator />

      {/* Prompt d'installation PWA */}
      <InstallPrompt />

      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <Sidebar userProfile={profile} />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <Header user={user} userProfile={profile} />

        {/* Page Content */}
        <main className="p-4 pb-24 sm:p-6 sm:pb-24 lg:pb-6">{children}</main>
      </div>

      {/* Bottom Navigation - Mobile only */}
      <BottomNav userRole={profile.role} />
    </div>
  );
}
