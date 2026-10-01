import type { Metadata } from "next";

import ViewAsClient from "./ViewAsClient";

export const metadata: Metadata = {
  title: "Opening member view",
  robots: { index: false, follow: false },
};

export default function ViewAsPage() {
  return <ViewAsClient />;
}
