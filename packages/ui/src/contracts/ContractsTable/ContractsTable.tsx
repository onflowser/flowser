import { createColumnHelper } from "@tanstack/table-core";
import Label from "../../common/misc/Label/Label";
import Value from "../../common/misc/Value/Value";
import { AccountLink } from "../../accounts/AccountLink/AccountLink";
import React, { ReactElement, useMemo } from "react";
import { BaseTable } from "../../common/misc/BaseTable/BaseTable";
import { ProjectLink } from "../../common/links/ProjectLink/ProjectLink";
import { Tooltip } from "../../common/overlays/Tooltip/Tooltip";
import { BaseBadge } from "../../common/misc/BaseBadge/BaseBadge";
import classes from "./ContractsTable.module.scss";
import { TimeAgo } from "../../common/time/TimeAgo/TimeAgo";
import { FlowContract } from "@onflowser/api";
import { ContractName } from "../ContractName/ContractName";
import { useGetFlowConfigContracts } from "../../api";

const columnHelper = createColumnHelper<FlowContract>();

const columns = [
  columnHelper.accessor("name", {
    header: () => <Label variant="medium">NAME</Label>,
    cell: (info) => (
      <Value>
        <ProjectLink to={`/contracts/${info.row.original.id}`}>
          <ContractName contract={info.row.original} />
        </ProjectLink>
      </Value>
    ),
  }),
  columnHelper.accessor("address", {
    header: () => <Label variant="medium">DEPLOYED ON</Label>,
    cell: (info) => (
      <Value>
        <AccountLink address={info.getValue()} />
      </Value>
    ),
  }),
  columnHelper.display({
    id: "tags",
    header: () => "",
    cell: (info) => <ContractTags contract={info.row.original} />,
  }),
  columnHelper.accessor("updatedAt", {
    header: () => <Label variant="medium">UPDATED</Label>,
    cell: (info) => (
      <Value>
        <TimeAgo date={info.getValue()} />
      </Value>
    ),
  }),
  columnHelper.accessor("createdAt", {
    header: () => <Label variant="medium">CREATED</Label>,
    cell: (info) => (
      <Value>
        <TimeAgo date={info.getValue()} />
      </Value>
    ),
  }),
];

function ContractTags(props: { contract: FlowContract }) {
  const { contract } = props;
  const { data: flowConfigContracts } = useGetFlowConfigContracts();
  const flowConfigContract = flowConfigContracts?.find(
    (e) => e.name === contract.name,
  );

  if (flowConfigContract) {
    return (
      <Tooltip
        content="This contract is located in your local project."
        position="right center"
      >
        <BaseBadge className={classes.tag}>Project contract</BaseBadge>
      </Tooltip>
    );
  } else {
    return null;
  }
}

type ContractsTableProps = {
  contracts: FlowContract[];
};

export function ContractsTable(props: ContractsTableProps): ReactElement {
  const { data: flowConfigContracts } = useGetFlowConfigContracts();
  const isContractInConfigLookup = new Set(
    flowConfigContracts?.map((e) => e.name),
  );

  const sortedContracts = useMemo(
    // Local project contracts should be shown first.
    () =>
      props.contracts.sort((contract) =>
        isContractInConfigLookup.has(contract.name) ? -1 : 1,
      ),
    [props.contracts],
  );

  return <BaseTable<FlowContract> columns={columns} data={sortedContracts} />;
}
