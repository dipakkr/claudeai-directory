
import type { ShowcaseProject } from "@/types";
import { LaunchSection } from "./LaunchSection";

interface DemoVideoSectionProps {
  project: ShowcaseProject;
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

export function DemoVideoSection({ project }: DemoVideoSectionProps) {
  const videoUrl = project.demo_video_url;
  if (!videoUrl) return null;

  const youtubeId = extractYouTubeId(videoUrl);

  if (!youtubeId) {
    return null;
  }

  return (
    <LaunchSection title="Demo">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-background">
        <div className="aspect-video w-full bg-background/50">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title="Product demo video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      </div>
    </LaunchSection>
  );
}
