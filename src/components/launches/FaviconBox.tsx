"use client";

import { useState } from "react";

interface FaviconBoxProps {
  src?: string | null;
  name: string;
  className?: string;
}

export function FaviconBox({ src, name, className }: FaviconBoxProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <div className={className}>
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src!}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        name.slice(0, 2).toUpperCase()
      )}
    </div>
  );
}
