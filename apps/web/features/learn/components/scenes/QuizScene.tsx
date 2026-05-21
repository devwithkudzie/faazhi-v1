"use client";

import type { Scene } from "../../types";
import { ChoiceCheckpoint } from "./quiz/ChoiceCheckpoint";
import { PaperCheckpoint } from "./quiz/PaperCheckpoint";

export function QuizScene({
  onContinueScene,
  scene,
}: {
  onContinueScene?: () => void;
  scene: Scene;
}) {
  if (scene.paperQuestion) {
    return (
      <PaperCheckpoint
        onContinueScene={onContinueScene}
        paperQuestion={scene.paperQuestion}
        scene={scene}
      />
    );
  }

  return (
    <ChoiceCheckpoint
      onContinueScene={onContinueScene}
      scene={scene}
    />
  );
}
