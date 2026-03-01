"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isSameDay,
  parseISO,
  differenceInMinutes,
  isToday,
} from "date-fns";
import {
  CaretLeft,
  CaretRight,
  CurrencyDollar,
  Clock,
  X,
  CalendarDots,
} from "@phosphor-icons/react";
import { cva } from "class-variance-authority";
import { PageShell } from "@/components/layout/PageShell";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import eventsData from "@/mocks/events.json";

/* ─── Types ─── */

type CalendarType = "work" | "personal" | "social" | "health";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  calendarType: CalendarType;
  predictedSpend: number;
  category: string;
}

/* ─── Constants ─── */

const HOUR_HEIGHT = 64; // px per hour slot
const VISIBLE_HOURS = { from: 7, to: 21 }; // 7am–9pm
const HOURS = Array.from(
  { length: VISIBLE_HOURS.to - VISIBLE_HOURS.from },
  (_, i) => i + VISIBLE_HOURS.from
);

const CALENDAR_TYPES: { key: CalendarType; label: string }[] = [
  { key: "work", label: "Work" },
  { key: "personal", label: "Personal" },
  { key: "social", label: "Social" },
  { key: "health", label: "Health" },
];

const CALENDAR_COLORS: Record<
  CalendarType,
  { bg: string; border: string; text: string; dot: string }
> = {
  work: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/25",
    text: "text-blue-400",
    dot: "bg-blue-500",
  },
  personal: {
    bg: "bg-zinc-400/10",
    border: "border-zinc-400/25",
    text: "text-zinc-300",
    dot: "bg-zinc-400",
  },
  social: {
    bg: "bg-violet-500/10",
    border: "border-violet-500/25",
    text: "text-violet-400",
    dot: "bg-violet-500",
  },
  health: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/25",
    text: "text-emerald-400",
    dot: "bg-emerald-500",
  },
};

/* ─── Event badge variants (inspired by big-calendar) ─── */

const eventCardVariants = cva(
  "absolute rounded-md border px-2 py-1.5 text-xs cursor-pointer select-none transition-all hover:brightness-125 hover:shadow-lg overflow-hidden",
  {
    variants: {
      color: {
        work: "border-blue-500/30 bg-blue-500/15 text-blue-300",
        personal: "border-zinc-500/30 bg-zinc-500/15 text-zinc-300",
        social: "border-violet-500/30 bg-violet-500/15 text-violet-300",
        health: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
      },
    },
    defaultVariants: {
      color: "work",
    },
  }
);

/* ─── Helpers (adapted from big-calendar) ─── */

function groupEvents(dayEvents: CalendarEvent[]): CalendarEvent[][] {
  const sorted = [...dayEvents].sort(
    (a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime()
  );
  const groups: CalendarEvent[][] = [];

  for (const event of sorted) {
    const eventStart = parseISO(event.start);
    let placed = false;

    for (const group of groups) {
      const lastEvent = group[group.length - 1];
      const lastEnd = parseISO(lastEvent.end);
      if (eventStart >= lastEnd) {
        group.push(event);
        placed = true;
        break;
      }
    }

    if (!placed) groups.push([event]);
  }

  return groups;
}

function getEventPosition(
  event: CalendarEvent,
  groupIndex: number,
  groupCount: number
) {
  const start = parseISO(event.start);
  const end = parseISO(event.end);
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const durationMinutes = differenceInMinutes(end, start);

  const visibleStartMinutes = VISIBLE_HOURS.from * 60;
  const top = ((startMinutes - visibleStartMinutes) / 60) * HOUR_HEIGHT;
  const height = Math.max((durationMinutes / 60) * HOUR_HEIGHT - 2, 24);
  const width = groupCount > 1 ? 100 / groupCount : 100;
  const left = groupIndex * width;

  return { top, height, width, left };
}

function formatHour(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  if (hour > 12) return `${hour - 12} PM`;
  return `${hour} AM`;
}

/* ─── Timeline indicator (from big-calendar) ─── */

function TimelineIndicator() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const hour = now.getHours();
  if (hour < VISIBLE_HOURS.from || hour >= VISIBLE_HOURS.to) return null;

  const minutes = hour * 60 + now.getMinutes();
  const visibleStart = VISIBLE_HOURS.from * 60;
  const top = ((minutes - visibleStart) / 60) * HOUR_HEIGHT;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-30"
      style={{ top: `${top}px` }}
    >
      <div className="relative flex items-center">
        <div className="absolute -left-1.5 h-3 w-3 rounded-full bg-accent-blue" />
        <div className="w-full border-t border-accent-blue" />
      </div>
    </div>
  );
}

/* ─── Main component ─── */

export default function CalendarPage() {
  const [rawEvents, setRawEvents] = useState<CalendarEvent[]>(
    eventsData as CalendarEvent[]
  );
  const [loading, setLoading] = useState(!!process.env.NEXT_PUBLIC_API_URL);
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 2, 3)); // March 3, 2025 to match mock data
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [activeCalendars, setActiveCalendars] = useState<CalendarType[]>([
    "work",
    "personal",
    "social",
    "health",
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch events from API if available
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      setLoading(false);
      return;
    }
    api
      .getDashboard()
      .then((data) => {
        if (data.events?.length) {
          setRawEvents(
            data.events.map((e: Record<string, unknown>) => ({
              id: e.id as string,
              title: e.title as string,
              start: e.start as string,
              end: (e.end as string) ?? (e.start as string),
              calendarType:
                (e.calendarType as CalendarType) ?? "personal",
              predictedSpend: (e.predictedSpend as number) ?? 0,
              category: (e.category as string) ?? "other",
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Auto-scroll to ~8am on mount
  useEffect(() => {
    if (scrollRef.current) {
      const offset = (8 - VISIBLE_HOURS.from) * HOUR_HEIGHT;
      scrollRef.current.scrollTop = offset;
    }
  }, []);

  // Derived state
  const weekStart = useMemo(
    () => startOfWeek(selectedDate, { weekStartsOn: 1 }),
    [selectedDate]
  );
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const filteredEvents = useMemo(
    () => rawEvents.filter((e) => activeCalendars.includes(e.calendarType)),
    [rawEvents, activeCalendars]
  );

  const totalPredicted = useMemo(
    () => filteredEvents.reduce((sum, e) => sum + e.predictedSpend, 0),
    [filteredEvents]
  );

  const weekLabel = useMemo(() => {
    const end = addDays(weekStart, 6);
    return `${format(weekStart, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
  }, [weekStart]);

  // Navigation
  const goToPreviousWeek = useCallback(
    () => setSelectedDate((d) => subWeeks(d, 1)),
    []
  );
  const goToNextWeek = useCallback(
    () => setSelectedDate((d) => addWeeks(d, 1)),
    []
  );
  const goToToday = useCallback(() => setSelectedDate(new Date()), []);

  const toggleCalendar = useCallback((type: CalendarType) => {
    setActiveCalendars((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }, []);

  // Get events for a specific day
  const getDayEvents = useCallback(
    (day: Date) =>
      filteredEvents.filter((e) => isSameDay(parseISO(e.start), day)),
    [filteredEvents]
  );

  if (loading) {
    return (
      <PageShell>
        <div className="flex min-h-[400px] items-center justify-center p-6">
          <div className="flex items-center gap-3 text-[var(--text-tertiary)]">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span className="text-sm">Loading calendar...</span>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="flex h-full flex-col gap-4 p-5">
        {/* ─── Header ─── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={goToToday}
              className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
            >
              Today
            </button>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={goToPreviousWeek}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              >
                <CaretLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={goToNextWeek}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              >
                <CaretRight className="h-4 w-4" />
              </button>
            </div>

            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              {weekLabel}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-1.5">
              <CurrencyDollar className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
              <span className="text-xs text-[var(--text-secondary)]">
                Week total:{" "}
                <span className="font-semibold tabular-nums text-[var(--text-primary)]">
                  ${totalPredicted}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* ─── Calendar filters ─── */}
        <div className="flex items-center gap-2">
          {CALENDAR_TYPES.map(({ key, label }) => {
            const colors = CALENDAR_COLORS[key];
            const active = activeCalendars.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleCalendar(key)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                  active
                    ? `${colors.bg} ${colors.border} ${colors.text}`
                    : "border-[var(--border-subtle)] bg-transparent text-[var(--text-muted)] hover:border-[var(--border-default)] hover:text-[var(--text-tertiary)]"
                )}
              >
                <div
                  className={cn(
                    "h-2 w-2 rounded-full transition-colors",
                    active ? colors.dot : "bg-[var(--text-muted)]"
                  )}
                />
                {label}
              </button>
            );
          })}
        </div>

        {/* ─── Calendar grid ─── */}
        <div className="flex min-h-0 flex-1 gap-4">
          {/* Week view */}
          <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
            {/* Single scroll container — header is sticky so columns always align */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto"
              style={{ maxHeight: "calc(100vh - 280px)" }}
            >
              <table className="w-full border-collapse" style={{ minWidth: 700 }}>
                {/* Sticky day headers */}
                <thead>
                  <tr className="sticky top-0 z-20 bg-[var(--bg-secondary)]">
                    <th
                      className="w-14 min-w-[56px] border-b border-[var(--border-subtle)]"
                      aria-label="Time"
                    />
                    {weekDays.map((day, i) => {
                      const today = isToday(day);
                      return (
                        <th
                          key={day.toISOString()}
                          className={cn(
                            "border-b border-l border-[var(--border-subtle)] py-3 text-center font-normal",
                            i === 6 && "border-r-0"
                          )}
                        >
                          <span
                            className={cn(
                              "block text-xs font-medium",
                              today
                                ? "text-accent-blue"
                                : "text-[var(--text-muted)]"
                            )}
                          >
                            {format(day, "EEE")}
                          </span>
                          <span
                            className={cn(
                              "mx-auto mt-1 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold",
                              today
                                ? "bg-accent-blue text-white"
                                : "text-[var(--text-primary)]"
                            )}
                          >
                            {format(day, "d")}
                          </span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                {/* Time grid body */}
                <tbody>
                  {HOURS.map((hour, hourIndex) => (
                    <tr key={hour}>
                      {/* Hour label */}
                      <td
                        className="relative w-14 min-w-[56px] select-none align-top"
                        style={{ height: `${HOUR_HEIGHT}px` }}
                      >
                        {hourIndex !== 0 && (
                          <span className="absolute -top-2.5 right-3 text-xs font-medium text-[var(--text-muted)]">
                            {formatHour(hour)}
                          </span>
                        )}
                      </td>

                      {/* Day cells */}
                      {weekDays.map((day, dayIndex) => {
                        // Only render events in the first hour row to avoid duplicates
                        const isFirstHour = hourIndex === 0;

                        return (
                          <td
                            key={`${day.toISOString()}-${hour}`}
                            className="relative border-l border-[var(--border-subtle)] p-0"
                            style={{ height: `${HOUR_HEIGHT}px` }}
                          >
                            {/* Hour line */}
                            {hourIndex !== 0 && (
                              <div className="absolute inset-x-0 top-0 border-t border-[var(--border-subtle)]" />
                            )}
                            {/* Half-hour dashed line */}
                            <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-[var(--border-subtle)] opacity-30" />

                            {/* Render all events for this day-column in the first row */}
                            {isFirstHour && (() => {
                              const dayEvents = getDayEvents(day);
                              const groups = groupEvents(dayEvents);

                              return groups.map((group, groupIndex) =>
                                group.map((event) => {
                                  const pos = getEventPosition(
                                    event,
                                    groupIndex,
                                    groups.length
                                  );
                                  const hasOverlap = groups.length > 1;

                                  return (
                                    <div
                                      key={event.id}
                                      role="button"
                                      tabIndex={0}
                                      onClick={() => setSelectedEvent(event)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                          e.preventDefault();
                                          setSelectedEvent(event);
                                        }
                                      }}
                                      className={eventCardVariants({
                                        color: event.calendarType,
                                      })}
                                      style={{
                                        top: `${pos.top}px`,
                                        height: `${pos.height}px`,
                                        width: hasOverlap
                                          ? `calc(${pos.width}% - 4px)`
                                          : "calc(100% - 4px)",
                                        left: hasOverlap
                                          ? `calc(${pos.left}% + 2px)`
                                          : "2px",
                                        padding: "4px 8px",
                                        zIndex: 10,
                                      }}
                                    >
                                      <p className="truncate text-xs font-semibold leading-tight">
                                        {event.title}
                                      </p>
                                      {pos.height > 32 && (
                                        <p className="mt-0.5 text-xs opacity-70">
                                          {format(parseISO(event.start), "h:mm a")}
                                        </p>
                                      )}
                                      {pos.height > 50 &&
                                        event.predictedSpend > 0 && (
                                          <p className="mt-0.5 text-xs font-medium opacity-80">
                                            ~${event.predictedSpend}
                                          </p>
                                        )}
                                    </div>
                                  );
                                })
                              );
                            })()}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Current time indicator spans across the day columns area */}
              <div className="pointer-events-none absolute inset-0" style={{ marginLeft: 56 }}>
                <TimelineIndicator />
              </div>
            </div>
          </div>

          {/* ─── Sidebar ─── */}
          <div className="w-64 flex-shrink-0 space-y-4">
            {/* Event detail card */}
            {selectedEvent ? (
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
                      CALENDAR_COLORS[selectedEvent.calendarType].bg,
                      CALENDAR_COLORS[selectedEvent.calendarType].border,
                      CALENDAR_COLORS[selectedEvent.calendarType].text
                    )}
                  >
                    <div
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        CALENDAR_COLORS[selectedEvent.calendarType].dot
                      )}
                    />
                    {selectedEvent.calendarType}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedEvent(null)}
                    className="flex h-5 w-5 items-center justify-center rounded text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
                  {selectedEvent.title}
                </h3>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <Clock className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                    <span>
                      {format(parseISO(selectedEvent.start), "EEE, MMM d")} at{" "}
                      {format(parseISO(selectedEvent.start), "h:mm a")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <CalendarDots className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                    <span>
                      {differenceInMinutes(
                        parseISO(selectedEvent.end),
                        parseISO(selectedEvent.start)
                      )}{" "}
                      minutes
                    </span>
                  </div>
                  {selectedEvent.predictedSpend > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                      <CurrencyDollar className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                      <span className="font-medium text-[var(--text-primary)]">
                        Predicted: ${selectedEvent.predictedSpend}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
                <div className="flex flex-col items-center gap-2 py-4 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-hover)]">
                    <CalendarDots className="h-5 w-5 text-[var(--text-muted)]" />
                  </div>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    Click an event to view details
                  </p>
                </div>
              </div>
            )}

            {/* Week summary */}
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Week Summary
              </h3>

              <div className="space-y-2.5">
                {CALENDAR_TYPES.map(({ key, label }) => {
                  const typeEvents = filteredEvents.filter(
                    (e) => e.calendarType === key
                  );
                  const spend = typeEvents.reduce(
                    (s, e) => s + e.predictedSpend,
                    0
                  );
                  if (typeEvents.length === 0) return null;
                  const colors = CALENDAR_COLORS[key];

                  return (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn("h-2 w-2 rounded-full", colors.dot)}
                        />
                        <span className="text-xs text-[var(--text-secondary)]">
                          {label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--text-muted)]">
                          {typeEvents.length} event
                          {typeEvents.length !== 1 ? "s" : ""}
                        </span>
                        {spend > 0 && (
                          <span className="tabular-nums text-xs font-medium text-[var(--text-primary)]">
                            ${spend}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                <div className="mt-3 border-t border-[var(--border-subtle)] pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--text-tertiary)]">
                      Total predicted
                    </span>
                    <span className="tabular-nums text-sm font-semibold text-[var(--text-primary)]">
                      ${totalPredicted}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
