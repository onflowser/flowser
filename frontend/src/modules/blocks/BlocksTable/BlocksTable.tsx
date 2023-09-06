import React, { FunctionComponent, useMemo } from "react";
import Label from "../../../components/label/Label";
import Value from "../../../components/value/Value";
import classes from "./BlocksTable.module.scss";
import { MiddleEllipsis } from "../../../components/ellipsis/MiddleEllipsis";
import { createColumnHelper } from "@tanstack/table-core";
import Table from "../../../components/table/Table";
import { Block } from "@flowser/shared";
import ReactTimeago from "react-timeago";
import { DecoratedPollingEntity } from "contexts/timeout-polling.context";
import { ProjectLink } from "../../../components/links/ProjectLink";

const columnHelper = createColumnHelper<DecoratedPollingEntity<Block>>();

type BlocksTableProps = {
  blocks: DecoratedPollingEntity<Block>[];
};

export const BlocksTable: FunctionComponent<BlocksTableProps> = (props) => {
  const { blocks } = props;

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: () => <Label variant="medium">IDENTIFIER</Label>,
        meta: {
          className: classes.blockID,
        },
        cell: (info) => (
          <Value>
            <ProjectLink to={`/blocks/${info.getValue()}`}>
              <MiddleEllipsis className={classes.hash}>
                {info.getValue()}
              </MiddleEllipsis>
            </ProjectLink>
          </Value>
        ),
      }),
      columnHelper.accessor("height", {
        header: () => <Label variant="medium">HEIGHT</Label>,
        meta: {
          className: classes.blockHeight,
        },
        cell: (info) => <Value>{info.getValue()}</Value>,
      }),
      columnHelper.accessor("timestamp", {
        header: () => <Label variant="medium">CREATED</Label>,
        meta: {
          className: classes.time,
        },
        cell: (info) => (
          <Value>
            <ReactTimeago date={info.getValue()} />
          </Value>
        ),
      }),
    ],
    [blocks]
  );

  return (
    <Table<DecoratedPollingEntity<Block>>
      data={blocks}
      columns={columns}
      headerRowClass={classes.tableRow}
      bodyRowClass={classes.tableRow}
    />
  );
};
