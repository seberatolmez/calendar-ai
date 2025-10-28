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



