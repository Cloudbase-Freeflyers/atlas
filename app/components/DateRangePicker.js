"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useFilters } from "../lib/FiltersContext";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

export default function DateRangePicker({ className }) {
  const { dateTimePeriod, setDateTimePeriod } = useFilters();

  return (
    <div className={cn("tw:grid tw:gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "tw:w-[260px] tw:justify-start tw:text-left tw:font-normal tw:h-9 tw:bg-white/10 tw:border-white/20 tw:text-white tw:hover:bg-white/20",
              !dateTimePeriod && "tw:text-muted-foreground"
            )}
          >
            <CalendarIcon className="tw:mr-2 tw:h-4 tw:w-4" />
            {dateTimePeriod?.startDate ? (
              dateTimePeriod.endDate ? (
                <>
                  {format(dateTimePeriod.startDate, "LLL dd, y")} -{" "}
                  {format(dateTimePeriod.endDate, "LLL dd, y")}
                </>
              ) : (
                format(dateTimePeriod.startDate, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="tw:w-auto tw:p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateTimePeriod?.startDate}
            selected={{
              from: dateTimePeriod?.startDate,
              to: dateTimePeriod?.endDate,
            }}
            onSelect={(range) => {
              setDateTimePeriod({
                startDate: range?.from,
                endDate: range?.to,
              });
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
