import React, { FunctionComponent } from "react";
import classes from "./ContractDetails.module.scss";
import {
  DetailsCard,
  DetailsCardColumn,
} from "../../common/cards/DetailsCard/DetailsCard";
import { CadenceEditor } from "../../common/code/CadenceEditor/CadenceEditor";
import { DateDisplay } from "../../common/time/DateDisplay/DateDisplay";
import { ProjectLink } from "../../common/links/ProjectLink/ProjectLink";
import { IdeLink } from "../../common/links/IdeLink";
import {
  useGetEventsByContract,
  useGetFlowConfigContracts,
  useGetTokenMetadataList,
} from "../../api";
import { ContractName } from "../ContractName/ContractName";
import { ExternalLink } from "../../common/links/ExternalLink/ExternalLink";
import { TokenExtensions } from "flow-native-token-registry";
import { StyledTabs } from "../../common/tabs/StyledTabs/StyledTabs";
import { BaseTabItem } from "../../common/tabs/BaseTabs/BaseTabs";
import { FlowConfigContract } from "../../contexts/service-registry.context";
import { FlowContract } from "@onflowser/api";
import { EventsTable } from "../../events/EventsTable/EventsTable";
import { AccountLink } from "../../accounts/AccountLink/AccountLink";
import { Callout } from "../../common/misc/Callout/Callout";

type ContractDetailsProps = {
  contract: FlowContract;
};

export const ContractDetails: FunctionComponent<ContractDetailsProps> = (
  props,
) => {
  const { contract } = props;
  const { data: tokenMetadataList } = useGetTokenMetadataList();
  const { data: flowConfigContracts } = useGetFlowConfigContracts();
  const { data: events } = useGetEventsByContract(contract);

  const tokenMetadata = tokenMetadataList?.find(
    (token) => token.contractName === contract.name,
  );

  const primaryColumn: DetailsCardColumn = [
    {
      label: "Name",
      value: <ContractName contract={contract} />,
    },
    {
      label: "Deployed on",
      value: (
        <ProjectLink to={`/accounts/${contract.address}`}>
          <AccountLink address={contract.address} />
        </ProjectLink>
      ),
    },
  ];

  const flowConfigContract = flowConfigContracts?.find(
    (e) => e.name === contract.name,
  );

  if (flowConfigContract) {
    primaryColumn.push({
      label: "File path",
      value: <span>{flowConfigContract.relativePath}</span>,
    });
  }

  primaryColumn.push(
    {
      label: "Updated date",
      value: <DateDisplay date={contract.updatedAt.toISOString()} />,
    },
    {
      label: "Created date",
      value: <DateDisplay date={contract.createdAt.toISOString()} />,
    },
  );

  const columns: DetailsCardColumn[] = [primaryColumn];

  // This is very naive check if contract implements a FungibleToken interface,
  // but I think in most cases this will work and is sufficient for this use-case.
  const isFungibleTokenContract = /import +FungibleToken/.test(contract.code);
  const isMissingFungibleTokenMetadata =
    flowConfigContract && isFungibleTokenContract && !tokenMetadata;

  if (tokenMetadata?.extensions) {
    columns.push(buildMetadataUrlsColumn(tokenMetadata.extensions));
  }

  const tabs: BaseTabItem[] = [
    {
      id: "code",
      label: "Code",
      content: (
        <ContractCode
          flowConfigContract={flowConfigContract}
          contract={contract}
        />
      ),
    },
    {
      id: "events",
      label: "Events",
      content: <EventsTable events={events ?? []} />,
    },
  ];

  return (
    <div className={classes.root}>
      <DetailsCard columns={columns} />
      {isMissingFungibleTokenMetadata && (
        <Callout
          icon="💡"
          title="Missing metadata"
          description={
            <>
              No existing metadata entry is found for this FungibleToken
              contract. If this is you contract, you may want to add metadata
              for more user-friendly presentation in apps.{" "}
              <ExternalLink href="https://github.com/FlowFans/flow-token-list#adding-new-token" />
            </>
          }
        />
      )}
      <StyledTabs tabs={tabs} />
    </div>
  );
};

function ContractCode(props: {
  flowConfigContract: FlowConfigContract | undefined;
  contract: FlowContract;
}) {
  const { flowConfigContract, contract } = props;
  return (
    <div className={classes.codeWrapper}>
      {flowConfigContract && (
        <div className={classes.actionButtons}>
          Open in:
          <IdeLink.VsCode filePath={flowConfigContract.absolutePath} />
          <IdeLink.WebStorm filePath={flowConfigContract.absolutePath} />
          <IdeLink.IntellijIdea filePath={flowConfigContract.absolutePath} />
        </div>
      )}
      <CadenceEditor value={contract.code} editable={false} />
    </div>
  );
}

function buildMetadataUrlsColumn(
  extensions: TokenExtensions,
): DetailsCardColumn {
  const metadataColumn: DetailsCardColumn = [];

  if (extensions.website) {
    metadataColumn.push({
      label: "Website",
      value: <ExternalLink href={extensions.website} inline />,
    });
  }

  if (extensions.github) {
    metadataColumn.push({
      label: "Github",
      value: <ExternalLink href={extensions.github} inline />,
    });
  }

  if (extensions.discord) {
    metadataColumn.push({
      label: "Discord",
      value: <ExternalLink href={extensions.discord} inline />,
    });
  }

  if (extensions.twitter) {
    metadataColumn.push({
      label: "Twitter",
      value: <ExternalLink href={extensions.twitter} inline />,
    });
  }

  if (extensions.medium) {
    metadataColumn.push({
      label: "Medium",
      value: <ExternalLink href={extensions.medium} inline />,
    });
  }

  if (extensions.coingeckoId) {
    metadataColumn.push({
      label: "CoinGecko",
      value: (
        <ExternalLink
          href={`https://www.coingecko.com/en/coins/${extensions.coingeckoId}`}
          inline
        />
      ),
    });
  }

  return metadataColumn;
}
