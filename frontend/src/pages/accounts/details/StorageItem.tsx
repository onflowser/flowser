import React, { FunctionComponent } from "react";
import classes from "./StorageItem.module.scss";
import Card from "../../../components/card/Card";
import Label from "../../../components/label/Label";
import { AccountStorageItem } from "@flowser/shared";
import { DecoratedPollingEntity } from "../../../hooks/use-timeout-polling";
import Value from "../../../components/value/Value";
import { FlowUtils } from "../../../utils/flow-utils";

type ContentDetailsKeysProps = {
  storageItem: DecoratedPollingEntity<AccountStorageItem>;
};

// TODO(milestone-5): this is a temporary storage item view, should be replaced with the on in design
const StorageItem: FunctionComponent<ContentDetailsKeysProps> = ({
  storageItem,
}) => {
  const domain = FlowUtils.getLowerCasedPathDomain(storageItem.pathDomain);
  return (
    <Card
      className={classes.root}
      showIntroAnimation={storageItem.isNew || storageItem.isUpdated}
      variant="black"
    >
      <div style={{ flex: 1 }}>
        <Label>DOMAIN</Label>
        <Value>{domain}</Value>
      </div>
      <div style={{ flex: 2 }}>
        <Label>IDENTIFIER</Label>
        <Value>{storageItem.pathIdentifier}</Value>
      </div>
      <div style={{ flex: 6 }}>
        <Label>DATA</Label>
        <Value>
          <pre style={{ whiteSpace: "nowrap" }}>
            {JSON.stringify(storageItem.data) ?? "-"}
          </pre>
        </Value>
      </div>
    </Card>
  );
};

export default StorageItem;
