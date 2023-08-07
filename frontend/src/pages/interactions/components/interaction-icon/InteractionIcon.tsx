import React, { ReactElement } from "react";
import { InteractionKind } from "@flowser/shared";
import { FlowserIcon } from "../../../../components/icons/Icons";
import classes from "./InteractionIcon.module.scss";

type InteractionIconProps = {
  interactionKind: InteractionKind;
};

export function InteractionIcon(props: InteractionIconProps): ReactElement {
  switch (props.interactionKind) {
    case InteractionKind.INTERACTION_SCRIPT:
      return <FlowserIcon.Script className={classes.script} />;
    case InteractionKind.INTERACTION_TRANSACTION:
      return <FlowserIcon.Transaction className={classes.transaction} />;
    default:
      return <span>❓</span>;
  }
}
