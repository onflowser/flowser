import React, { ReactElement } from "react";
import { CadenceEditor } from "../../../../components/cadence-editor/CadenceEditor";
import { SimpleButton } from "../../../../components/simple-button/SimpleButton";
import classes from "./InteractionContent.module.scss";
import { useInteractionOutcomeManager } from "../../contexts/outcome.context";
import { InteractionOutcome } from "../outcome/InteractionOutcome";
import { LineSeparator } from "../../../../components/line-separator/LineSeparator";
import { ParamListBuilder } from "../parameters/ParamListBuilder";
import { useInteractionDefinitionManager } from "../../contexts/definition.context";
import { Spinner } from "../../../../components/spinner/Spinner";

export function InteractionContent(): ReactElement {
  const { execute } = useInteractionOutcomeManager();
  const {
    setParameterValueByIdentifier,
    parameterValuesByIdentifier,
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
        <SimpleButton onClick={execute}>Execute</SimpleButton>
        <ParamListBuilder
          parameters={parameters}
          setParameterValueByIdentifier={setParameterValueByIdentifier}
          parameterValuesByIdentifier={parameterValuesByIdentifier}
        />
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
