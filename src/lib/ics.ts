// src/lib/ics.ts
// Helper to build a single VEVENT block for ICS export

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
  const lines = [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `SUMMARY:${escapeText(title)}`,
    `DTSTART;VALUE=DATE:${formatDate(start)}`,
  ];
  if (end) {
    lines.push(`DTEND;VALUE=DATE:${formatDate(end)}`);
  }
  if (description) {
    lines.push(`DESCRIPTION:${escapeText(description)}`);
  }
  if (url) {
    lines.push(`URL:${url}`);
  }
  lines.push("END:VEVENT");
  return lines.join("\r\n");
}
