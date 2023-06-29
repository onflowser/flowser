import React, { ReactElement } from "react";
import {
  FlowInteraction,
  useSingleInteraction,
} from "../../../contexts/interactions.context";
import { CadenceEditor } from "../../../components/cadence-editor/CadenceEditor";
import { SimpleButton } from "../../../components/simple-button/SimpleButton";
import classes from "./InteractionContent.module.scss";

type InteractionContentProps = {
  interaction: FlowInteraction;
};

export function InteractionContent(
  props: InteractionContentProps
): ReactElement {
  const { interaction, update, execute } = useSingleInteraction(
    props.interaction.id
  );

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <div className={classes.code}>
          <CadenceEditor
            value={interaction.code}
            onChange={(code) => update({ code })}
          />
        </div>
        <div className={classes.details}>
          <div>Details...</div>
        </div>
      </div>
      <div className={classes.sidebar}>
        <SimpleButton onClick={execute}>Execute</SimpleButton>
      </div>
    </div>
  );
}
