import React, { FunctionComponent, useMemo } from "react";
import Label from "../../common/misc/Label/Label";
import Value from "../../common/misc/Value/Value";
import classes from "./BlocksTable.module.scss";
import { MiddleEllipsis } from "../../common/ellipsis/MiddleEllipsis";
import { createColumnHelper } from "@tanstack/table-core";
import { BaseTable } from "../../common/misc/BaseTable/BaseTable";
import { ProjectLink } from "../../common/links/ProjectLink/ProjectLink";
import { TimeAgo } from "../../common/time/TimeAgo/TimeAgo";
import { FlowBlock } from "@onflowser/api";

const columnHelper = createColumnHelper<FlowBlock>();

type BlocksTableProps = {
  blocks: FlowBlock[];
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
    [blocks],
  );

  return (
    <BaseTable<FlowBlock>
      data={blocks}
      columns={columns}
      headerRowClass={classes.tableRow}
      bodyRowClass={classes.tableRow}
    />
  );
};
