import Link from "next/link";
import { ArrowRight, BadgeCheck, Plus } from "lucide-react";
import { LaunchVoteButton } from "@/components/launches/LaunchVoteButton";
import { LaunchLogo, launchCategory, TodayDelta } from "@/components/launches/LaunchListRow";
import { publicLaunches } from "@/lib/home-community";
import type { ShowcaseProject } from "@/types";
import styles from "./home-launches.module.css";

export default function HomeLaunches({
  projects,
  unavailable,
  upvotesToday = {},
}: {
  projects: ShowcaseProject[];
  unavailable: boolean;
  upvotesToday?: Record<string, number>;
}) {
  const shownProjects = publicLaunches(projects).slice(0, 10);

  return (
    <section id="launches" aria-labelledby="launches-heading" className={styles.section}>
      <div className={styles.heading}>
        <div>
          <h2 id="launches-heading">Latest launches</h2>
          <p>Fresh products from the Claude community. Find your next favorite.</p>
        </div>
        <Link href="/launches/submit" className={styles.submit}>
          <Plus size={16} aria-hidden="true" /> Submit a launch
        </Link>
      </div>

      <div className={styles.feed}>
        <div className={styles.feedHeading}>
          <span>New &amp; noteworthy</span>
          <span>Newest first</span>
        </div>
        <ol className={styles.list}>
          {shownProjects.map((project, index) => {
            const maker = project.author_name || project.author_username;
            const tags = [...new Set([launchCategory(project), project.topics?.[0]].filter(Boolean))];
            return (
              <li key={project.id} className={styles.row} data-launch-impression={project.id} data-surface="home">
                <Link href={`/launches/${encodeURIComponent(project.id)}`} className={styles.product}>
                  <span className={styles.logo}><LaunchLogo project={project} /></span>
                  <div className={styles.details}>
                    <div className={styles.titleLine}>
                      <h3><span className={styles.rank}>{index + 1}.</span> {project.title}</h3>
                      {(project.badge_verified || project.admin_verified) && <BadgeCheck size={16} className={styles.verified} aria-label={project.admin_verified ? "Listing verified" : "Badge verified"} />}
                      {project.featured && <span className={styles.badge}>Featured</span>}
                      {project.promoted && <span className={styles.badge}>Promoted</span>}
                    </div>
                    <span className={styles.tagline}>{project.tagline?.trim() || project.description.trim()}</span>
                    <span className={styles.meta}>
                      {tags.map(tag => <span key={tag} className={styles.tag}>{tag}</span>)}
                      {maker && <span className={styles.maker}>by {maker}</span>}
                      <TodayDelta upvotes={upvotesToday[project.id]} />
                    </span>
                  </div>
                </Link>
                <div className={styles.vote}>
                  <LaunchVoteButton project={project} placement="home_built_with_claude" />
                </div>
              </li>
            );
          })}
        </ol>
        {!shownProjects.length && <p className={styles.empty}>{unavailable ? "Launches are temporarily unavailable. Please try again shortly." : "Your product could be first. Submit a launch to share it with the community."}</p>}
        <Link href="/launches" className={styles.all}>Explore all launches <ArrowRight size={15} aria-hidden="true" /></Link>
      </div>
    </section>
  );
}
