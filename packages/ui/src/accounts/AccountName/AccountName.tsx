import React, { ReactElement } from "react";
import { TextUtils } from "../../utils/text-utils";

type AccountNameProps = {
  address: string;
  short?: boolean;
  className?: string;
};

export function AccountName(props: AccountNameProps): ReactElement {
  const { address, short, className } = props;
  return (
    <div className={className}>
      {short ? TextUtils.shorten(address, 6) : address}
    </div>
  );
}
