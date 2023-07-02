import { CadenceParser } from "@onflow/cadence-parser";

export enum FlowInteractionType {
  UNKNOWN = "unknown",
  SCRIPT = "script",
  TRANSACTION = "transaction",
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
    this.updateAst();
  }

  get sourceCode(): string {
    return this.sourceCodeInternal;
  }

  get name(): string {
    return "Test";
  }

  get type(): FlowInteractionType {
    const declarations = this.cadenceAst?.program?.Declarations;
    if (!declarations) {
      return FlowInteractionType.UNKNOWN;
    }
    if (declarations?.[0]?.Type === "TransactionDeclaration") {
      return FlowInteractionType.TRANSACTION;
    } else {
      return FlowInteractionType.SCRIPT;
    }
  }

  setSourceCode(value: string): void {
    this.sourceCodeInternal = value;
    this.updateAst();
  }

  private updateAst() {
    this.cadenceAst = this.cadenceParser.parse(this.sourceCodeInternal);
  }
}
