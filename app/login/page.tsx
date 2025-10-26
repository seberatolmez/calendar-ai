"use client";
import {handleSignIn,handleSignOut} from "@/app/service/auth.service";
import { useSession } from "next-auth/react";

export default function LoginPage() {
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
        className="flex items-center !bg-[#6F55FF] text-white px-4 py-2 rounded-md">
          <img loading="lazy" height="18" width="18" 
          id="provider-logo-dark" 
          src="https://authjs.dev/img/providers/google.svg"></img>
          <span className="ml-2">Sign in with Google</span>
        </button>
      )}
    </div>
  );
}