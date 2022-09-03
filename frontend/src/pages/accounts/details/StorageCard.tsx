import React, { ReactElement } from "react";
import classes from "./StorageCard.module.scss";
import { StorageBadge } from "./StorageBadge";
import { NavLink } from "react-router-dom";
import { ReactComponent as LinkIcon } from "../../../assets/icons/link.svg";
import { DecoratedPollingEntity } from "hooks/use-timeout-polling";
import { AccountStorageItem } from "@flowser/shared/dist/src/generated/entities/accounts";
import { FlowUtils } from "utils/flow-utils";

type StorageCardProps = {
  content: DecoratedPollingEntity<AccountStorageItem>;
};

export function StorageCard({ content }: StorageCardProps) {
  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <StorageBadge
          text={FlowUtils.getLowerCasedPathDomain(content.pathDomain)}
        />

        <div className={classes.identifier}>{content.pathIdentifier}</div>
        <NavLink className={classes.link} to={"#"}>
          <LinkIcon />
          <div className={classes.linkText}>
            {content.data && content.data.TargetPath.Identifier}
          </div>
        </NavLink>
        <div className={classes.bottomText}>
          \u0026A.f8d6e0586b0a20c7.LockedTokens.TokenAdminCollection
        </div>
      </div>
    </div>
  );
}
