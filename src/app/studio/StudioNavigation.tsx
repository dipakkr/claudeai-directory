"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import styles from "./studio.module.css";

export default function StudioNavigation() {
  const pathname = usePathname();
  return <nav aria-label="Studio navigation">
    {[{ href: "/studio", label: "Skills" }, { href: "/studio/membership", label: "Membership" }, { href: "/studio/library", label: "Library" }].map(link => <Link key={link.href} href={link.href} className={pathname === link.href ? styles.activeNav : undefined} aria-current={pathname === link.href ? "page" : undefined}>{link.label}</Link>)}
    <Link href="/skills" className={styles.freeDirectory}>Free directory <ArrowUpRight size={12}/></Link>
  </nav>;
}
