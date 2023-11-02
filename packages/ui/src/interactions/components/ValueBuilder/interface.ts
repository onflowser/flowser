import { CadenceType } from "@onflowser/api";
import { FclValue } from "@onflowser/core";

export type CadenceValueBuilder = {
  disabled?: boolean;
  type: CadenceType;
  value: FclValue;
  setValue: (value: FclValue) => void;
  addressBuilderOptions?: {
    showManagedAccountsOnly: boolean;
  };
};
