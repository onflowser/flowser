import React, { ReactElement } from "react";
import { CommonUtils } from "utils/common-utils";

type AccountNameProps = {
  address: string;
  shorten?: boolean;
};

export function AccountName(props: AccountNameProps): ReactElement {
  const { address, shorten } = props;
  return <div>{shorten ? CommonUtils.shorten(address, 6) : address}</div>;
}
