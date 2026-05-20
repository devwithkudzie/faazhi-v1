import { ConceptScene } from "./ConceptScene";
import type { Scene } from "../../types";

export function DiagramScene({ scene }: { scene: Scene }) {
  return <ConceptScene scene={scene} />;
}
