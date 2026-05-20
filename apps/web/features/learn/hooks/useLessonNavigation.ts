import { useMemo } from "react";
import type { LearnCurriculum } from "../types";

export function useLessonNavigation(
  curriculum: LearnCurriculum,
  activeLessonId: string,
) {
  const lessons = useMemo(
    () => curriculum.topics.flatMap((topic) => topic.lessons),
    [curriculum],
  );
  const activeIndex = lessons.findIndex((lesson) => lesson.id === activeLessonId);

  return {
    lessons,
    previousLesson: activeIndex > 0 ? lessons[activeIndex - 1] : null,
    nextLesson:
      activeIndex >= 0 && activeIndex < lessons.length - 1
        ? lessons[activeIndex + 1]
        : null,
  };
}
