"use client";

import { Calendar } from "@/components/calendar/calendar";

export default function CalendarPage() {
  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Takvim</h1>
      </div>
      <Calendar />
    </div>
  );
}
