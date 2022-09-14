import React from "react";
import { ActionDialog } from "../action-dialog/ActionDialog";
import { useGetProjectRequirements } from "../../hooks/use-api";
import { ReactElement } from "react";
import { ProjectRequirement, ProjectRequirementType } from "@flowser/shared";
import classes from "./ProjectRequirements.module.scss";

export function ProjectRequirements(): ReactElement | null {
  const { data } = useGetProjectRequirements();
  const { missingRequirements } = data ?? { missingRequirements: [] };
  const showModal = missingRequirements.length > 0;

  if (!showModal) {
    return null;
  }

  return (
    <ActionDialog title="Missing requirements" onClose={() => null}>
      <>
        {missingRequirements.map((requirement) => (
          <MissingRequirementItem
            key={requirement.type}
            requirement={requirement}
          />
        ))}
      </>
    </ActionDialog>
  );
}

function MissingRequirementItem({
  requirement,
}: {
  requirement: ProjectRequirement;
}) {
  return (
    <div className={classes.missingRequirementItem}>
      <b className={classes.title}>{getTitle(requirement)}</b>
      <div>{getDescription(requirement)}</div>
    </div>
  );
}

function getTitle(requirement: ProjectRequirement) {
  switch (requirement.type) {
    case ProjectRequirementType.PROJECT_REQUIREMENT_UNSUPPORTED_FLOW_CLI_VERSION:
      return "Unsupported flow-cli version";
    case ProjectRequirementType.PROJECT_REQUIREMENT_MISSING_FLOW_CLI:
      return "Missing flow-cli";
    default:
      return "Unknown";
  }
}

function getDescription(requirement: ProjectRequirement) {
  const { missingVersionRequirement, type } = requirement;
  switch (type) {
    case ProjectRequirementType.PROJECT_REQUIREMENT_UNSUPPORTED_FLOW_CLI_VERSION:
      return (
        <>
          <p className={classes.description}>
            Found{" "}
            <code>flow-cli@{missingVersionRequirement?.foundVersion}</code>, but
            the minimum required version is{" "}
            <code>
              flow-cli@{missingVersionRequirement?.minSupportedVersion}
            </code>
            .
          </p>
          <p className={classes.description}>
            Please update flow-cli too to the latest version to use Flowser. See
            the{" "}
            <a
              href="https://developers.flow.com/tools/flow-cli/install"
              target="_blank"
              rel="noreferrer"
            >
              installation instructions
            </a>{" "}
            to learn more.
          </p>
        </>
      );
    case ProjectRequirementType.PROJECT_REQUIREMENT_MISSING_FLOW_CLI:
      return (
        <>
          <p className={classes.description}>
            We couldn{`'`}t find a flow-cli installation on your local machine.
          </p>
          <p className={classes.description}>
            Please install flow-cli to use Flowser. See the{" "}
            <a
              href="https://developers.flow.com/tools/flow-cli/install"
              target="_blank"
              rel="noreferrer"
            >
              installation instructions
            </a>{" "}
            to learn more.
          </p>
        </>
      );
    default:
      return "Unknown";
  }
}
