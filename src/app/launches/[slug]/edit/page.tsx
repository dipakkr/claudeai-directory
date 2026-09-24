import type { Metadata } from "next";

import EditLaunchClient from "./EditLaunchClient";

export const metadata: Metadata = {
  title: "Edit launch",
  robots: { index: false, follow: false },
};

export default async function EditLaunchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <EditLaunchClient slug={slug} />;
}
