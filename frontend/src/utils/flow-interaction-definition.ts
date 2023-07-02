import { CadenceParser } from "@onflow/cadence-parser";

export enum FlowInteractionType {
  SCRIPT,
  TRANSACTION,
}

export class FlowInteractionDefinition {
  public id: string;
  private sourceCodeInternal: string;
  private cadenceParser: CadenceParser;
  private cadenceAst: any;
  // TODO(feature-interact-screen): Add and formalize `arguments` field

  constructor(options: {
    id: string;
    sourceCode: string;
    cadenceParser: CadenceParser;
  }) {
    this.id = options.id;
    this.sourceCodeInternal = options.sourceCode;
    this.cadenceParser = options.cadenceParser;
  }

  get sourceCode(): string {
    return this.sourceCodeInternal;
  }

  get name(): string {
    return "Test";
  }

  get type(): FlowInteractionType {
    return FlowInteractionType.TRANSACTION;
  }

  setSourceCode(value: string): void {
    this.cadenceAst = this.cadenceParser.parse(value);
    this.sourceCodeInternal = value;
  }
}
