import React from "react";
import { cn } from "@/lib/utils";

/**
 * Insight-standard section chrome for scheduled report configuration.
 * Field requirements come from the Glance doc; layout is portal-native (not Glance).
 */
export function ReportScheduleSection({
  title,
  description,
  meta,
  children,
  footer,
  className,
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-slate-200/80 bg-white shadow-sm",
        className,
      )}
    >
      <header className="border-b border-slate-100 px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <h2 className="text-base font-semibold tracking-tight text-slate-900">
              {title}
            </h2>
            {description ? (
              <p className="text-sm text-slate-500 max-w-2xl">{description}</p>
            ) : null}
          </div>
          {meta ? (
            <div className="shrink-0 text-xs text-slate-500 sm:text-right space-y-0.5">
              {meta}
            </div>
          ) : null}
        </div>
      </header>
      <div className="px-4 py-4 sm:px-5 space-y-5">{children}</div>
      {footer ? (
        <footer className="border-t border-slate-100 px-4 py-3 sm:px-5 bg-slate-50/60 rounded-b-xl">
          {footer}
        </footer>
      ) : null}
    </section>
  );
}

export function ReportField({ label, hint, htmlFor, children, className }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <label
          htmlFor={htmlFor}
          className="block text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          {label}
        </label>
      ) : null}
      {children}
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function ReportResultPanel({ title = "Report delivery", children }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-4 sm:px-5">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <div className="mt-2 text-sm text-slate-600 space-y-1">{children}</div>
    </div>
  );
}
