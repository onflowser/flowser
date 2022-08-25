import React, { FunctionComponent } from "react";
import classes from "./KeyListItem.module.scss";
import Card from "../../../components/card/Card";
import Label from "../../../components/label/Label";
import CopyButton from "../../../components/copy-button/CopyButton";
import KeyIcon from "../../../assets/icons/key.svg";
import Badge from "../../../components/badge/Badge";
import Ellipsis from "../../../components/ellipsis/Ellipsis";
import { AccountKey } from "@flowser/types";
import { FlowUtils } from "../../../utils/flow-utils";
import { DecoratedPollingEntity } from "../../../hooks/use-timeout-polling";

type ContentDetailsKeysProps = {
  accountKey: DecoratedPollingEntity<AccountKey>;
};

const KeyListItem: FunctionComponent<ContentDetailsKeysProps> = ({
  accountKey,
}) => {
  return (
    <Card
      className={classes.root}
      showIntroAnimation={accountKey.isNew || accountKey.isUpdated}
      variant="black"
    >
      <Label variant="large">KEY</Label>
      <div>
        <KeyIcon className={classes.keyIcon} />
        <span className={classes.blueBg}>
          <Ellipsis className={classes.hash}>{accountKey.publicKey}</Ellipsis>
        </span>
        <CopyButton value={accountKey.publicKey} />
      </div>
      <div className={classes.badges}>
        <Badge>WEIGHT: {accountKey.weight}</Badge>
        <Badge>SEQ. NUMBER: {accountKey.sequenceNumber}</Badge>
        <Badge>INDEX: {accountKey.index}</Badge>
        <Badge>
          SIGN CURVE: {FlowUtils.getSignatureAlgoName(accountKey.signAlgo)}
        </Badge>
        <Badge>
          HASH ALGO.: {FlowUtils.getHashAlgoName(accountKey.hashAlgo)}
        </Badge>
        <Badge>REVOKED: {accountKey.revoked ? "YES" : "NO"}</Badge>
      </div>
    </Card>
  );
};

export default KeyListItem;
