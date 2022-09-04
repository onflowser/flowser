import React, { useState } from "react";
import classes from "./ExtendableStorageCard.module.scss";
import { DecoratedPollingEntity } from "hooks/use-timeout-polling";
import { AccountStorageItem } from "@flowser/shared/dist/src/generated/entities/accounts";
import { FlowUtils } from "utils/flow-utils";
import classNames from "classnames";

type ExtendableStorageCardProps = {
  content: DecoratedPollingEntity<AccountStorageItem>;
  toggleExtended: (id: string) => void;
};

export function ExtendableStorageCard({
  content,
  toggleExtended,
}: ExtendableStorageCardProps) {
  const [extended, setExtended] = useState(false);
  const extend = () => {
    setExtended((prevState) => !prevState);
  };

  const extendClass = classNames({
    [classes.root]: true,
    [classes.gridItemExtended]: extended,
  });

  const extendClassToggle = classNames({
    [classes.circleOpen]: !extended,
    [classes.circleClosed]: extended,
  });

  const dumyData = {
    flowEpochsDKGAdmin: {
      ResourceType: {
        Location: {
          Type: "AddressLocation",
          Address: "0xf8d6e0586b0a20c7",
          Name: " FlowDKG",
        },
        QualifiedIdentifier: "FlowDKG.Admin",
        Fields: [{ Identifier: "uuid", Type: {} }],
        Initializers: null,
      },
      Fields: [17],
    },
  };

  return (
    <div className={extendClass}>
      <div className={classes.header}>
        <div className={classes.type}>
          {FlowUtils.getLowerCasedPathDomain(content.pathDomain)}
        </div>
        <div
          className={extendClassToggle}
          onClick={() => (extend(), toggleExtended(content.pathIdentifier))}
        >
          {extended ? (
            <div className={classes.iconClosed}>-</div>
          ) : (
            <div className={classes.iconOpen}>+</div>
          )}
        </div>
      </div>
      <div className={classes.body}>
        <div className={classes.content}>
          <div className={classes.title}>{content.pathIdentifier}</div>
          {extended ? (
            <div className={classes.json}>
              <pre className={classes.jsonText}>
                {JSON.stringify(dumyData, undefined, 2)}
              </pre>
            </div>
          ) : (
            <div className={classes.tags}>
              <div className={classes.badge}>ResourceType</div>
              <div className={classes.badge}>
                flowContractAuditVouchersAdmin
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
