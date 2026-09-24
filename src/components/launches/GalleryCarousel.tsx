import { LaunchSection } from "./LaunchSection";

interface GalleryCarouselProps {
  images: string[];
  title: string;
}

export function GalleryCarousel({ images, title }: GalleryCarouselProps) {
  if (!images.length) return null;

  return (
    <LaunchSection title="Gallery" padded={false}>
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 py-6 md:px-8">
        {images.map((image, index) => (
          <a
            key={`${image}-${index}`}
            href={image}
            target="_blank"
            rel="noopener noreferrer"
            className="aspect-[16/9] w-[85%] shrink-0 snap-start overflow-hidden rounded-xl border border-border bg-card sm:w-[70%]"
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
