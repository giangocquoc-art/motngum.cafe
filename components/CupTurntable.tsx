"use client";

import { useEffect, useRef, useState } from "react";

const frames = [1, 2, 3, 4] as const;

function frameSrc(frame: number) {
  return `/assets/hero-frames/cup-${frame}.webp`;
}

function frameSrcSet(frame: number) {
  return [
    `/assets/hero-frames/cup-${frame}-420.webp 420w`,
    `/assets/hero-frames/cup-${frame}-640.webp 640w`,
    `/assets/hero-frames/cup-${frame}.webp 840w`,
  ].join(", ");
}

export default function CupTurntable() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const hero = root?.closest<HTMLElement>(".hero");
    if (!root || !hero) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;

    const render = () => {
      animationFrame = 0;
      if (reduceMotion.matches) {
        root.style.setProperty("--cup-progress", "0");
        root.style.setProperty("--cup-frame", "0");
        hero.style.setProperty("--cup-progress", "0");
        root.querySelectorAll<HTMLElement>(".cup-frame").forEach((frame, index) => {
          frame.style.opacity = index === 0 ? "1" : "0";
        });
        return;
      }

      const rect = hero.getBoundingClientRect();
      const distance = Math.max(hero.offsetHeight - window.innerHeight, 1);
      const progress = Math.min(1, Math.max(0, -rect.top / distance));
      root.style.setProperty("--cup-progress", progress.toFixed(4));
      root.style.setProperty("--cup-frame", (progress * 3).toFixed(4));
      hero.style.setProperty("--cup-progress", progress.toFixed(4));
      const framePosition = progress * 3;
      root.querySelectorAll<HTMLElement>(".cup-frame").forEach((frame, index) => {
        frame.style.opacity = String(Math.max(0, 1 - Math.abs(framePosition - index)));
      });
    };

    const schedule = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(render);
    };

    render();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    reduceMotion.addEventListener("change", schedule);

    const idle = window.setTimeout(() => setReady(true), 180);
    return () => {
      window.clearTimeout(idle);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reduceMotion.removeEventListener("change", schedule);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`cup-turntable ${ready ? "is-ready" : ""}`}
      role="img"
      aria-label="Ly cà phê đá Một Ngụm chuyển động theo trang"
    >
      {frames.map((frame, index) => (
        <img
          key={frame}
          src={frameSrc(frame)}
          srcSet={frameSrcSet(frame)}
          sizes="(max-width: 560px) 70vw, (max-width: 900px) 48vw, min(570px, 42vw)"
          alt=""
          width={840}
          height={840}
          className={`cup-frame cup-frame-${frame}`}
          loading={index === 0 ? "eager" : ready ? "eager" : "lazy"}
          fetchPriority={index === 0 ? "high" : "low"}
          decoding="async"
        />
      ))}
      <span className="cup-glint cup-glint-one" aria-hidden="true" />
      <span className="cup-glint cup-glint-two" aria-hidden="true" />
    </div>
  );
}
