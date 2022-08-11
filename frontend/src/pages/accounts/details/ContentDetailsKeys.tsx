import React, { FunctionComponent } from "react";
import classes from "./ContentDetailsKeys.module.scss";
import Card from "../../../shared/components/card/Card";
import Label from "../../../shared/components/label/Label";
import CopyButton from "../../../shared/components/copy-button/CopyButton";
import { ReactComponent as KeyIcon } from "../../../shared/assets/icons/key.svg";
import Badge from "../../../shared/components/badge/Badge";
import Ellipsis from "../../../shared/components/ellipsis/Ellipsis";
import { AccountKey } from "@flowser/types/generated/entities/accounts";
import {
  getHashAlgoName,
  getSignatureAlgoName,
} from "../../../shared/functions/utils";

type ContentDetailsKeysProps = {
  keys: AccountKey[];
};

const ContentDetailsKeys: FunctionComponent<ContentDetailsKeysProps> = ({
  keys,
}) => {
  return (
    <>
      {keys.map((key, index) => (
        <Card key={index} className={classes.root} variant="black">
          <Label variant="large">KEY</Label>
          <div>
            <KeyIcon className={classes.keyIcon} />
            <span className={classes.blueBg}>
              <Ellipsis className={classes.hash}>{key.publicKey}</Ellipsis>
            </span>
            <CopyButton value={key.publicKey} />
          </div>
          <div className={classes.badges}>
            <Badge>WEIGHT: {key.weight}</Badge>
            <Badge>SEQ. NUMBER: {key.sequenceNumber}</Badge>
            <Badge>INDEX: {key.index}</Badge>
            <Badge>SIGN CURVE: {getSignatureAlgoName(key.signAlgo)}</Badge>
            <Badge>HASH ALGO.: {getHashAlgoName(key.hashAlgo)}</Badge>
            <Badge>REVOKED: {key.revoked ? "YES" : "NO"}</Badge>
          </div>
        </Card>
      ))}
    </>
  );
};

export default ContentDetailsKeys;
