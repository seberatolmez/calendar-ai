'use client'

import { useState } from "react";
import CalendarHeader, { CalendarView } from "@/app/components/CalendarHeader";
import CalendarGrid from "@/app/components/CalendarGrid";
import { CalendarEvent } from "@/app/components/EventCard";

// Sample events for testing
const sampleEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Team Standup",
    startTime: "09:00",
    endTime: "09:30",
    color: "primary",
    description: "Daily team sync",
  },
  {
    id: "2",
    title: "Design Review",
    startTime: "11:00",
    endTime: "12:00",
    color: "secondary",
    description: "Review new mockups",
  },
  {
    id: "3",
    title: "Lunch Break",
    startTime: "13:00",
    endTime: "14:00",
    color: "success",
    description: "Time to recharge",
  },
  {
    id: "4",
    title: "Client Meeting",
    startTime: "15:00",
    endTime: "16:00",
    color: "warning",
    description: "Quarterly review",
  },
];

export default function TimelinePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("week");
  const [events] = useState<CalendarEvent[]>(sampleEvents);

  const handleEventClick = (event: CalendarEvent) => {
    console.log("Event clicked:", event);
    // You can add more functionality here, like opening a modal
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <CalendarHeader 
        currentDate={currentDate} 
        onDateChange={setCurrentDate}
        view={view}
        onViewChange={setView}
      />
      <CalendarGrid
        currentDate={currentDate}
        events={events}
        onEventClick={handleEventClick}
        view={view}
      />
    </div>
  );
}
