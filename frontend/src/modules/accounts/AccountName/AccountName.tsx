import React, { ReactElement } from "react";
import { CommonUtils } from "utils/common-utils";

type AccountNameProps = {
  address: string;
  shorten?: boolean;
  className?: string;
};

export function AccountName(props: AccountNameProps): ReactElement {
  const { address, shorten, className } = props;
  return (
    <div className={className}>
      {shorten ? CommonUtils.shorten(address, 6) : address}
    </div>
  );
}
