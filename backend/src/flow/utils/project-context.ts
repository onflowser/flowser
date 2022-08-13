import { ProjectEntity } from "../../projects/entities/project.entity";

export class ProjectContext {
  projectContext: ProjectEntity | undefined;

  // Standard interface to provide info about current project
  setProjectContext(project: ProjectEntity) {
    this.projectContext = project;
  }
}
