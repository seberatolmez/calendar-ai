import NextAuth from 'next-auth/';
import GoogleProvider from 'next-auth/providers/google';
import type { NextAuthOptions } from 'next-auth/';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
      authorization: {
        params: {
          scopes: [
            'openid',
            'email',
            'profile',
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events',
          ].join(' '), 

          access_type: 'offline', // to get refresh token
          prompt: 'consent',
        }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {

    async jwt({token, account}: {token: any, account: any}) { // TODO: add tsconfig.json to allow implicity

      if(account) {
        token.accessToken= account.access_token;
        token.refreshToken= account.refresh_token;
        token.accessTokenExpires= account.expires_at ? account.expires_at * 1000 : null;
      }

      if(Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

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
    const response = await fetch(url,{
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

      const refreshedToken = await response.json();

      if(!response.ok) {
        throw new Error('Failed to refresh access token');
      }

      return {
        ...token,
        accessToken: refreshedToken.access_token,
        accessTokenExpires: Date.now() + refreshedToken.expires_in * 1000,

        refreshToken: refreshedToken.refresh_token ?? token.refreshToken,
      };

  } catch(error) {
    console.error('Error refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    }
  }
}


const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };