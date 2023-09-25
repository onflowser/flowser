import React, { FunctionComponent, useMemo } from "react";
import Label from "../../../components/misc/Label/Label";
import Value from "../../../components/misc/Value/Value";
import classes from "./BlocksTable.module.scss";
import { MiddleEllipsis } from "../../../components/ellipsis/MiddleEllipsis";
import { createColumnHelper } from "@tanstack/table-core";
import { BaseTable } from "../../../components/misc/BaseTable/BaseTable";
import { Block } from "@flowser/shared";
import { DecoratedPollingEntity } from "contexts/timeout-polling.context";
import { ProjectLink } from "../../../components/links/ProjectLink";
import { TimeAgo } from "../../../components/time/TimeAgo/TimeAgo";

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
            <TimeAgo date={info.getValue()} />
          </Value>
        ),
      }),
    ],
    [blocks]
  );

  return (
    <BaseTable<DecoratedPollingEntity<Block>>
      data={blocks}
      columns={columns}
      headerRowClass={classes.tableRow}
      bodyRowClass={classes.tableRow}
    />
  );
};
