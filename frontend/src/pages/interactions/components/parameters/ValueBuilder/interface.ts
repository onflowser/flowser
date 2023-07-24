import { CadenceType, FclValue } from "@flowser/shared";

export type CadenceValueBuilder = {
  type: CadenceType;
  value: FclValue;
  setValue: (value: FclValue) => void;
};
