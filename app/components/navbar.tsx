"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { handleSignOut } from "@/app/service/auth.service";
import { LogOutIcon } from "lucide-react";
import Image from "next/image";

export function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <nav className="sticky top-0 z-30 flex w-full items-center justify-between gap-4 bg-background/95 px-8 py-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Image
        src="/garbi-logo-copy.png"
        alt="Garbi Logo"
        width={120}
        height={25}
        className="object-contain w-auto cursor-pointer"
        onClick={() => router.push("/")}
      />

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

