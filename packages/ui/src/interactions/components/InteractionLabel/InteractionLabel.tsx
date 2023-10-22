import React, { ReactElement } from "react";
import { InteractionIcon } from "../InteractionIcon/InteractionIcon";
import { SizedBox } from "../../../common/misc/SizedBox/SizedBox";
import { Spinner } from "../../../common/loaders/Spinner/Spinner";
import classes from "./InteractionLabel.module.scss";
import { InteractionDefinition } from "../../core/core-types";
import { useGetParsedInteraction } from "../../../api";

type InteractionLabelProps = {
  interaction: InteractionDefinition;
};

export function InteractionLabel(props: InteractionLabelProps): ReactElement {
  const { interaction } = props;
  const { data } = useGetParsedInteraction(interaction);

  if (!data) {
      return <Spinner size={15} />;
  }

  if (!data.interaction) {
      return <pre>{data.error}</pre>
  }

  return (
    <div className={classes.root}>
      <div className={classes.iconWrapper}>
        <InteractionIcon interactionKind={data.interaction.kind} />
      </div>
      <SizedBox width={10} inline />
      <span className={classes.label}>{interaction.name}</span>
    </div>
  );
}
