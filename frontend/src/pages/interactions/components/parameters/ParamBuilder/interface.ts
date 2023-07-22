import { CadenceType } from "@flowser/shared";

export type ParameterBuilder = {
  parameterType: CadenceType;
  parameterValue: unknown;
  setParameterValue: (value: unknown) => void;
};
