import React, { ReactElement } from "react";
import { InteractionIcon } from "../interaction-icon/InteractionIcon";
import { SizedBox } from "../../../../components/sized-box/SizedBox";
import { CoreInteractionDefinition } from "../../contexts/interaction-registry.context";
import { useGetParsedInteraction } from "../../../../hooks/use-api";
import { Spinner } from "../../../../components/spinner/Spinner";
import classes from "./InteractionLabel.module.scss";
import { InteractionKind } from "@flowser/shared";

type InteractionLabelProps = {
  interaction: CoreInteractionDefinition;
};

export function InteractionLabel(props: InteractionLabelProps): ReactElement {
  const { interaction } = props;

  const { data } = useGetParsedInteraction({
    sourceCode: interaction.sourceCode,
  });

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
      <span>{interaction.name}</span>
    </div>
  );
}
