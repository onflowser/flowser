import React, { ReactElement } from "react";
import { CadenceEditor } from "../../../../components/cadence-editor/CadenceEditor";
import { SimpleButton } from "../../../../components/simple-button/SimpleButton";
import classes from "./InteractionContent.module.scss";
import { useInteractionOutcomeManager } from "../../contexts/outcome.context";
import { InteractionOutcome } from "../outcome/InteractionOutcome";
import { LineSeparator } from "../../../../components/line-separator/LineSeparator";
import { ParamListBuilder } from "../parameters/ParamListBuilder";

export function InteractionContent(): ReactElement {
  const { definition, updateCadenceSource, execute } =
    useInteractionOutcomeManager();

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <div className={classes.code}>
          <CadenceEditor
            value={definition.sourceCode}
            onChange={(sourceCode) => updateCadenceSource(sourceCode)}
          />
        </div>
        <LineSeparator horizontal />
        <div className={classes.details}>
          <InteractionOutcome />
        </div>
      </div>
      <LineSeparator vertical />
      <div className={classes.sidebar}>
        <SimpleButton onClick={execute}>Execute</SimpleButton>
        <ParamListBuilder parameterTypes={definition.parameterTypes} />
      </div>
    </div>
  );
}
