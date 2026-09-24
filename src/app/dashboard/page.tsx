import type { Metadata } from "next";
import { Suspense } from "react";

import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "Your dashboard",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  // useSearchParams (the ?tab= section) needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <DashboardClient />
    </Suspense>
  );
}
