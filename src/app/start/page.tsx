import { redirect } from "next/navigation";

// Courses were retired; their written content moved to /guides
// (backend/app/seed/seed_course_guides.py). This old page redirects home.
export default function Page() {
  redirect("/");
}
