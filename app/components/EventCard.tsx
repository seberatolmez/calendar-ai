

import { cn } from "@/lib/utils";

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  color: "primary" | "secondary" | "success" | "warning";
  description?: string;
}

interface EventCardProps {
  event: CalendarEvent;
  onClick?: () => void;
}

const colorClasses = {
  primary: "bg-calendar-event-primary/10 border-calendar-event-primary text-calendar-event-primary",
  secondary: "bg-calendar-event-secondary/10 border-calendar-event-secondary text-calendar-event-secondary",
  success: "bg-calendar-event-success/10 border-calendar-event-success text-calendar-event-success",
  warning: "bg-calendar-event-warning/10 border-calendar-event-warning text-calendar-event-warning",
};

export default function EventCard({ event, onClick }: EventCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "p-2 rounded-lg border-l-4 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md",
        colorClasses[event.color]
      )}
    >
      <div className="font-medium text-sm truncate">{event.title}</div>
      <div className="text-xs opacity-75 mt-1">
        {event.startTime} - {event.endTime}
      </div>
    </div>
  );
}
