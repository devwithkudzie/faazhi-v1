import type { Scene } from "../../types";
import { CalloutScene } from "./CalloutScene";
import { CodeScene } from "./CodeScene";
import { ConceptScene } from "./ConceptScene";
import { DiagramScene } from "./DiagramScene";
import { ExampleScene } from "./ExampleScene";
import { InteractiveScene } from "./InteractiveScene";
import { QuizScene } from "./QuizScene";
import { VideoScene } from "./VideoScene";

export function SceneRenderer({
  onContinueScene,
  scene,
  sceneTime = 0,
}: {
  onContinueScene?: () => void;
  scene: Scene;
  sceneTime?: number;
}) {
  if (scene.type === "example") {
    return <ExampleScene scene={scene} sceneTime={sceneTime} />;
  }
  if (scene.type === "diagram" || scene.type === "simulation") {
    return <DiagramScene scene={scene} />;
  }
  if (scene.type === "interactive") {
    return <InteractiveScene onContinueScene={onContinueScene} scene={scene} />;
  }
  if (scene.type === "quiz" || scene.type === "checkpoint") {
    return <QuizScene onContinueScene={onContinueScene} scene={scene} />;
  }
  if (scene.type === "code") return <CodeScene scene={scene} />;
  if (scene.type === "video") return <VideoScene scene={scene} />;
  if (scene.type === "callout" || scene.type === "reflection") {
    return <CalloutScene scene={scene} sceneTime={sceneTime} />;
  }

  return <ConceptScene scene={scene} sceneTime={sceneTime} />;
}
