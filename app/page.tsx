"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { handleSignOut } from "./service/auth.service";
import { useEffect, useState } from "react";
import { LogOutIcon } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const developerEmail = process.env.NEXT_PUBLIC_DEVELOPER_EMAIL;

  useEffect(() => {
    if (!session || session === null) {
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
        .catch((err) => {
          console.error("Failed to fetch events:", err);
          setError("Failed to load events");
        })
        .finally(() => setLoading(false));
    }
  }, [session?.accessToken]);

  return (
    <div className="min-h-screen flex flex-col items-center bg-foreground text-background">
      <div className="flex flex-row items-center justify-between w-full px-6 py-3 fixed top-0 left-0 shadow-md">
        <Image 
        src="/garbi-logo.png" 
        alt="logo"
        width= {120}
        height={30}
        />

        <div className="flex flex-row items-center gap-4">
        
        <button
            className="bg-[#6F55FF] hover:bg-[#5d46e0] text-white px-3 py-2 rounded-md flex items-center gap-2 cursor-pointer text-sm"
            onClick={() => { window.open('https://calendar.google.com')}}
        >
          Go to Calendar   
        </button>
        <button
          className="bg-red-500 text-white px-3 py-2 rounded-md flex items-center gap-2 cursor-pointer text-sm"
          onClick={handleSignOut}
          disabled={!session || session === null}
        >
          <LogOutIcon size={18}/>
          {!session || session === null ? "Signing Out..." : "Sign Out"}
        </button>

        </div>
        </div>
        
      <main className="flex flex-col items-center w-full max-w-2xl mt-24 px-4 flex-grow">
        <h1>Welcome back, {session?.user?.name}</h1>
        <h2 className="text-xl font-bold mb-4 mt-6">Upcoming Events</h2>

        <section className="flex flex-col max-h-[60vh] overflow-y-auto w-full gap-2">
          {loading && <p>Loading events...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && events.length === 0 && (
            <p>No upcoming events</p>
          )}
          {!loading && events.length > 0 && (
            <ul className="space-y-2">
              {events.map((event) => (
                <li key={event.id} className="p-3 bg-gray-800 rounded">
                  <div className="font-semibold">{event.summary}</div>
                  {event.start?.dateTime && (
                    <div className="text-sm text-gray-400">
                      {new Date(event.start.dateTime).toLocaleString()}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="py-4 text-center">
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
