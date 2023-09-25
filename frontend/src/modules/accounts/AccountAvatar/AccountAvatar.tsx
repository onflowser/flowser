import React, { ReactElement, useMemo } from "react";

import service from "../../../assets/images/avatars/service.png";

import avatar1 from "../../../assets/images/avatars/1.jpg";
import avatar2 from "../../../assets/images/avatars/2.jpg";
import avatar3 from "../../../assets/images/avatars/3.jpg";
import avatar4 from "../../../assets/images/avatars/4.jpg";
import avatar5 from "../../../assets/images/avatars/5.jpg";
import avatar6 from "../../../assets/images/avatars/6.jpg";
import avatar7 from "../../../assets/images/avatars/7.jpg";
import avatar8 from "../../../assets/images/avatars/8.jpg";
import avatar9 from "../../../assets/images/avatars/9.jpg";
import avatar10 from "../../../assets/images/avatars/10.jpg";
import avatar11 from "../../../assets/images/avatars/11.jpg";
import avatar12 from "../../../assets/images/avatars/12.jpg";
import avatar13 from "../../../assets/images/avatars/13.jpg";
import avatar14 from "../../../assets/images/avatars/14.jpg";
import avatar15 from "../../../assets/images/avatars/15.jpg";
import avatar16 from "../../../assets/images/avatars/16.jpg";
import { useGetAddressIndex } from "../../../hooks/use-api";
import { Spinner } from "../../../components/loaders/Spinner/Spinner";

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
  const { data } = useGetAddressIndex({
    hexAddress: address,
    chainId: "flow-emulator",
  });

  const avatarUrl = useMemo(() => {
    const isServiceAccount = [
      "0xf8d6e0586b0a20c7",
      "0x0000000000000001", // When using monotonic addresses setting
    ].includes(address);

    if (isServiceAccount) {
      return service;
    }

    if (!data) {
      return undefined;
    }

    return avatarUrls[data.index % avatarUrls.length];
  }, [data]);

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
