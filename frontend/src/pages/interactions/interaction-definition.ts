import { CadenceParser } from "@onflow/cadence-parser";

export enum InteractionType {
  UNKNOWN = "unknown",
  SCRIPT = "script",
  TRANSACTION = "transaction",
}

export class InteractionDefinition {
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

  get type(): InteractionType {
    const declarations = this.cadenceAst?.program?.Declarations;
    if (!declarations) {
      return InteractionType.UNKNOWN;
    }
    if (declarations?.[0]?.Type === "TransactionDeclaration") {
      return InteractionType.TRANSACTION;
    } else {
      return InteractionType.SCRIPT;
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
