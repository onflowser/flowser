import React, { ReactElement } from "react";
import { InteractionIcon } from "../InteractionIcon/InteractionIcon";
import { SizedBox } from "../../../common/misc/SizedBox/SizedBox";
import { useFlowserHooksApi } from "../../../contexts/api-hooks.context";
import { Spinner } from "../../../common/loaders/Spinner/Spinner";
import classes from "./InteractionLabel.module.scss";
import { InteractionDefinition } from "../../core/core-types";

type InteractionLabelProps = {
  interaction: InteractionDefinition;
};

export function InteractionLabel(props: InteractionLabelProps): ReactElement {
  const { interaction } = props;
  const api = useFlowserHooksApi();
  const { data } = api.useGetParsedInteraction(interaction);

  return (
    <div className={classes.root}>
      <div className={classes.iconWrapper}>
        {data ? (
          <InteractionIcon interactionKind={data.interaction.kind} />
        ) : (
          <Spinner size={15} />
        )}
      </div>
      <SizedBox width={10} inline />
      <span className={classes.label}>{interaction.name}</span>
    </div>
  );
}
