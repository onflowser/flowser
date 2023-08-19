import { InteractionKind, InteractionTemplate } from "@flowser/shared";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ProjectContextLifecycle } from "../utils/project-context";
import { ProjectEntity } from "../../projects/project.entity";
import * as fs from "fs/promises";
import * as path from "path";
import { GoBindingsService } from "../../go-bindings/go-bindings.service";
import { isDefined } from "../../utils/common-utils";

@Injectable()
export class FlowTemplatesService implements ProjectContextLifecycle {
  private projectContext: ProjectEntity | undefined;

  constructor(private readonly goBindings: GoBindingsService) {}

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
    const templates = await Promise.all(
      potentialCadenceFilePaths.map((potentialCadenceFilePath) =>
        this.buildMaybeTemplate(potentialCadenceFilePath)
      )
    );
    return templates.filter(isDefined);
  }

  private async buildMaybeTemplate(
    filePath: string
  ): Promise<InteractionTemplate | undefined> {
    const fileContent = await fs.readFile(filePath);
    const code = fileContent.toString("utf-8");
    const parseResponse = await this.goBindings.getParsedInteraction({
      sourceCode: code,
    });

    const isValidInteraction =
      parseResponse.interaction &&
      [
        InteractionKind.INTERACTION_SCRIPT,
        InteractionKind.INTERACTION_TRANSACTION,
      ].includes(parseResponse.interaction.kind);
    if (isValidInteraction) {
      return {
        id: filePath,
        name: path.basename(filePath),
        code,
        source: {
          filePath,
        },
      };
    } else {
      return undefined;
    }
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
      .filter((filePath) => path.extname(filePath) === ".cdc")
      .map((filePath) => path.join(rootDirPath, filePath));

    return [...cadenceFilePaths, ...descendantCadencePaths.flat()];
  }
}
