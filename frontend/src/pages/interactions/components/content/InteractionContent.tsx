import React, { ReactElement } from "react";
import { CadenceEditor } from "../../../../components/cadence-editor/CadenceEditor";
import { SimpleButton } from "../../../../components/simple-button/SimpleButton";
import classes from "./InteractionContent.module.scss";
import { useInteractionOutcomeManager } from "../../contexts/outcome.context";
import { InteractionOutcome } from "../outcome/InteractionOutcome";
import { LineSeparator } from "../../../../components/line-separator/LineSeparator";
import {
  ParamBuilder,
  ParamListBuilder,
} from "../parameters/ParamBuilder/ParamBuilder";
import { useInteractionDefinitionManager } from "../../contexts/definition.context";
import { Spinner } from "../../../../components/spinner/Spinner";
import { SizedBox } from "../../../../components/sized-box/SizedBox";
import { CadenceTypeKind, InteractionKind, Parameter } from "@flowser/shared";
import { useInteractionRegistry } from "../../contexts/interaction-registry.context";

export function InteractionContent(): ReactElement {
  const { persist } = useInteractionRegistry();
  const { execute } = useInteractionOutcomeManager();
  const {
    setFclValue,
    fclValuesByIdentifier,
    parameters,
    definition,
    interactionKind,
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
          {parameters.length === 0 && <div>No arguments</div>}
          <ParamListBuilder
            parameters={parameters}
            setFclValue={setFclValue}
            fclValuesByIdentifier={fclValuesByIdentifier}
          />
          <SizedBox height={30} />
          {interactionKind === InteractionKind.INTERACTION_TRANSACTION && (
            <SigningSettings />
          )}
        </div>
        <div className={classes.bottom}>
          <SimpleButton
            className={classes.button}
            onClick={() => persist(definition.id)}
          >
            Save
          </SimpleButton>
          <SimpleButton className={classes.button} onClick={execute}>
            Execute
          </SimpleButton>
        </div>
      </div>
    </div>
  );
}

function SigningSettings() {
  const { definition, setTransactionOptions } =
    useInteractionDefinitionManager();
  return (
    <>
      <h3>Signing</h3>
      <SizedBox height={20} />
      <ParamBuilder
        parameter={Parameter.fromPartial({
          identifier: "proposer",
          type: {
            kind: CadenceTypeKind.CADENCE_TYPE_ADDRESS,
          },
        })}
        value={definition.transactionOptions.proposerAddress}
        setValue={(proposerAddress) =>
          setTransactionOptions({
            proposerAddress: proposerAddress as string,
          })
        }
      />
      <SizedBox height={12} />
      <ParamBuilder
        parameter={Parameter.fromPartial({
          identifier: "payer",
          type: {
            kind: CadenceTypeKind.CADENCE_TYPE_ADDRESS,
          },
        })}
        value={definition.transactionOptions.payerAddress}
        setValue={(payerAddress) =>
          setTransactionOptions({ payerAddress: payerAddress as string })
        }
      />
    </>
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
