

import { cn } from "@/lib/utils";
import { COLORS } from "../types/colors";

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  // ISO date (YYYY-MM-DD) for the event day. Optional for demo/test events.
  date?: string;
  color: string // between 1-11
  description?: string;
}

interface EventCardProps {
  event: CalendarEvent;
  onClick?: () => void;
}

const colorClasses: Record<string, string> = {
  "1": COLORS[1].hex,
  "2": COLORS[2].hex,
  "3": COLORS[3].hex,
  "4": COLORS[4].hex,
  "5": COLORS[5].hex,
  "6": COLORS[6].hex,
  "7": COLORS[7].hex,
  "8": COLORS[8].hex,
  "9": COLORS[9].hex,
  "10": COLORS[10].hex,
  "11": COLORS[11].hex,
}

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
