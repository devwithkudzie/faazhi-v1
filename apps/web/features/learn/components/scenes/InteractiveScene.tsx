import { QuizScene } from "./QuizScene";
import type { Scene } from "../../types";

export function InteractiveScene({
  onContinueScene,
  scene,
}: {
  onContinueScene?: () => void;
  scene: Scene;
}) {
  return <QuizScene onContinueScene={onContinueScene} scene={scene} />;
}
