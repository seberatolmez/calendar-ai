import nextAuth from 'next-auth';

//auth types

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    error?: string;
  }
}
  

  declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
  }
}

 interface CalendarEvent  {
    summary: string;
    location: string;
    description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  recurrence: string[];
  attendees: {email: string}[];
  reminders: {
    useDefault: boolean;
    overrides: {method: string; minutes: number}[];
  };
};

interface ParsedEvent { // parsed event from prompt by ai model
  summary: string;
  location: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  recurrence: string[];
  attendees: {email: string}[];
  reminders: {
    useDefault: boolean;
    overrides: {method: string; minutes: number}[];
  };
};

interface UserPrompt { 
  prompt: string;
};

interface APIResponse { 
  response: string;
};



