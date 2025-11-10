"use client";

import { useSession } from "next-auth/react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const { data: session, status } = useSession();

  // auth check
  if (status === "loading") { // loading state
    return <>{children}</>;
  }

  if (!session) {
    // No sidebar
    return <>{children}</>;
  }

  // Show sidebar when authenticated
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

