import React, { ReactElement } from "react";
import { shortenText } from "../../utils/misc";

type AccountNameProps = {
  address: string;
  short?: boolean;
  className?: string;
};

export function AccountName(props: AccountNameProps): ReactElement {
  const { address, short, className } = props;
  return (
    <div className={className}>{short ? shortenText(address, 6) : address}</div>
  );
}
