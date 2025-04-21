"use client";

import { Calendar } from "@/components/calendar/calendar";

export default function CalendarPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Takvim</h1>
      <Calendar />
    </div>
  );
}
