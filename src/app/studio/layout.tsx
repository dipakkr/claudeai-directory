import { Logo } from "@/components/layout/Logo";
import type { Metadata } from "next";
import styles from "./studio.module.css";
import StudioNavigation from "./StudioNavigation";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <div className={styles.studio}>
    <header className={styles.header}>
      <Logo compactOnMobile />
      <StudioNavigation />
      <div className={styles.headerMeta}><span>Tested by Claude Directory</span></div>
    </header>
    {children}
  </div>;
}
