"use client";
import { useEffect } from "react";
import { handleSignIn } from "@/app/service/auth.service";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="flex row items-center gap-4">
        <Image 
        src="/google-calendar-logo.png" 
        alt="Google Calendar Logo" 
        width={100} 
        height={100} />

        <Image 
        src="/gemini-logo.png" 
        alt="Gemini Logo" 
        width={90} 
        height={90}
       />
        </div>
      <div className="rounded-2xl px-10 py-12 flex flex-col items-center space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold text-gray-800">
            Welcome to Cal-AI
          </h1>
          <p className="text-gray-500 text-sm">
            Welcome back! Please log in to continue.
          </p>
        </div>

        {session ? (
          <button
            onClick={() => router.push("/")}
            className="flex items-center justify-center w-full gap-3 bg-[#6F55FF] hover:bg-[#5d46e0] text-white text-base font-medium px-7 py-3 rounded-lg shadow-md transition-all duration-200 cursor-pointer"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleSignIn}
            className="flex items-center justify-center w-full gap-3 bg-[#6F55FF] hover:bg-[#5d46e0] text-white text-base font-medium px-7 py-3 rounded-lg shadow-md transition-all duration-200 cursor-pointer"
          >
            <img
              loading="lazy"
              height="24"
              width="24"
              id="provider-logo-dark"
              src="https://authjs.dev/img/providers/google.svg"
              alt="Google logo"
            />
            <span>Sign in with Google</span>
          </button>
        )}

        <p className="text-gray-400 text-md pt-4">
          Powered by{" "}
          <a
            href="https://gemini.google.com/app"
            className="text-[#6F55FF] text-lg font-bold"
            target="_blank"
          >
            Gemini
          </a>
        </p>
      </div>
    </div>
  );
}
