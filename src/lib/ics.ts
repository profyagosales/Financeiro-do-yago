// src/lib/ics.ts
// Helper to build a single ICS file containing one VEVENT.

export type IcsEvent = {
  title: string;
  description?: string;
  start: Date | string;
  end?: Date | string;
  url?: string;
};

function formatDateTime(input: Date | string) {
  const d = typeof input === "string" ? new Date(input) : input;
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function formatDate(input: Date | string) {
  const d = typeof input === "string" ? new Date(input) : input;
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

function escapeText(text: string) {
  return text.replace(/\\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export function buildSingleEvent({
  title,
  description = "",
  start,
  end,
  url,
}: IcsEvent): string {
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@fy`;
  const dtStamp = formatDateTime(new Date());
  const eventLines = [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `SUMMARY:${escapeText(title)}`,
    `DTSTART;VALUE=DATE:${formatDate(start)}`,
  ];
  if (end) {
    eventLines.push(`DTEND;VALUE=DATE:${formatDate(end)}`);
  }
  if (description) {
    eventLines.push(`DESCRIPTION:${escapeText(description)}`);
  }
  if (url) {
    eventLines.push(`URL:${url}`);
  }
  eventLines.push("END:VEVENT");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//fy//bills//PT-BR",
    ...eventLines,
    "END:VCALENDAR",
  ].join("\r\n");
}
