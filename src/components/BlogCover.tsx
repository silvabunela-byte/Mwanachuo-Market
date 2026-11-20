"use client";

import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";

/**
 * Picha ya jalada la makala. Kama makala haina picha (au picha imeshindwa
 * kupakia) inaonyesha gradient yenye kichwa cha makala.
 */
export default function BlogCover({
  title,
  src,
  large = false,
}: {
  title: string;
  src: string | null | undefined;
  large?: boolean;
}) {
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [src]);

  if (src && !broken) {
    return (
      <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100">
        <img
          src={src}
          alt={title}
          loading="lazy"
          onError={() => setBroken(true)}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="relative flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 overflow-hidden bg-gradient-to-br from-[#059669] to-emerald-900 px-5 text-center text-white">
      <BookOpen
        className={`${large ? "h-9 w-9" : "h-7 w-7"} shrink-0 text-white/70`}
      />
      <p
        className={`line-clamp-3 break-words font-extrabold leading-snug ${
          large ? "text-xl sm:text-2xl" : "text-base"
        }`}
      >
        {title}
      </p>
    </div>
  );
}
