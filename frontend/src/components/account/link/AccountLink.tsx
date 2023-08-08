import React, { ReactElement } from "react";
import { NavLink } from "react-router-dom";
import { AccountAvatar } from "../avatar/AccountAvatar";
import { AccountName } from "../name/AccountName";
import classes from "./AccountLink.module.scss";

type AccountLinkProps = {
  address: string;
};

export function AccountLink(props: AccountLinkProps): ReactElement {
  const { address } = props;
  return (
    <NavLink to={`/accounts/details/${address}`} className={classes.root}>
      <AccountAvatar address={address} size={25} />
      <AccountName address={address} />
    </NavLink>
  );
}
