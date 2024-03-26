import { createColumnHelper } from "@tanstack/table-core";
import Label from "../../common/misc/Label/Label";
import Value from "../../common/misc/Value/Value";
import { MiddleEllipsis } from "../../common/ellipsis/MiddleEllipsis";
import classes from "./SignaturesTable.module.scss";
import React, { ReactElement } from "react";
import { BaseTable } from "../../common/misc/BaseTable/BaseTable";
import { ProjectLink } from "../../common/links/ProjectLink";
import { SignableObject } from "@onflowser/api";
import { AccountLink } from "../../accounts/AccountLink/AccountLink";

const columnsHelper = createColumnHelper<SignableObject>();

const columns = [
  columnsHelper.accessor("address", {
    header: () => <Label variant="medium">ADDRESS</Label>,
    cell: (info) => (
      <Value>
        <AccountLink address={info.getValue()} />
      </Value>
    ),
  }),
  columnsHelper.accessor("signature", {
    header: () => <Label variant="medium">SIGNATURE</Label>,
    cell: (info) => (
      <Value>
        <MiddleEllipsis className={classes.hash}>
          {info.getValue()}
        </MiddleEllipsis>
      </Value>
    ),
  }),
  columnsHelper.accessor("keyId", {
    header: () => <Label variant="medium">KEY ID</Label>,
    cell: (info) => <Value>{info.getValue()}</Value>,
  }),
];

type SignaturesTableProps = {
  signatures: SignableObject[];
};

export function SignaturesTable(props: SignaturesTableProps): ReactElement {
  return (
    <BaseTable<SignableObject> data={props.signatures} columns={columns} />
  );
}
