import type { LearnCurriculum } from "../types";

export function useProgress(curriculum: LearnCurriculum) {
  return {
    moduleProgress: curriculum.progress,
  };
}
