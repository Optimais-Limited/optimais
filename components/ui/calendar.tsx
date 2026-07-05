"use client";

import React from "react";
import { Button } from "@/components/ui/button";

const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const CalendarDay: React.FC<{ day: number | string; isHeader?: boolean }> = ({
  day,
  isHeader,
}) => {
  const highlighted =
    !isHeader && Math.random() < 0.3
      ? "bg-amber-500 text-white"
      : "text-white/50";

  return (
    <div
      className={`col-span-1 row-span-1 flex h-8 w-8 items-center justify-center ${
        isHeader ? "" : "rounded-xl"
      } ${highlighted}`}
    >
      <span className={`font-medium ${isHeader ? "text-xs text-white/40" : "text-sm"}`}>
        {day}
      </span>
    </div>
  );
};

const bookingLink = "mailto:optimaislabs@gmail.com";

export function Calendar() {
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString("default", { month: "long" });
  const currentYear = currentDate.getFullYear();
  const firstDayOfMonth = new Date(currentYear, currentDate.getMonth(), 1);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();

  const renderCalendarDays = () => {
    const days: React.ReactNode[] = [
      ...dayNames.map((day) => (
        <CalendarDay key={`header-${day}`} day={day} isHeader />
      )),
      ...Array(firstDayOfWeek).fill(null).map((_, i) => (
        <div key={`empty-${i}`} className="col-span-1 row-span-1 h-8 w-8" />
      )),
      ...Array(daysInMonth).fill(null).map((_, i) => (
        <CalendarDay key={`date-${i + 1}`} day={i + 1} />
      )),
    ];
    return days;
  };

  return (
    <BentoCard linkTo={bookingLink}>
      <div className="grid h-full gap-6">
        <div>
          <h2 className="mb-3 text-lg md:text-2xl font-semibold text-white">
            Ready to build something exceptional?
          </h2>
          <p className="mb-2 text-sm text-white/60">
            Book a strategy call to discuss how Optimais can support your goals.
          </p>
          <Button className="mt-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-semibold">
            Book a Call
          </Button>
        </div>

        <div>
          <div className="w-full max-w-xs rounded-3xl border border-white/10 p-2 transition-colors duration-100 group-hover:border-amber-400/40">
            <div
              className="rounded-2xl border-2 border-white/5 p-3"
              style={{ boxShadow: "0px 2px 1.5px 0px rgba(165,174,184,0.15) inset" }}
            >
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-white">
                  {currentMonth}, {currentYear}
                </p>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <p className="text-xs text-white/40">30 min call</p>
              </div>
              <div className="mt-4 grid grid-cols-7 gap-2 px-2">
                {renderCalendarDays()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BentoCard>
  );
}

interface BentoCardProps {
  children: React.ReactNode;
  height?: string;
  className?: string;
  showHoverGradient?: boolean;
  hideOverflow?: boolean;
  linkTo?: string;
}

export function BentoCard({
  children,
  height = "h-auto",
  className = "",
  showHoverGradient = true,
  hideOverflow = true,
  linkTo,
}: BentoCardProps) {
  const cardContent = (
    <div
      className={`group relative flex flex-col rounded-2xl border border-white/10 bg-navy-900/30 p-6 hover:bg-amber-900/10 ${
        hideOverflow ? "overflow-hidden" : ""
      } ${height} ${className}`}
    >
      {linkTo && (
        <div className="absolute bottom-4 right-6 z-[999] flex h-12 w-12 rotate-6 items-center justify-center rounded-full bg-white opacity-0 transition-all duration-300 group-hover:translate-y-[-8px] group-hover:rotate-0 group-hover:opacity-100">
          <svg className="h-6 w-6 text-amber-600" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.25 15.25V6.75H8.75" />
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 7L6.75 17.25" />
          </svg>
        </div>
      )}
      {showHoverGradient && (
        <div className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-tl from-amber-400/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      )}
      {children}
    </div>
  );

  if (linkTo) {
    return linkTo.startsWith("/") ? (
      <a href={linkTo} className="block">{cardContent}</a>
    ) : (
      <a href={linkTo} target="_blank" rel="noopener noreferrer" className="block">
        {cardContent}
      </a>
    );
  }

  return cardContent;
}
