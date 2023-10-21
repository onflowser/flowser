import React from "react";
import { ActionDialog } from "../../overlays/dialogs/action/ActionDialog";
import { ReactElement } from "react";
import classes from "./FlowserUsageRequirements.module.scss";
import {
  FlowserUsageRequirement,
  FlowserUsageRequirementType,
} from "@onflowser/api";
import { useGetFlowserUsageRequirements } from "../../../api";

export function FlowserUsageRequirements(): ReactElement | null {
  const { data: missingRequirements } = useGetFlowserUsageRequirements();
  const showModal = missingRequirements && missingRequirements.length > 0;

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
  requirement: FlowserUsageRequirement;
}) {
  return (
    <div className={classes.missingRequirementItem}>
      <b className={classes.title}>{getTitle(requirement)}</b>
      <div>{getDescription(requirement)}</div>
    </div>
  );
}

function getTitle(requirement: FlowserUsageRequirement) {
  switch (requirement.type) {
    case FlowserUsageRequirementType.PROJECT_REQUIREMENT_UNSUPPORTED_FLOW_CLI_VERSION:
      return "Unsupported flow-cli version";
    case FlowserUsageRequirementType.PROJECT_REQUIREMENT_MISSING_FLOW_CLI:
      return "Missing flow-cli";
    default:
      return "Unknown";
  }
}

function getDescription(requirement: FlowserUsageRequirement) {
  const { missingVersionRequirement, type } = requirement;
  switch (type) {
    case FlowserUsageRequirementType.PROJECT_REQUIREMENT_UNSUPPORTED_FLOW_CLI_VERSION:
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
    case FlowserUsageRequirementType.PROJECT_REQUIREMENT_MISSING_FLOW_CLI:
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
