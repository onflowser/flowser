import React, { FunctionComponent } from "react";
import FullScreenLoading from "../../common/loaders/FullScreenLoading/FullScreenLoading";
import { useGetContract } from "../../../../../frontend/src/hooks/use-api";
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

type ContractDetailsProps = {
  contractId: string;
};

export const ContractDetails: FunctionComponent<ContractDetailsProps> = (
  props
) => {
  const { contractId } = props;
  const { isLoading, data } = useGetContract(contractId);
  const { contract } = data ?? {};

  if (isLoading || !contract) {
    return <FullScreenLoading />;
  }

  const rows: DetailsCardColumn = [
    {
      label: "Name",
      value: contract.name,
    },
    {
      label: "Account",
      value: (
        <ProjectLink to={`/accounts/${contract.accountAddress}`}>
          {contract.accountAddress}
        </ProjectLink>
      ),
    },
  ];

  if (contract.localConfig) {
    rows.push({
      label: "Project path",
      value: <span>{contract.localConfig.relativePath}</span>,
    });
  }

  rows.push(
    {
      label: "Updated date",
      value: <DateDisplay date={contract.updatedAt} />,
    },
    {
      label: "Created date",
      value: <DateDisplay date={contract.createdAt} />,
    }
  );

  return (
    <div className={classes.root}>
      <DetailsCard columns={[rows]} />
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
