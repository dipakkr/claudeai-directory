import type { Metadata } from "next";
import Membership from "./Membership";
export const metadata: Metadata = { title: "Skills membership | Claude Directory", alternates: { canonical: "/studio/membership" } };
export default function MembershipPage() { return <Membership/>; }
