"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { handleSignOut } from "./service/auth.service";
import { useEffect } from "react";
import { LogOutIcon } from "lucide-react";
export default function Home() {
    const {data: session} = useSession();
    const router = useRouter();
    const developerEmail = process.env.NEXT_PUBLIC_DEVELOPER_EMAIL;

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
            <button className="bg-red-500 text-white px-4 py-2 rounded-md flex items-center gap-2 cursor-pointer" 
            onClick={handleSignOut}
            disabled={!session || session === null}
            >
                <LogOutIcon />
                Sign Out
            </button>
            <footer>
                <p className="text-sm text-gray-500">Built by  
                    <a href={`mailto:${developerEmail}`} 
                    className="text-[#6F55FF] font-semibold hover:text-[#5d46e0]" 
                    target="_blank"> Berat Ölmez</a></p>
            </footer>
        </div>
    
    )
}