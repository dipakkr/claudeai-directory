import TimelineClient from "./TimelineClient";
import { TimelineEvent } from "./timeline-data";

export const revalidate = 3600; // Cache for 1 hour

async function getTimelineEvents(): Promise<TimelineEvent[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/timeline`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      console.error("Failed to fetch timeline events");
      return [];
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching timeline events:", error);
    return [];
  }
}

export default async function TimelinePage() {
  const events = await getTimelineEvents();
  return <TimelineClient initialEvents={events} />;
}
