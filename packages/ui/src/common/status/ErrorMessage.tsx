import React, { ReactElement } from "react";
import { FlowUtils } from "../../utils/flow-utils";
import classes from "./ErrorMessage.module.scss";
import { JsonView } from "../code/JsonView/JsonView";
import { ExternalLink } from "../links/ExternalLink/ExternalLink";
import { Callout } from "../misc/Callout/Callout";
import { SizedBox } from "../misc/SizedBox/SizedBox";

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
      <pre className={classes.root}>{parsedMessage.responseBody.message}</pre>
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
    <pre className={classes.root}>{props.errorMessage}</pre>
  );
}
