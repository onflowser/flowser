import React, { FunctionComponent } from "react";
import FullScreenLoading from "../../../components/fullscreen-loading/FullScreenLoading";
import { useGetContract } from "../../../hooks/use-api";
import classes from "./ContractDetails.module.scss";
import {
  DetailsCard,
  DetailsCardColumn,
} from "components/details-card/DetailsCard";
import { SizedBox } from "../../../components/sized-box/SizedBox";
import { CadenceEditor } from "../../../components/cadence-editor/CadenceEditor";
import { DateDisplay } from "../../../components/time/DateDisplay/DateDisplay";
import { ProjectLink } from "../../../components/links/ProjectLink";
import { FlowserIcon } from "../../../components/icons/Icons";
import { ExternalLink } from "../../../components/links/ExternalLink";

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
            <ExternalLink
              // https://github.com/Microsoft/vscode-docs/blob/main/docs/editor/command-line.md#opening-vs-code-with-urls
              href={`vscode://file/${contract.localConfig.absolutePath}`}
              inline
            >
              <FlowserIcon.VsCode size={25} />
            </ExternalLink>
            <ExternalLink
              // https://youtrack.jetbrains.com/issue/WEB-54529/How-to-open-the-link-webstorm-file-xxx-1.js11-in-the-browser-to-call-webstorm-to-open-the-code-file-what-is-the-correct-format.
              href={`webstorm://open?file=${contract.localConfig.absolutePath}`}
              inline
            >
              <FlowserIcon.WebStorm size={25} />
            </ExternalLink>
            <ExternalLink
              href={`idea://open?file=${contract.localConfig.absolutePath}`}
              inline
            >
              <FlowserIcon.IntellijIdea size={25} />
            </ExternalLink>
          </div>
        )}
        <CadenceEditor value={contract.code} editable={false} />
      </div>
    </div>
  );
};
