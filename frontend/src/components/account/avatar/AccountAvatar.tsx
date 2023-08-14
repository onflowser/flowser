import { FlowUtils } from "../../../utils/flow-utils";
import React, { ReactElement } from "react";

type AccountAvatarProps = {
  size?: number;
  address: string;
  className?: string;
};

export function AccountAvatar({
  size,
  address,
  className,
}: AccountAvatarProps): ReactElement | null {
  return (
    <img
      className={className}
      style={{
        borderRadius: "50%",
        backgroundColor: "ghostwhite",
        height: size,
        width: size,
      }}
      alt={address}
      src={FlowUtils.getUserAvatarUrl(address)}
    />
  );
}
