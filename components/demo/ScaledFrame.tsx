"use client";

import { useEffect, useRef, useState } from "react";

const DESKTOP = 1280;

/**
 * On wide screens, shows the page as a 1280px-wide desktop would and scales it to fit, so the map always uses its
 * desktop layout. On narrower screens (phones, tablets) it shows the page at its real width.
 */
export default function ScaledFrame({ src, title }: { src: string; title: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = size && size.w >= 720 && size.w < DESKTOP ? size.w / DESKTOP : 1;
  return (
    <div ref={box} className="relative h-[72vh] w-full overflow-hidden lg:h-[calc(100vh-170px)]">
      <iframe
        key={src}
        src={src}
        title={title}
        className="absolute left-0 top-0 block border-0 bg-bg"
        style={
          scale < 1 && size
            ? { width: DESKTOP, height: size.h / scale, transform: `scale(${scale})`, transformOrigin: "0 0" }
            : { width: "100%", height: "100%" }
        }
      />
    </div>
  );
}
