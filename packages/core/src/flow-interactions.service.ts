import { ParsedInteractionOrError } from "@onflowser/api";

export interface IFlowInteractions {
  parse(sourceCode: string): Promise<ParsedInteractionOrError>;
}
