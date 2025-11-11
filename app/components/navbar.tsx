"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { handleSignOut } from "@/app/service/auth.service";
import { LogOutIcon } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Map routes to page names
  const getPageName = () => {
    if (pathname === "/timeline") return "Timeline";
    if (pathname === "/garbi" || pathname === "/") return "Ask AI";
    // Add more mappings as needed
    return "Ask AI"; // default
  };

  const pageName = getPageName();

  return (
    <nav className="sticky top-0 z-30 flex w-full items-center justify-between gap-4 bg-background/95 px-8 py-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground transition hover:text-foreground" />
        <span className="text-[#6F55FF] font-medium">#</span>
        <span className="font-medium">{pageName}</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="bg-[#6F55FF] hover:bg-[#5d46e0] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
          onClick={() => window.open("https://calendar.google.com")}
        >
          Go to Calendar
        </button>
        <button
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
          onClick={handleSignOut}
          disabled={!session}
        >
          <LogOutIcon size={16} />
          {session ? "Sign Out" : "Signing Out..."}
        </button>
      </div>
    </nav>
  );
}

