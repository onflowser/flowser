import React, { ReactElement, useMemo } from "react";

import service from "./avatars/service.png";

import avatar1 from "./avatars/1.jpg";
import avatar2 from "./avatars/2.jpg";
import avatar3 from "./avatars/3.jpg";
import avatar4 from "./avatars/4.jpg";
import avatar5 from "./avatars/5.jpg";
import avatar6 from "./avatars/6.jpg";
import avatar7 from "./avatars/7.jpg";
import avatar8 from "./avatars/8.jpg";
import avatar9 from "./avatars/9.jpg";
import avatar10 from "./avatars/10.jpg";
import avatar11 from "./avatars/11.jpg";
import avatar12 from "./avatars/12.jpg";
import avatar13 from "./avatars/13.jpg";
import avatar14 from "./avatars/14.jpg";
import avatar15 from "./avatars/15.jpg";
import avatar16 from "./avatars/16.jpg";
import { Spinner } from "../../common/loaders/Spinner/Spinner";
import { useGetAddressIndex } from "../../api";

const avatarUrls = [
  avatar1,
  avatar2,
  avatar3,
  avatar4,
  avatar5,
  avatar6,
  avatar7,
  avatar8,
  avatar9,
  avatar10,
  avatar11,
  avatar12,
  avatar13,
  avatar14,
  avatar15,
  avatar16,
];

type AccountAvatarProps = {
  size?: number;
  address: string;
  className?: string;
};

export function AccountAvatar({
  size = 30,
  address,
  className,
}: AccountAvatarProps): ReactElement | null {
  const { data: addressIndex } = useGetAddressIndex(address);

  const avatarUrl = useMemo(() => {
    const isServiceAccount = [
      "0xf8d6e0586b0a20c7",
      "0x0000000000000001", // When using monotonic addresses setting
    ].includes(address);

    if (isServiceAccount) {
      return service;
    }

    if (addressIndex === undefined) {
      return undefined;
    }

    return avatarUrls[addressIndex % avatarUrls.length];
  }, [addressIndex]);

  if (avatarUrl === undefined) {
    return <Spinner size={size} />;
  }

  return (
    <img
      className={className}
      style={{
        borderRadius: "50%",
        height: size,
        width: size,
      }}
      alt={address}
      src={avatarUrl}
    />
  );
}
