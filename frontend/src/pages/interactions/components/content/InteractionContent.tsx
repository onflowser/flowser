import React, { ReactElement } from "react";
import { CadenceEditor } from "../../../../components/cadence-editor/CadenceEditor";
import { SimpleButton } from "../../../../components/simple-button/SimpleButton";
import classes from "./InteractionContent.module.scss";
import { useInteractionOutcomeManager } from "../../contexts/outcome.context";
import { InteractionOutcome } from "../outcome/InteractionOutcome";
import { LineSeparator } from "../../../../components/line-separator/LineSeparator";
import { ParamListBuilder } from "../parameters/ParamListBuilder/ParamListBuilder";
import { useInteractionDefinitionManager } from "../../contexts/definition.context";
import { Spinner } from "../../../../components/spinner/Spinner";
import { SizedBox } from "../../../../components/sized-box/SizedBox";

export function InteractionContent(): ReactElement {
  const { execute } = useInteractionOutcomeManager();
  const {
    setFclValue,
    fclValuesByIdentifier,
    parameters,
    definition,
    setSourceCode,
  } = useInteractionDefinitionManager();

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <div className={classes.code}>
          <CadenceEditor
            value={definition.sourceCode}
            onChange={(sourceCode) => setSourceCode(sourceCode)}
          />
        </div>
        <LineSeparator horizontal />
        <div className={classes.details}>
          <InteractionDetails />
        </div>
      </div>
      <LineSeparator vertical />
      <div className={classes.sidebar}>
        <div>
          <h3>Arguments</h3>
          <SizedBox height={20} />
          <ParamListBuilder
            parameters={parameters}
            setFclValue={setFclValue}
            fclValuesByIdentifier={fclValuesByIdentifier}
          />
        </div>
        <div className={classes.bottom}>
          <SimpleButton className={classes.button} onClick={execute}>
            Execute
          </SimpleButton>
        </div>
      </div>
    </div>
  );
}

function InteractionDetails() {
  const { parseError, isParsing } = useInteractionDefinitionManager();

  if (isParsing) {
    return <Spinner size={20} />;
  }

  if (parseError) {
    return <pre>{parseError}</pre>;
  }

  return <InteractionOutcome />;
}
