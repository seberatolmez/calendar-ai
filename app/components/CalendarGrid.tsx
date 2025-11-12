
import { format, addDays, startOfWeek, isSameDay, startOfYear, addMonths, getDaysInMonth, startOfMonth } from "date-fns";
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

  if (view === "year") {
    return <YearView currentDate={currentDate} events={events} onEventClick={onEventClick} today={today} />;
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
      return isSameDay(targetDate, currentDate) && eventHour === hour;
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
                  isToday && "bg-primary/5"
                )}
              >
                <div className="text-sm font-medium text-muted-foreground">
                  {format(date, "EEE")}
                </div>
                <div
                  className={cn(
                    "text-2xl font-semibold mt-1",
                    isToday
                      ? "text-primary"
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
                      isToday && "bg-primary/5"
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
      return isSameDay(currentDate, currentDate) && eventHour === hour;
    });
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="min-w-[600px]">
        {/* Day header */}
        <div className="grid grid-cols-2 border-b border-border sticky top-0 bg-card z-10">
          <div className="p-4 text-sm font-medium text-muted-foreground">Time</div>
          <div className={cn("p-4 text-center border-l border-border", isToday && "bg-primary/5")}>
            <div className="text-sm font-medium text-muted-foreground">
              {format(currentDate, "EEEE")}
            </div>
            <div className={cn("text-2xl font-semibold mt-1", isToday ? "text-primary" : "text-foreground")}>
              {format(currentDate, "d")}
            </div>
          </div>
        </div>

        {/* Time grid */}
        <div className="relative">
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-2 border-b border-border min-h-[80px]">
              <div className="p-4 text-sm text-calendar-time font-medium">
                {format(new Date().setHours(hour, 0), "HH:mm")}
              </div>
              <div className={cn("p-2 border-l border-border transition-colors hover:bg-calendar-grid/50", isToday && "bg-primary/5")}>
                <div className="space-y-1">
                  {getEventsForHour(hour).map((event) => (
                    <EventCard key={event.id} event={event} onClick={() => onEventClick?.(event)} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Year View Component
function YearView({ currentDate, events, onEventClick, today }: { currentDate: Date; events: CalendarEvent[]; onEventClick?: (event: CalendarEvent) => void; today: Date }) {
  const yearStart = startOfYear(currentDate);
  const months = Array.from({ length: 12 }, (_, i) => addMonths(yearStart, i));

  const getEventsForMonth = (month: Date) => {
    return events.filter(event => 
      isSameDay(month, currentDate)
    ).length;
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {months.map((month) => (
          <MonthMiniCalendar
            key={month.toISOString()}
            month={month}
            currentDate={currentDate}
            today={today}
            eventCount={getEventsForMonth(month)}
          />
        ))}
      </div>
    </div>
  );
}

// Mini Month Calendar for Year View
function MonthMiniCalendar({ month, currentDate, today, eventCount }: { month: Date; currentDate: Date; today: Date; eventCount: number }) {
  const monthStart = startOfMonth(month);
  const daysInMonth = getDaysInMonth(month);
  const startDay = monthStart.getDay();
  const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: adjustedStartDay }, (_, i) => i);

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-lg font-semibold text-foreground mb-3">
        {format(month, "MMMM")}
      </h3>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
          <div key={i} className="text-xs text-muted-foreground text-center font-medium">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {emptyDays.map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {days.map((day) => {
          const date = new Date(month.getFullYear(), month.getMonth(), day);
          const isToday = isSameDay(date, today);
          const isSelected = isSameDay(date, currentDate);
          
          return (
            <div
              key={day}
              className={cn(
                "aspect-square flex items-center justify-center text-sm rounded-md transition-colors",
                isToday && "bg-primary text-primary-foreground font-semibold",
                isSelected && !isToday && "bg-accent text-accent-foreground",
                !isToday && !isSelected && "text-foreground hover:bg-muted"
              )}
            >
              {day}
            </div>
          );
        })}
      </div>
      {eventCount > 0 && (
        <div className="mt-3 text-xs text-muted-foreground">
          {eventCount} event{eventCount !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
