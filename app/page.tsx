"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { handleSignOut } from "./service/auth.service";
import { useEffect, useState } from "react";
import { LogOutIcon } from "lucide-react";
import Image from "next/image";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputSubmit,
} from "@/components/ui/shadcn-io/ai/prompt-input";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const developerEmail = process.env.NEXT_PUBLIC_DEVELOPER_EMAIL;

  useEffect(() => {
    if (!session) {
      router.push("/login");
    }
  }, [session, router]);

  useEffect(() => {
    if (session?.accessToken) {
      setLoading(true);
      fetch("/api/calendar/list?maxResults=10")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setEvents(data.events);
            setError(null);
          } else {
            setError(data.error);
          }
        })
        .catch(() => setError("Failed to load events"))
        .finally(() => setLoading(false));
    }
  }, [session?.accessToken]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navbar */}
      <nav className="flex items-center justify-between w-full px-8 py-2 fixed top-0 left-0 bg-background/90 backdrop-blur-md shadow-sm">
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
            className="bg-[#6F55FF] hover:bg-[#5d46e0] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
            onClick={() => window.open("https://calendar.google.com")}
          >
            Go to Calendar
          </button>
          <button
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
            onClick={handleSignOut}
            disabled={!session}
          >
            <LogOutIcon size={16} />
            {session ? "Sign Out" : "Signing Out..."}
          </button>
        </div>
      </nav>

      {/* Main */}
      <main className="flex flex-col items-center w-full max-w-3xl mx-auto mt-32 px-6 flex-grow">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back{session?.user?.name ? `, ${session.user.name}` : ""} 👋
          </h1>
          <p className="text-gray-400 text-sm">
            Here are your upcoming events synced from Google Calendar.
          </p>
        </div>

        <section className="flex flex-col w-full max-h-[60vh] overflow-y-auto gap-3">
          {loading && (
            <p className="text-gray-400 text-center">Loading events...</p>
          )}
          {error && <p className="text-red-500 text-center">{error}</p>}
          {!loading && !error && events.length === 0 && (
            <p className="text-gray-400 text-center">No upcoming events.</p>
          )}
          {!loading && events.length > 0 && (
            <ul className="space-y-3">
              {events.map((event) => (
                <li
                  key={event.id}
                  className="p-4 bg-gray-900/70 border border-gray-800 rounded-xl hover:bg-gray-900 transition-all"
                >
                  <div className="font-semibold text-white">
                    {event.summary}
                  </div>
                  {event.start?.dateTime && (
                    <div className="text-sm text-gray-400 mt-1">
                      {new Date(event.start.dateTime).toLocaleString()}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
      </section>
      <section className="w-full mt-10">
        <div className="rounded-xl bg-muted/20 shadow-sm">

        <PromptInput onSubmit={() => {}}>
          <PromptInputTextarea
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            placeholder="Type your message..."
          />
          <PromptInputToolbar>
            <PromptInputSubmit disabled={!input.trim()} />
          </PromptInputToolbar>
           </PromptInput>
      
          </div>  
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center border-t mt-8">
        <p className="text-sm text-gray-500">
          Built by{" "}
          <a
            href={`mailto:${developerEmail}`}
            className="text-[#6F55FF] font-semibold hover:text-[#5d46e0]"
            target="_blank"
          >
            Berat Ölmez
          </a>
        </p>
      </footer>
    </div>
  );
}
