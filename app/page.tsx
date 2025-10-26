"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { handleSignOut } from "./service/auth.service";
import { useEffect } from "react";
import { LogOutIcon } from "lucide-react";
export default function Home() {
    const {data: session} = useSession();
    const router = useRouter();

    useEffect(() => {
        if(!session || session === null) {
            router.push("/login");
        }
    }, [session, router]);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-foreground text-background gap-4">
            <h1>Home</h1>
            <p>Welcome to the home page</p>
            <h1> Welcome back, {(session?.user?.name)}</h1>
            <button className="bg-red-500 text-white px-4 py-2 rounded-md flex items-center gap-2" 
            onClick={handleSignOut}
            disabled={!session || session === null}
            >
                <LogOutIcon />
                Sign Out
            </button>
        </div>
    )
}