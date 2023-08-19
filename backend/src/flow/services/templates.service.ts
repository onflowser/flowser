import { InteractionTemplate } from "@flowser/shared";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ProjectContextLifecycle } from "../utils/project-context";
import { ProjectEntity } from "../../projects/project.entity";
import * as fs from "fs/promises";
import * as path from "path";

@Injectable()
export class FlowTemplatesService implements ProjectContextLifecycle {
  private projectContext: ProjectEntity | undefined;

  public async onEnterProjectContext(project: ProjectEntity) {
    this.projectContext = project;
  }

  public onExitProjectContext() {
    this.projectContext = undefined;
  }

  public async getLocalTemplates(): Promise<InteractionTemplate[]> {
    if (!this.projectContext) {
      throw new InternalServerErrorException("Project context not found");
    }
    const potentialCadenceFilePaths = await this.findAllCadenceFiles(
      this.projectContext.filesystemPath
    );
    return potentialCadenceFilePaths.map(
      (potentialCadenceFilePath): InteractionTemplate => ({
        id: potentialCadenceFilePath,
        name: potentialCadenceFilePath,
        code: "",
        source: {
          filePath: potentialCadenceFilePath,
        },
      })
    );
  }

  private async findAllCadenceFiles(rootDirPath: string): Promise<string[]> {
    const filePaths = await fs.readdir(rootDirPath);

    const ignoredDirNames = new Set(["node_modules"]);

    const potentialDirPaths = filePaths.filter(
      (path) => !/\.[a-z]+/.test(path)
    );
    const descendantCadencePaths = await Promise.all(
      potentialDirPaths
        .filter((potentialDirPath) => !ignoredDirNames.has(potentialDirPath))
        .map((potentialDirPath) =>
          this.findAllCadenceFiles(path.join(rootDirPath, potentialDirPath))
        )
    );

    const cadenceFilePaths = filePaths
      .filter((filePath) => filePath.endsWith(".cdc"))
      .map((filePath) => path.join(rootDirPath, filePath));

    return [...cadenceFilePaths, ...descendantCadencePaths.flat()];
  }
}
