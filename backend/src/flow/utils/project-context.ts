import { ProjectEntity } from "../../projects/entities/project.entity";

/**
 * Services must implement this interface to get info on the current project.
 */
export interface ProjectContextLifecycle {
  onEnterProjectContext(project: ProjectEntity): void;
  onExitProjectContext(): void;
}

export function hasProjectContextInterface(object: unknown) {
  if (typeof object !== "object") {
    return false;
  }
  return "onEnterProjectContext" in object && "onExitProjectContext" in object;
}
