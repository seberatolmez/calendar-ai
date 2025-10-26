// auth service for google calendar api using oauth2 flow

import {signIn, signOut} from "next-auth/react";

export const handleSignIn = () => signIn("google");
export const handleSignOut = () => signOut();