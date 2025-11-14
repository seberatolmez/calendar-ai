
import { addDays, format, getDaysInMonth, isSameDay, startOfMonth, startOfWeek } from "date-fns";
import EventCard, { CalendarEvent } from "./EventCard";
import { cn } from "@/lib/utils";
import { CalendarView } from "./CalendarHeader";

interface CalendarGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  view: CalendarView;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const WEEK_DAYS = Array.from({ length: 7 }, (_, i) => i);

export default function CalendarGrid({ currentDate, events, onEventClick, view }: CalendarGridProps) {
  const today = new Date();

  if (view === "day") {
    return <DayView currentDate={currentDate} events={events} onEventClick={onEventClick} today={today} />;
  }

  if (view === "month") {
    return <MonthView currentDate={currentDate} events={events} onEventClick={onEventClick} today={today} />;
  }

  return <WeekView currentDate={currentDate} events={events} onEventClick={onEventClick} today={today} />;
}

// Week View Component
function WeekView({ currentDate, events, onEventClick, today }: { currentDate: Date; events: CalendarEvent[]; onEventClick?: (event: CalendarEvent) => void; today: Date }) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const HOURS = Array.from({ length: 24 }, (_, i) => i);
  const WEEK_DAYS = Array.from({ length: 7 }, (_, i) => i);

  const getEventsForDayAndHour = (day: number, hour: number) => {
    const targetDate = addDays(weekStart, day);
    return events.filter(event => {
      const [eventHour] = event.startTime.split(":").map(Number);
      // If the event has a date field (ISO YYYY-MM-DD), compare it to the targetDate.
      if (event.date) {
        const eventDate = new Date(event.date + "T00:00:00");
        return isSameDay(eventDate, targetDate) && eventHour === hour;
      }
      // Fallback: if no date provided, assume events belong to the currently selected date.
      return isSameDay(currentDate, targetDate) && eventHour === hour;
    });
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="min-w-[800px]">
        {/* Days header */}
        <div className="grid grid-cols-8 border-b border-border sticky top-0 bg-card z-10">
          <div className="p-4 text-sm font-medium text-muted-foreground">Time</div>
          {WEEK_DAYS.map((day) => {
            const date = addDays(weekStart, day);
            const isToday = isSameDay(date, today);
            return (
              <div
                key={day}
                className={cn(
                  "p-4 text-center border-l border-border",
                  isToday && "bg-blue-500/5"
                )}
              >
                <div className="text-sm font-medium text-muted-foreground">
                  {format(date, "EEE")}
                </div>
                <div
                  className={cn(
                    "text-2xl font-semibold mt-1",
                    isToday
                      ? "text-blue-600"
                      : "text-foreground"
                  )}
                >
                  {format(date, "d")}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div className="relative">
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-border min-h-[80px]">
              <div className="p-4 text-sm text-calendar-time font-medium">
                {format(new Date().setHours(hour, 0), "HH:mm")}
              </div>
              {WEEK_DAYS.map((day) => {
                const date = addDays(weekStart, day);
                const isToday = isSameDay(date, today);
                const dayEvents = getEventsForDayAndHour(day, hour);
                
                return (
                  <div
                    key={`${day}-${hour}`}
                    className={cn(
                      "p-2 border-l border-border transition-colors hover:bg-calendar-grid/50",
                      isToday && "bg-blue-500/5"
                    )}
                  >
                    <div className="space-y-1">
                      {dayEvents.map((event) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          onClick={() => onEventClick?.(event)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Day View Component
function DayView({ currentDate, events, onEventClick, today }: { currentDate: Date; events: CalendarEvent[]; onEventClick?: (event: CalendarEvent) => void; today: Date }) {
  const HOURS = Array.from({ length: 24 }, (_, i) => i);
  const isToday = isSameDay(currentDate, today);

  const getEventsForHour = (hour: number) => {
    return events.filter(event => {
      const [eventHour] = event.startTime.split(":").map(Number);
      // If event has a date, compare event date with currentDate; otherwise treat it as belonging to currentDate
      if (event.date) {
        const eventDate = new Date(event.date + "T00:00:00");
        return isSameDay(eventDate, currentDate) && eventHour === hour;
      }
      return eventHour === hour;
    });
  };

  return (
  <div className="flex-1 overflow-auto">
  <div className="min-w-[600px] grid grid-cols-[150px_1fr]">

    {/* HEADER */}
    <div className="col-span-2 grid grid-cols-[150px_1fr] border-b border-border sticky top-0 bg-card z-10">
      <div className="p-4 text-sm font-medium text-muted-foreground">Time</div>
      <div className={cn(
        "p-4 text-center border-l border-border",
        isToday && "bg-blue-500/5"
      )}>
        <div className="text-sm font-medium text-muted-foreground">
          {format(currentDate, "EEEE")}
        </div>
        <div className={cn(
          "text-2xl font-semibold mt-1",
          isToday ? "text-primary" : "text-foreground"
        )}>
          {format(currentDate, "d")}
        </div>
      </div>
    </div>

    {/* ROWS */}
    {HOURS.map((hour) => (
      <div
        key={hour}
        className="col-span-2 grid grid-cols-[150px_1fr] border-b border-border min-h-[80px]"
      >
        <div className="p-4 text-sm text-calendar-time font-medium">
          {format(new Date().setHours(hour, 0), "HH:mm")}
        </div>

        <div
          className={cn(
            "p-2 border-l border-border transition-colors hover:bg-calendar-grid/50",
            isToday && "bg-blue-500/5"
          )}
        >
          <div className="space-y-1">
            {getEventsForHour(hour).map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => onEventClick?.(event)}
              />
            ))}
          </div>
        </div>
      </div>
    ))}

  </div>
</div>
);

}

// Month View Component
function MonthView({currentDate,events,onEventClick, today}: 
    {currentDate: Date; events: CalendarEvent[]; onEventClick?: (event: CalendarEvent) => void; today: Date}) {

   const monthStart = startOfMonth(currentDate);
   const daysInMonth = getDaysInMonth(monthStart);
   const startDay = monthStart.getDay(); 
   const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;
   
   const totalCells = 42; // 6 weeks * 7 days
   const emptyDays = Array.from({ length: adjustedStartDay }, (_, i) => i);
   const monthDays = Array.from({ length: daysInMonth}, (_, i) => i + 1);
   const trailingDays = totalCells - emptyDays.length - monthDays.length;

   const getEventsForDay = (date: Date)=> {
     return events.filter(event => {
       if (event.date) {
      const eventDate = new Date(event.date + "T00:00:00");
      return isSameDay(eventDate, date);
       }
       // fallback: if no date set, only show on the currently selected date
       return isSameDay(date, currentDate);
     });
   };

   const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-7xl mx-auto">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekdays.map((day) => (
            <div key={day} className="text-sm font-semibold text-muted-foreground text-center p-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {emptyDays.map((_, i) => (
            <div key={`empty-${i}`} className="bg-muted/30 rounded-lg min-h-[120px]" />
          ))}
          {monthDays.map((day) => {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const isToday = isSameDay(date, today);
            const dayEvents = getEventsForDay(date);
            
            return (
              <div
                key={day}
                className={cn(
                  "bg-card border border-border rounded-lg p-3 min-h-[120px] transition-colors hover:border-primary/50",
                  isToday && "border-primary bg-primary/5"
                )}
              >
                <div className={cn(
                  "text-sm font-semibold mb-2",
                  isToday ? "text-primary" : "text-foreground"
                )}>
                  {day}
                </div>
                <div className="space-y-1">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => onEventClick?.(event)}
                      className={cn(
                        "text-xs p-1 rounded cursor-pointer transition-all hover:scale-105",
                        `bg-calendar`,
                        "text-white font-medium truncate"
                      )}
                    >
                      {event.startTime} {event.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {trailingDays > 0 && Array.from({ length: trailingDays }, (_, i) => (
            <div key={`trailing-${i}`} className="bg-muted/30 rounded-lg min-h-[120px]" />
          ))}
        </div>
      </div>
    </div>
  );


}
