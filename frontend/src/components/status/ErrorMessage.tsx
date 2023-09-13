import React, { ReactElement } from "react";
import { FlowUtils } from "../../utils/flow-utils";
import classes from "./ErrorMessage.module.scss";
import { JsonView } from "../json-view/JsonView";
import { ExternalLink } from "../links/ExternalLink";
import { Callout } from "../callout/Callout";
import { SizedBox } from "../sized-box/SizedBox";

type ScriptErrorProps = {
  cadenceSource: string;
  errorMessage: string;
};

export function ScriptError(props: ScriptErrorProps): ReactElement {
  const parsedMessage = FlowUtils.parseScriptError(props.errorMessage);

  if (parsedMessage === undefined) {
    return <pre className={classes.root}>{props.errorMessage}</pre>;
  }

  if (parsedMessage.responseBody?.message) {
    return (
      <>
        <UnsupportedImportSyntaxNotice cadenceSource={props.cadenceSource} />
        <pre className={classes.root}>{parsedMessage.responseBody.message}</pre>
      </>
    );
  }

  return (
    <JsonView className={classes.root} name="error" data={parsedMessage} />
  );
}

type TransactionErrorProps = {
  cadenceSource: string;
  errorMessage: string;
};

export function TransactionError(props: TransactionErrorProps): ReactElement {
  return (
    <>
      <UnsupportedImportSyntaxNotice cadenceSource={props.cadenceSource} />
      <pre className={classes.root}>{props.errorMessage}</pre>
    </>
  );
}

type UnsupportedImportSyntaxNoticeProps = {
  cadenceSource: string;
};

function UnsupportedImportSyntaxNotice(
  props: UnsupportedImportSyntaxNoticeProps
) {
  const isUnsupportedSyntax = props.cadenceSource
    .split("\n")
    .some((sourceCodeLine) => /^import ".*"$/.test(sourceCodeLine.trim()));

  if (!isUnsupportedSyntax) {
    return null;
  }

  return (
    <>
      <Callout
        icon="🚨"
        title="Unsupported import syntax"
        description={
          <div>
            <p>
              It looks like the executed Cadence code uses{" "}
              <ExternalLink
                href="https://developers.flow.com/tools/toolchains/flow-cli/super-commands#import-schema"
                inline
              >
                the latest import syntax
              </ExternalLink>{" "}
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              syntax, which isn't supported within Flowser yet.
            </p>
            <p>
              For more details, see:{" "}
              <ExternalLink
                inline
                href="https://github.com/onflow/fcl-js/issues/1765"
              />
            </p>
          </div>
        }
      />
      <SizedBox height={20} />
    </>
  );
}
