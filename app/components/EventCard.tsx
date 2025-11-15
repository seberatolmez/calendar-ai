

import { cn } from "@/lib/utils";
import { COLORS } from "../types/colors";

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  // ISO date (YYYY-MM-DD) for the event day. Optional for demo/test events.
  date?: string;
  colorId: string // between 1-11
  description?: string;
}

interface EventCardProps {
  event: CalendarEvent;
  onClick?: () => void;
}

export default function EventCard({ event, onClick }: EventCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "p-2 rounded-lg border-l-4 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md text-background bg-[${COLORS[event.colorId]}]",
        `bg-[${COLORS[event.colorId]}]`,        
      )}
    >
      <div className="font-medium text-sm truncate">{event.title}</div>
      <div className="text-xs opacity-75 mt-1">
        {event.startTime} - {event.endTime}
      </div>
    </div>
  );
}
