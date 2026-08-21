import { NextResponse } from "next/server";

type InterestPayload = {
  email?: string;
  name?: string;
  role?: string;
  course?: string;
  source?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let payload: InterestPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const email = payload.email?.trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
  }

  const lead = {
    email,
    name: payload.name?.trim() || null,
    role: payload.role?.trim() || null,
    course: payload.course?.trim() || "claude-work-courses",
    source: payload.source?.trim() || "course-funnel",
    capturedAt: new Date().toISOString(),
  };

  const webhookUrl = process.env.COURSE_LEADS_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json(
      {
        message:
          "Course waitlist capture is not connected yet. Configure COURSE_LEADS_WEBHOOK_URL before public launch.",
      },
      { status: 503 },
    );
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
  });

  if (!response.ok) {
    return NextResponse.json(
      { message: "Waitlist provider rejected the lead." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
