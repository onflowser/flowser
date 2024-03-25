import { Menu } from "@onflowser/ui/src/common/overlays/Menu/Menu";
import { MenuItem, MenuDivider, FocusableItem, MenuHeader } from "@szhsin/react-menu";
import { FlowserIcon } from "@onflowser/ui/src/common/icons/FlowserIcon";
import * as fcl from "@onflow/fcl"
import { useEffect, useState } from "react";
import { FlowNetworkId, FlowUtils } from "@onflowser/core/src/flow-utils";
import { AccountAvatar } from "@onflowser/ui/src/accounts/AccountAvatar/AccountAvatar";
import { AccountName } from "@onflowser/ui/src/accounts/AccountName/AccountName";
import Image from "next/image";
import copy from "copy-to-clipboard";
import toast from "react-hot-toast";
import { SizedBox } from "@onflowser/ui/src/common/misc/SizedBox/SizedBox";
import { Shimmer } from "@onflowser/ui/src/common/loaders/Shimmer/Shimmer";

type FclUser = {
  addr: string | null;
  // Other fields
}

type ProfileDropdownProps = {
  currentNetwork: FlowNetworkId;
}

export function ProfileDropdown(props: ProfileDropdownProps) {
  const { currentNetwork } = props;
  const [signedInUser, setSignedInUser] = useState<FclUser>();
  const iconSize = 15;

  useEffect(() => {
    const unsubscribe = fcl.currentUser().subscribe((user: FclUser) => {
      setSignedInUser(user)
    });
    return () => unsubscribe();
  }, []);

  if (signedInUser?.addr) {
    return (
      <Menu
        position="anchor"
        menuButton={
          <button className="border flex gap-x-[10px] border-gray-500 text-gray-300 items-center p-2 rounded-sm">
            <AccountAvatar address={signedInUser.addr} size={20} />
            <AccountName address={signedInUser.addr} />
            <FlowserIcon.ArrowDown />
          </button>
        }
      >
        <SizedBox height={10} />
        <MenuHeader>
          Connected account
        </MenuHeader>
        <MenuItem
          onClick={() => {
            copy(signedInUser?.addr ?? "");
            toast("Address copied to clipboard!")
          }}
          className="flex justify-between gap-x-2">
          <span>{signedInUser.addr}</span>
          <FlowserIcon.Copy />
        </MenuItem>
        <MenuDivider />
        <MenuHeader>
          View your account on
        </MenuHeader>
        <MenuItem
          className="flex justify-between gap-x-2"
          onClick={() => window.open(FlowUtils.getFlowViewAccountUrl(currentNetwork, signedInUser.addr!), "_blank")}
        >
          <span className="flex gap-x-2 items-center">
            <Image width={iconSize} height={iconSize} src="/flowview.png" alt="flowview logo" />
            FlowView
          </span>
          <FlowserIcon.ExternalLink />
        </MenuItem>
        <MenuItem
          className="flex justify-between gap-x-2"
          onClick={() => window.open(FlowUtils.getContractBrowserAccountUrl(currentNetwork, signedInUser.addr!), "_blank")}
        >
          <span className="flex gap-x-2 items-center">
            <Image width={iconSize} height={iconSize} src="/contractbrowser.png" alt="contractbrowser logo" />
            ContractBrowser
          </span>
          <FlowserIcon.ExternalLink />
        </MenuItem>
        <MenuItem
          className="flex justify-between gap-x-2"
          onClick={() => window.open(FlowUtils.getFlowDiverAccountUrl(currentNetwork, signedInUser.addr!), "_blank")}
        >
          <span className="flex gap-x-2 items-center">
            <Image width={iconSize} height={iconSize} src="/flowdiver.png" alt="flowdiver logo" />
            FlowDiver
          </span>
          <FlowserIcon.ExternalLink />
        </MenuItem>
        <MenuDivider />
        <MenuHeader>
          Actions
        </MenuHeader>
        <MenuItem onClick={() => fcl.reauthenticate()} className="flex justify-between">
          <span>Switch Account</span>
          <FlowserIcon.Switch />
        </MenuItem>
        <MenuItem onClick={() => fcl.unauthenticate()} className="flex justify-between">
          <span>Disconnect</span>
          <FlowserIcon.Exit />
        </MenuItem>
        <SizedBox height={10} />
      </Menu>
    )
  } else {
    return (
      <button onClick={() => fcl.authenticate()} className="border flex gap-x-[10px] border-gray-500 text-gray-300 items-center p-2 rounded-sm">
        <span>Connect</span>
        <FlowserIcon.Connect />
      </button>
    )
  }
}
