import { ProjectEntity } from "../../projects/project.entity";

/**
 * Services must implement this interface to get info on the current project.
 */
export interface ProjectContextLifecycle {
  /**
   * Called when project is started (e.g. user chooses a project in the UI).
   * Should be used to perform setup logic.
   */
  onEnterProjectContext(project: ProjectEntity): Promise<void> | void;

  /**
   * Called when project is exited.
   * Should be used to perform teardown logic.
   */
  onExitProjectContext(): Promise<void> | void;
}

// TODO: Use this to retrieve all services that implement the above interface automatically
export function implementsProjectContextLifecycle(
  value: unknown
): value is ProjectContextLifecycle {
  return (
    typeof value === "object" &&
    value !== null &&
    "onEnterProjectContext" in value &&
    "onExitProjectContext" in value
  );
}
