"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
/** Progressive motion: content remains visible without JS or with reduced motion. */
export default function Motion() {
  const path = usePathname();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    elements.forEach((el) => {
      el.classList.add("reveal-ready");
      observer.observe(el);
    });
    const tilt = document.querySelector<HTMLElement>("[data-tilt]");
    let frame = 0;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !tilt) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = tilt.getBoundingClientRect();
        tilt.style.setProperty(
          "--tilt-x",
          `${((e.clientY - box.top) / box.height - 0.5) * -8}deg`,
        );
        tilt.style.setProperty(
          "--tilt-y",
          `${((e.clientX - box.left) / box.width - 0.5) * 8}deg`,
        );
      });
    };
    const leave = () => {
      if (tilt) {
        tilt.style.setProperty("--tilt-x", "0deg");
        tilt.style.setProperty("--tilt-y", "0deg");
      }
    };
    tilt?.addEventListener("pointermove", move);
    tilt?.addEventListener("pointerleave", leave);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      elements.forEach((el) => el.classList.remove("reveal-ready"));
      tilt?.removeEventListener("pointermove", move);
      tilt?.removeEventListener("pointerleave", leave);
    };
  }, [path]);
  return null;
}
