import type { Metadata } from "next";
import Library from "./Library";
export const metadata: Metadata = { title: "Your skill library | Claude Directory", robots: { index: false, follow: false } };
export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  return <Library sessionId={session_id}/>;
}
