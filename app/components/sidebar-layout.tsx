"use client";

import { useSession } from "next-auth/react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
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
      <SidebarRail />
      <SidebarInset>
        <SidebarTrigger className= "text-muted-foreground transition hover:text-foreground"/>
        <main className="flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

