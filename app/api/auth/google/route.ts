// OAuth2 flow for Google Calendar API
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.CLIENT_ID!,
            clientSecret: process.env.CLIENT_SECRET!,
        })
    ],
    secret: process.env.NEXT_AUTH_SECRET!,
};

const handler = NextAuth(authOptions);
export {handler as GET, handler as POST};