import React, { FunctionComponent } from "react";
import classes from "./ContentDetailsKeys.module.scss";
import Card from "../../../components/card/Card";
import Label from "../../../components/label/Label";
import CopyButton from "../../../components/copy-button/CopyButton";
import { ReactComponent as KeyIcon } from "../../../assets/icons/key.svg";
import Badge from "../../../components/badge/Badge";
import Ellipsis from "../../../components/ellipsis/Ellipsis";
import { AccountKey } from "@flowser/types/generated/entities/accounts";
import { getHashAlgoName, getSignatureAlgoName } from "../../../utils/common";

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
