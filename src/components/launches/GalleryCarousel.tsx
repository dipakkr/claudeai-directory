import { LaunchSection } from "./LaunchSection";

interface GalleryCarouselProps {
  images: string[];
  title: string;
}

export function GalleryCarousel({ images, title }: GalleryCarouselProps) {
  if (!images.length) return null;

  return (
    <LaunchSection title="Gallery" padded={false}>
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pt-3">
        {images.map((image, index) => (
          <a
            key={`${image}-${index}`}
            href={image}
            target="_blank"
            rel="noopener noreferrer"
            className="aspect-[16/9] w-full shrink-0 snap-start overflow-hidden rounded-[10px] border border-border bg-card"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={`${title} screenshot ${index + 1}`}
              className="h-full w-full object-cover"
              loading={index === 0 ? "eager" : "lazy"}
              referrerPolicy="no-referrer"
            />
          </a>
        ))}
      </div>
    </LaunchSection>
  );
}
