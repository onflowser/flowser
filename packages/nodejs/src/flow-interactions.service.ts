import * as fs from "fs/promises";
import * as path from "path";
import { GoBindingsService } from "./go-bindings.service";
import { isDefined } from "@onflowser/core";
import { InteractionKind, ParsedInteractionOrError, WorkspaceTemplate } from "@onflowser/api";
import { IFlowInteractions } from "@onflowser/core";

type GetInteractionTemplatesOptions = {
  workspacePath: string;
};

export class FlowInteractionsService implements IFlowInteractions {
  constructor(private readonly goBindings: GoBindingsService) {}

  parse(sourceCode: string): Promise<ParsedInteractionOrError> {
    return this.goBindings.getParsedInteraction({ sourceCode });
  }

  public async getTemplates(
    options: GetInteractionTemplatesOptions,
  ): Promise<WorkspaceTemplate[]> {
    const potentialCadenceFilePaths = await this.findAllCadenceFiles(
      options.workspacePath,
    );
    const templates = await Promise.all(
      potentialCadenceFilePaths.map((potentialCadenceFilePath) =>
        this.buildMaybeTemplate(potentialCadenceFilePath),
      ),
    );
    return templates.filter(isDefined);
  }

  private async buildMaybeTemplate(
    filePath: string,
  ): Promise<WorkspaceTemplate | undefined> {
    const [fileContent, fileStats] = await Promise.all([
      fs.readFile(filePath),
      fs.stat(filePath),
    ]);
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
        updatedAt: fileStats.mtime,
        createdAt: fileStats.ctime,
        filePath
      };
    } else {
      return undefined;
    }
  }

  private async findAllCadenceFiles(rootDirPath: string): Promise<string[]> {
    const filePaths = await fs.readdir(rootDirPath).catch(() => {
      // Likely a "not a directory" error, ignore.
      return [];
    });

    const ignoredDirNames = new Set(["node_modules"]);

    const potentialDirPaths = filePaths.filter(
      (path) => !/\.[a-z]+/.test(path),
    );
    const descendantCadencePaths = await Promise.all(
      potentialDirPaths
        .filter((potentialDirPath) => !ignoredDirNames.has(potentialDirPath))
        .map((potentialDirPath) =>
          this.findAllCadenceFiles(path.join(rootDirPath, potentialDirPath)),
        ),
    );

    const cadenceFilePaths = filePaths
      .filter((filePath) => path.extname(filePath) === ".cdc")
      .map((filePath) => path.join(rootDirPath, filePath));

    return [...cadenceFilePaths, ...descendantCadencePaths.flat()];
  }
}
