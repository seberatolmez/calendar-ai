"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
export default function Home() {
    const {data: session} = useSession();
    const router = useRouter();
    if(!session || session === null) {
        router.push("/login");
    }
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1>Home</h1>
            <p>Welcome to the home page</p>
            <h1>session: {JSON.stringify(session)}</h1>
        </div>
    )
}