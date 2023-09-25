import React, { ReactElement } from "react";
import { InteractionIcon } from "../InteractionIcon/InteractionIcon";
import { SizedBox } from "../../../../components/misc/SizedBox/SizedBox";
import { useGetParsedInteraction } from "../../../../hooks/use-api";
import { Spinner } from "../../../../components/loaders/Spinner/Spinner";
import classes from "./InteractionLabel.module.scss";
import { InteractionKind } from "@flowser/shared";
import { InteractionDefinition } from "modules/interactions/core/core-types";

type InteractionLabelProps = {
  interaction: InteractionDefinition;
};

export function InteractionLabel(props: InteractionLabelProps): ReactElement {
  const { interaction } = props;

  const { data } = useGetParsedInteraction(interaction);

  return (
    <div className={classes.root}>
      <div className={classes.iconWrapper}>
        {data ? (
          <InteractionIcon
            interactionKind={
              data.interaction?.kind ?? InteractionKind.INTERACTION_UNKNOWN
            }
          />
        ) : (
          <Spinner size={15} />
        )}
      </div>
      <SizedBox width={10} inline />
      <span className={classes.label}>{interaction.name}</span>
    </div>
  );
}
