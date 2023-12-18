import { FLOW_FLIX_URL, useFlixSearch } from "../../../hooks/flix";
import { Shimmer } from "../../../common/loaders/Shimmer/Shimmer";
import classes from "./FlixInfo.module.scss";
import { ExternalLink } from "../../../common/links/ExternalLink/ExternalLink";
import React, { Fragment } from "react";
import { FlowserIcon } from "../../../common/icons/FlowserIcon";
import { LineSeparator } from "../../../common/misc/LineSeparator/LineSeparator";

type FlixInfoProps = {
  sourceCode: string;
}

export function FlixInfo(props: FlixInfoProps) {
  const { data, isLoading } = useFlixSearch({
    sourceCode: props.sourceCode,
    network: "any"
  });

  if (isLoading) {
    return <Shimmer height={150} />;
  }

  const isVerified = data !== undefined;

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
            <p>{data.data.messages.description?.i18n["en-US"]}</p>
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
