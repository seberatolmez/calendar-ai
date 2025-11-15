'use client'

import { useState, useEffect } from "react";
import CalendarHeader, { CalendarView } from "@/app/components/CalendarHeader";
import CalendarGrid from "@/app/components/CalendarGrid";
import { CalendarEvent } from "@/app/components/EventCard";
import { transformGoogleEventsToCalendarEvents } from "@/app/utils/calendar.utils";

export default function TimelinePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("week");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch("/api/calendar/list?maxResults=50", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch events");
        }

        if (data.success && data.events) {
          const transformedEvents = transformGoogleEventsToCalendarEvents(data.events);
          setEvents(transformedEvents);
          console.log("Fetched events:", transformedEvents); // logging fetched events 
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleEventClick = (event: CalendarEvent) => {
    console.log("Event clicked:", event);
    // TODO: implement opening event details model
  };

  return (
    <div className="h-screen pl-8 pr-8 flex flex-col bg-background">
      <CalendarHeader 
        currentDate={currentDate} 
        onDateChange={setCurrentDate}
        view={view}
        onViewChange={setView}
      />
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-destructive">Error: {error}</p>
        </div>
      ) : (
        <CalendarGrid
          currentDate={currentDate}
          events={events}
          onEventClick={handleEventClick}
          view={view}
        />
      )}
    </div>
  );
}
