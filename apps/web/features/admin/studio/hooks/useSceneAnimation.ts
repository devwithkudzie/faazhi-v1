"use client";

import { useCallback, useMemo } from "react";
import gsap from "gsap";
import { annotate } from "rough-notation";

import type { AdminSceneBlock } from "@/features/admin/papers/types/paper-workspace.types";

export function useSceneAnimation() {
  const blockRevealVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 8, scale: 0.98 },
      visible: { opacity: 1, y: 0, scale: 1 },
    }),
    [],
  );

  const playGsapReveal = useCallback((element: HTMLElement | null) => {
    if (!element) return;

    gsap.fromTo(
      element,
      { autoAlpha: 0, y: 10 },
      { autoAlpha: 1, duration: 0.35, ease: "power2.out", y: 0 },
    );
  }, []);

  const annotateBlock = useCallback(
    (element: HTMLElement | null, block?: AdminSceneBlock) => {
      if (!element || block?.style?.effect !== "highlight") return;

      const annotation = annotate(element, {
        animationDuration: 500,
        color: "#1557c0",
        type: "highlight",
      });

      annotation.show();
    },
    [],
  );

  return {
    annotateBlock,
    blockRevealVariants,
    playGsapReveal,
  };
}
