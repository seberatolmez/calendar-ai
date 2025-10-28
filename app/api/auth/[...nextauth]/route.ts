import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import type { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {

    async jwt({token, account}: {token: any, account: any}) {
      // Initial sign in - store tokens
      if(account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at ? account.expires_at * 1000 : Date.now() + 3600 * 1000;
        return token;
      }

      // Token is still valid
      if(token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Token has expired, refresh it
      return await refreshAccessToken(token);
    },

  async session({session, token}: {session: any, token: any}) {
    session.accessToken = token.accessToken;
    session.error = token.error as string | undefined;
    return session;
  }
},
};

async function refreshAccessToken(token: any) {
  try {
    const url = 'https://oauth2.googleapis.com/token';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.CLIENT_ID!,
        client_secret: process.env.CLIENT_SECRET!,
        grant_type: 'refresh_token',  
        refresh_token: token.refreshToken as string,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      console.error('Token refresh failed:', refreshedTokens);
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + (refreshedTokens.expires_in * 1000),
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };

  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}


const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };