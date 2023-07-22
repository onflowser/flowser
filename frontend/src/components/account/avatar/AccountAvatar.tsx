import { FlowUtils } from "../../../utils/flow-utils";
import React, { ReactElement } from "react";
import { useFlow } from "../../../hooks/use-flow";

type LoggedInAccountAvatarProps = {
  size?: number;
};

export function LoggedInAccountAvatar({
  size,
}: LoggedInAccountAvatarProps): ReactElement | null {
  const { isLoggedIn, user } = useFlow();
  const { addr } = user;

  if (!isLoggedIn || !addr) {
    return null;
  }

  return <AccountAvatar address={addr} size={size} />;
}

type AccountAvatarProps = {
  size?: number;
  address: string;
};

export function AccountAvatar({
  size,
  address,
}: AccountAvatarProps): ReactElement | null {
  return (
    <img
      style={{
        borderRadius: "50%",
        backgroundColor: "ghostwhite",
        height: size,
        width: size,
      }}
      alt=""
      src={FlowUtils.getUserAvatarUrl(address)}
    />
  );
}
