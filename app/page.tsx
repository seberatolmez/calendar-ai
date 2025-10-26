// main dashboard page for cal-ai; chatbot box, results preview of events before applying to calendar, apply to calendar and more.
"use client";
import {handleSignIn,handleSignOut} from "@/app/service/auth.service";
import { useSession } from "next-auth/react";

export default function Home() {
  const {data: session} = useSession();
  console.log(session);
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1>Home</h1>
      {session ? (
        <button onClick={handleSignOut} 
        className="bg-red-500 text-white px-4 py-2 rounded-md">
          Sign Out
        </button>
      ) : (
        <button onClick={handleSignIn} 
        className="bg-blue-500 text-white px-4 py-2 rounded-md">
          Sign in with Google
        </button>
      )}
    </div>
  );
}