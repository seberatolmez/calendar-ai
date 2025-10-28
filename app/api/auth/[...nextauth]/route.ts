import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
      authorization: {
        params: {
          scopes: ['http://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events',
          ], 
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({token, account}) {
      if
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };