import React, { FunctionComponent } from "react";
import FullScreenLoading from "../../common/loaders/FullScreenLoading/FullScreenLoading";
import classes from "./ContractDetails.module.scss";
import {
  DetailsCard,
  DetailsCardColumn,
} from "../../common/cards/DetailsCard/DetailsCard";
import { SizedBox } from "../../common/misc/SizedBox/SizedBox";
import { CadenceEditor } from "../../common/code/CadenceEditor/CadenceEditor";
import { DateDisplay } from "../../common/time/DateDisplay/DateDisplay";
import { ProjectLink } from "../../common/links/ProjectLink";
import { IdeLink } from "../../common/links/IdeLink";
import { useGetContract, useGetTokenMetadataList } from "../../api";
import { ContractName } from "../ContractName/ContractName";
import { ExternalLink } from "../../common/links/ExternalLink/ExternalLink";
import { TokenExtensions } from "flow-native-token-registry";

type ContractDetailsProps = {
  contractId: string;
};

export const ContractDetails: FunctionComponent<ContractDetailsProps> = (
  props,
) => {
  const { contractId } = props;
  const { isLoading, data: contract } = useGetContract(contractId);
  const { data: tokenMetadataList } = useGetTokenMetadataList();

  if (isLoading || !contract) {
    return <FullScreenLoading />;
  }

  const tokenMetadata = tokenMetadataList?.find(
    (token) => token.contractName === contract.name,
  );

  const primaryColumn: DetailsCardColumn = [
    {
      label: "Name",
      value: <ContractName contract={contract} />,
    },
    {
      label: "Account",
      value: (
        <ProjectLink to={`/accounts/${contract.address}`}>
          {contract.address}
        </ProjectLink>
      ),
    },
  ];

  if (contract.localConfig) {
    primaryColumn.push({
      label: "Project path",
      value: <span>{contract.localConfig.relativePath}</span>,
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

  if (tokenMetadata?.extensions) {
    columns.push(buildMetadataUrlsColumn(tokenMetadata.extensions));
  }

  return (
    <div className={classes.root}>
      <DetailsCard columns={columns} />
      <SizedBox height={30} />
      <div className={classes.codeWrapper}>
        {contract.localConfig && (
          <div className={classes.actionButtons}>
            Open in:
            <IdeLink.VsCode filePath={contract.localConfig.absolutePath} />
            <IdeLink.WebStorm filePath={contract.localConfig.absolutePath} />
            <IdeLink.IntellijIdea
              filePath={contract.localConfig.absolutePath}
            />
          </div>
        )}
        <CadenceEditor value={contract.code} editable={false} />
      </div>
    </div>
  );
};

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
