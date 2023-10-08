import { CadenceType, FclValue } from "@flowser/shared";

export type CadenceValueBuilder = {
  disabled?: boolean;
  type: CadenceType;
  value: FclValue;
  setValue: (value: FclValue) => void;
  addressBuilderOptions?: {
    showManagedAccountsOnly: boolean;
  };
};
