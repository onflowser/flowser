export enum FlowserDependencyErrorType {
  UNSUPPORTED_CLI_VERSION,
  MISSING_FLOW_CLI,
}

export interface FlowserDependencyError {
  name: string;
  type: FlowserDependencyErrorType;

  unsupportedCliVersion?: {
    minSupportedVersion: string;
    actualVersion: string;
  };
}
