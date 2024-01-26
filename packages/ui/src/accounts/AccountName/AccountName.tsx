import React, { ReactElement } from "react";
import { TextUtils } from "../../utils/text-utils";
import { useGetAddressNameInfo } from "../../api";

type AccountNameProps = {
  address: string;
  short?: boolean;
  className?: string;
};

export function AccountName(props: AccountNameProps): ReactElement {
  const { address, short, className } = props;
  const { data: nameInfo } = useGetAddressNameInfo(address);

  if (nameInfo) {
    return (
      <div className={className}>
        {nameInfo.name}
      </div>
    )
  }

  return (
    <div className={className}>
      {short ? TextUtils.shorten(address, 6) : address}
    </div>
  );
}
