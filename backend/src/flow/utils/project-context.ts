import { ProjectEntity } from "../../projects/entities/project.entity";

/**
 * Services must implement this interface to get info on the current project.
 */
export interface ProjectContextLifecycle {
  /**
   * Perform setup logic.
   */
  onEnterProjectContext(project: ProjectEntity): Promise<void> | void;

  /**
   * Perform teardown logic.
   */
  onExitProjectContext(): Promise<void> | void;
}

export function hasProjectContextInterface(object: unknown) {
  if (typeof object !== "object") {
    return false;
  }
  return (
    object !== null &&
    "onEnterProjectContext" in object &&
    "onExitProjectContext" in object
  );
}
