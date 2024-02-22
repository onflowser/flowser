import React, { ReactElement } from "react";
import { InteractionIcon } from "../InteractionIcon/InteractionIcon";
import { SizedBox } from "../../../common/misc/SizedBox/SizedBox";
import { Spinner } from "../../../common/loaders/Spinner/Spinner";
import classes from "./InteractionLabel.module.scss";
import { InteractionDefinition } from "../../core/core-types";
import { useGetParsedInteraction } from "../../../api";
import { InteractionKind } from "@onflowser/api";
import { Shimmer } from "../../../common/loaders/Shimmer/Shimmer";

type InteractionLabelProps = {
  interaction: Pick<InteractionDefinition, "code" | "id">;
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
          <Shimmer height={20} width={20} />
        )}
      </div>
      <SizedBox width={10} inline />
      <span className={classes.label}>
        {interaction ? interaction.name : <Shimmer height={20} width={100} />}
      </span>
    </div>
  );
}
