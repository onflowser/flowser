import React, { ReactElement } from "react";
import { FlowserIcon } from "../../../common/icons/FlowserIcon";
import classes from "./InteractionIcon.module.scss";
import { InteractionKind } from '@onflowser/api';

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
      return <FlowserIcon.QuestionMark className={classes.questionMark} />;
  }
}
