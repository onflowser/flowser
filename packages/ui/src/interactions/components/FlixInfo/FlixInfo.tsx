import {
  FLIX_TEMPLATE_NOT_FOUND,
  FLOW_FLIX_URL,
  useFlixSearch,
  useFlixTemplateAuditors
} from "../../../hooks/use-flix";
import { Shimmer } from "../../../common/loaders/Shimmer/Shimmer";
import classes from "./FlixInfo.module.scss";
import { ExternalLink } from "../../../common/links/ExternalLink/ExternalLink";
import React, { Fragment } from "react";
import { FlowserIcon } from "../../../common/icons/FlowserIcon";
import { LineSeparator } from "../../../common/misc/LineSeparator/LineSeparator";
import { InteractionDefinition } from "../../core/core-types";
import { FlixUtils } from "@onflowser/core";

type FlixInfoProps = {
  interaction: InteractionDefinition
}

export function FlixInfo(props: FlixInfoProps) {
  const { data, error } = useFlixSearch({
    interaction: props.interaction,
  });

  if (error) {
    return (
      <div className={classes.root}>
        <span className={classes.error}>FLIX error: {error?.message || String(error)}</span>
      </div>
    )
  }

  if (data === undefined) {
    return <Shimmer height={150} />;
  }

  const isVerified = data !== FLIX_TEMPLATE_NOT_FOUND;

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <ExternalLink className={classes.title} inline href="https://developers.flow.com/build/advanced-concepts/flix">
          FLIX:
        </ExternalLink>
        {isVerified ? (
          <Fragment>
            verified
            <FlowserIcon.VerifiedCheck className={classes.verifiedIcon} />
          </Fragment>
        ) : (
          <Fragment>
            unverified
            <FlowserIcon.CircleCross className={classes.unverifiedIcon} />
          </Fragment>
        )}
      </div>
      <LineSeparator horizontal />
      <div className={classes.body}>
        {isVerified ? (
          <Fragment>
            <AuditInfo templateId={data.id} />
            <p>{FlixUtils.getDescription(data)}</p>
            <ExternalLink inline href={`${FLOW_FLIX_URL}/v1/templates/${data.id}`} />
          </Fragment>
        ) : (
          <Fragment>
            <p>
              This interaction is not yet verified by FLIX.
            </p>
            <ExternalLink
              inline
              href="https://github.com/onflow/flow-interaction-template-service#-propose-interaction-template"
            >
              Submit for verification
            </ExternalLink>
          </Fragment>
        )}
      </div>
    </div>
  );
}

function AuditInfo(props: {templateId: string}) {
  const {data} = useFlixTemplateAuditors({
    templateId: props.templateId,
    // Use mainnet for now, as mainnet likely has the most audits.
    network: "mainnet"
  });

  if (!data || data.length === 0) {
    // FLIX templates are treated as being more trustworthy/verified,
    // even if no official audits were performed.
    // For now just ignore the case where no audits exist.
    return null;
  }

  return (
    <div>
      Audited by:
      {data.map((auditor) =>
        <ExternalLink href={auditor.twitter_url} inline>
          {auditor.name}
        </ExternalLink>
      )}
    </div>
  )
}
