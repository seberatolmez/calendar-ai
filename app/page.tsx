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
import { Loader } from "@/components/ui/shadcn-io/ai/loader";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const developerEmail = process.env.NEXT_PUBLIC_DEVELOPER_EMAIL;
  let data: any = null;

  useEffect(() => {
    if (!session) {
      router.push("/login");
    }
  }, [session, router]);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/handle-user-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input.trim() }),
      });

      data = await response.json().catch(() => null);
      if (!response.ok) {
        setError((data && data.error) || "Failed to submit prompt");
        return;
      }

      // Handle different response types
      if (data.type === "events") {
        console.log("Events:", data.events);
        setEvents((prev) => [...prev, ...data.events]);
      } else if (data.type === "event") {
        console.log("Event:", data.event);
        setEvents((prev) => [...prev, data.event]);
      } else if (data.type === "success") {
        console.log("Success:", data.message);
      } else if (data.type === "text") {
        console.log("Message:", data.message);
      } else if (data.type === "disambiguation") {
        console.log("Disambiguation needed:", data.candidates);
        setError(`Multiple matches found. Please be more specific. Found ${data.candidates.length} events.`);
      }

      // Clear input after successful submission
      setInput("");


    } catch (err) {
      console.error("Error submitting prompt:", err);
      setError("Unexpected error while submitting prompt");
    } finally {
      setLoading(false);
    }
  }

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

      {/* Main */}
      <main className="flex flex-col items-center w-full max-w-3xl mx-auto mt-32 px-6 flex-grow">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back{session?.user?.name ? `, ${session.user.name}` : ""} 👋
          </h1>
           
      <section className="w-full mt-10">
        <div className="rounded-xl bg-muted/20 shadow-sm">

       { loading ?  
          <div className="flex flex-col items-center justify-center p-4">
            <Loader size={18}/> 
            <p className="text-gray-400 text-center">Processing your request...</p>
          </div> : null
          } 

        <PromptInput onSubmit={() => {}}>
          <PromptInputTextarea
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            placeholder="Type what you want to do with garbi..."
          />
          <PromptInputToolbar>
            <PromptInputSubmit
              disabled={!input.trim() || loading}
              onClick={handleSubmit}
            />
          </PromptInputToolbar>
           </PromptInput>
            
           {error && (
             <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
               {error}
             </div>
           )}

           
             <div className="mt-4 p-4">
               <pre className="text-xs overflow-auto">
                 {
                  typeof data === 'string' ? data : JSON.stringify(data, null, 2)
                 }
               </pre>
             </div>
           

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
