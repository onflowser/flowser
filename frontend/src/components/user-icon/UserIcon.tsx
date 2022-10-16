import { FlowUtils } from "../../utils/flow-utils";
import React, { ReactElement } from "react";
import { useFlow } from "../../hooks/use-flow";

export type UserIconProps = {
  size?: number;
};

export function UserIcon({ size }: UserIconProps): ReactElement | null {
  const { isLoggedIn, user } = useFlow();
  const { addr } = user;

  if (!isLoggedIn || !addr) {
    return null;
  }

  return (
    <img
      style={{
        borderRadius: "50%",
        backgroundColor: "ghostwhite",
        height: size,
        width: size,
      }}
      alt=""
      src={FlowUtils.getUserAvatarUrl(addr)}
    />
  );
}
