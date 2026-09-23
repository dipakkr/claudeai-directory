"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryCarouselProps {
  images: string[];
  title: string;
}

export function GalleryCarousel({ images, title }: GalleryCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images.length) {
    return null;
  }

  const current = images[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  const handlePrev = () => {
    if (hasPrev) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (hasNext) setCurrentIndex(currentIndex + 1);
  };

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card/50">
        <div className="aspect-[16/10] w-full bg-background">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current}
            alt={`${title} screenshot ${currentIndex + 1}`}
            className="h-full w-full object-cover"
            loading="eager"
            referrerPolicy="no-referrer"
          />
        </div>

        {images.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between p-4">
            <button
              onClick={handlePrev}
              disabled={!hasPrev}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-all hover:enabled:bg-background disabled:opacity-50"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              disabled={!hasNext}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-all hover:enabled:bg-background disabled:opacity-50"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <div className="flex gap-2 rounded-full bg-background/80 px-3 py-2 backdrop-blur-sm">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex ? "w-6 bg-foreground" : "w-2 bg-muted-foreground"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              onClick={() => setCurrentIndex(index)}
              className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                index === currentIndex ? "border-primary" : "border-border hover:border-border/80"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
