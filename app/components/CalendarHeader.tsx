

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import { format, addWeeks, subWeeks, addDays, subDays, addYears, subYears } from "date-fns";
import { cn } from "@/lib/utils";

export type CalendarView = "day" | "week" | "year";

interface CalendarHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
}

export default function CalendarHeader({ currentDate, onDateChange, view, onViewChange }: CalendarHeaderProps) {
  const handlePrev = () => {
    if (view === "day") {
      onDateChange(subDays(currentDate, 1));
    } else if (view === "week") {
      onDateChange(subWeeks(currentDate, 1));
    } else {
      onDateChange(subYears(currentDate, 1));
    }
  };
  
  const handleNext = () => {
    if (view === "day") {
      onDateChange(addDays(currentDate, 1));
    } else if (view === "week") {
      onDateChange(addWeeks(currentDate, 1));
    } else {
      onDateChange(addYears(currentDate, 1));
    }
  };
  
  const handleToday = () => {
    onDateChange(new Date());
  };

  const getDateDisplay = () => {
    if (view === "day") {
      return format(currentDate, "MMMM d, yyyy");
    } else if (view === "week") {
      return format(currentDate, "MMMM yyyy");
    } else {
      return format(currentDate, "yyyy");
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 border-b border-border bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("justify-start text-left font-normal")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {getDateDisplay()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={currentDate}
                onSelect={(date) => date && onDateChange(date)}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="transition-all hover:scale-105"
          >
            Today
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            className="transition-all hover:scale-110"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className="transition-all hover:scale-110"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Tabs value={view} onValueChange={(v) => onViewChange(v as CalendarView)}>
        <TabsList>
          <TabsTrigger value="day">Day</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="year">Year</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
