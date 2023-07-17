import { GetParsedInteractionResponse, InteractionKind } from "@flowser/shared";
import { ServiceRegistry } from "../../services/service-registry";

export class InteractionDefinition {
  public id: string;
  private sourceCodeInternal: string;
  private parsedInteractionResponse: GetParsedInteractionResponse;

  constructor(options: {
    id: string;
    sourceCode: string;
  }) {
    this.id = options.id;
    this.sourceCodeInternal = options.sourceCode;
    this.parsedInteractionResponse = GetParsedInteractionResponse.fromPartial(
      {}
    );
    this.updateAst();
  }

  get sourceCode(): string {
    return this.sourceCodeInternal;
  }

  get name(): string {
    return "Test";
  }

  get type(): InteractionKind {
    return (
      this.parsedInteractionResponse.interaction?.kind ??
      InteractionKind.INTERACTION_UNKNOWN
    );
  }

  setSourceCode(value: string): void {
    this.sourceCodeInternal = value;
    this.updateAst();
  }

  private async updateAst() {
    this.parsedInteractionResponse =
      await ServiceRegistry.getInstance().interactionsService.parseInteraction({
        sourceCode: this.sourceCodeInternal,
      });
  }
}
