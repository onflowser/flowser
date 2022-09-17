import { FlowUtils } from "../../utils/flow-utils";
import React, { ReactElement } from "react";
import { useFlow } from "../../hooks/use-flow";

export function UserIcon(): ReactElement | null {
  const { isLoggedIn, user } = useFlow();
  const { addr } = user;

  if (!isLoggedIn || !addr) {
    return null;
  }

  return (
    <img
      style={{ borderRadius: "50%", backgroundColor: "ghostwhite" }}
      alt=""
      src={FlowUtils.getUserAvatarUrl(addr)}
    />
  );
}
