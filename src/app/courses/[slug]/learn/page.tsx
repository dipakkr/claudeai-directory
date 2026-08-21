import { redirect } from "next/navigation";

// Courses are temporarily removed from the site. This page redirects home.
// All course code and data is preserved (src/data/courses.ts, src/data/course-content.ts,
// src/components/courses/*, src/components/home/CoursesSection.tsx) for easy restore.
export default function Page() {
  redirect("/");
}
