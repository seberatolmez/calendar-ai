"use client";

import { useSession } from "next-auth/react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { Navbar } from "./navbar";

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
        <Navbar />
        <main className="flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

