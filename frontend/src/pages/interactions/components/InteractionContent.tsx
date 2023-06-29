import React, { ReactElement } from "react";
import {
  FlowInteraction,
  useSingleInteractionCRUD,
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
  const { value, update } = useSingleInteractionCRUD(props.interaction.id);

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <div className={classes.code}>
          <CadenceEditor
            value={value.code}
            onChange={(code) => update({ code })}
          />
        </div>
        <div className={classes.details}>
          <DetailsSection />
        </div>
      </div>
      <div className={classes.sidebar}>
        <ArgumentsSidebar />
      </div>
    </div>
  );
}

function DetailsSection() {
  return <div>Details</div>;
}

function ArgumentsSidebar() {
  return (
    <div>
      <SimpleButton>Execute</SimpleButton>
    </div>
  );
}
