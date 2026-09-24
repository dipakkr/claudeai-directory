import { redirect } from "next/navigation";

// Replaced by the real Submissions section of the dashboard.
export default function DashboardResourcesPage() {
  redirect("/dashboard?tab=submissions");
}
