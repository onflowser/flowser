import React, { ReactElement, useEffect } from "react";
import { CadenceEditor } from "../../../../components/cadence-editor/CadenceEditor";
import { SimpleButton } from "../../../../components/buttons/simple-button/SimpleButton";
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
import {
  CadenceTypeKind,
  FclValue,
  FclValues,
  InteractionKind,
  Parameter,
} from "@flowser/shared";
import { useInteractionRegistry } from "../../contexts/interaction-registry.context";
import { LoaderButton } from "../../../../components/buttons/loader-button/LoaderButton";

export function InteractionContent(): ReactElement {
  const { persist } = useInteractionRegistry();
  const { execute } = useInteractionOutcomeManager();
  const {
    setFclValue,
    fclValuesByIdentifier,
    definition,
    parsedInteraction,
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
        <SizedBox height={20} />
        <div className={classes.details}>
          <InteractionDetails />
        </div>
      </div>
      <LineSeparator vertical />
      <div className={classes.sidebar}>
        <div>
          <h2>Arguments</h2>
          <SizedBox height={20} />
          {parsedInteraction?.parameters?.length === 0 && (
            <div>No arguments</div>
          )}
          <ParamListBuilder
            parameters={parsedInteraction?.parameters ?? []}
            setFclValue={setFclValue}
            fclValuesByIdentifier={fclValuesByIdentifier}
          />
          <SizedBox height={30} />
          {parsedInteraction?.kind ===
            InteractionKind.INTERACTION_TRANSACTION && <SigningSettings />}
        </div>
        <div className={classes.bottom}>
          <SimpleButton
            className={classes.button}
            onClick={() => persist(definition.id)}
          >
            Save
          </SimpleButton>
          <LoaderButton
            className={classes.button}
            loadingContent="Executing"
            onClick={execute}
          >
            Execute
          </LoaderButton>
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
      <h2>Signing</h2>
      <SizedBox height={20} />
      <ParamBuilder
        parameter={Parameter.fromPartial({
          identifier: "Proposer",
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
          identifier: "Payer",
          type: {
            kind: CadenceTypeKind.CADENCE_TYPE_ADDRESS,
          },
        })}
        value={definition.transactionOptions.payerAddress}
        setValue={(payerAddress) =>
          setTransactionOptions({ payerAddress: payerAddress as string })
        }
      />
      <AuthorizerSettings />
    </>
  );
}

// TODO(feature-interact-screen): Validate that unique addresses are chosen
function AuthorizerSettings() {
  const { definition, setTransactionOptions, parsedInteraction } =
    useInteractionDefinitionManager();
  const authorizerAddresses =
    definition.transactionOptions.authorizerAddresses ?? [];

  const expectedAuthorizerCount =
    parsedInteraction?.transaction?.authorizerCount ?? 0;

  useEffect(() => {
    if (expectedAuthorizerCount !== authorizerAddresses.length) {
      setTransactionOptions({
        authorizerAddresses: Array.from({
          length: expectedAuthorizerCount,
        }).map(() => ""),
      });
    }
  }, [expectedAuthorizerCount, authorizerAddresses]);

  function setProposerByIndex(address: FclValue, index: number) {
    if (!FclValues.isFclAddressValue(address)) {
      throw new Error("Expected address value");
    }
    const newAuthorizers = [...authorizerAddresses];
    newAuthorizers[index] = address;
    setTransactionOptions({
      authorizerAddresses: newAuthorizers,
    });
  }

  return (
    <div>
      {authorizerAddresses.map((proposer, index) => (
        <>
          <SizedBox height={12} />
          <ParamBuilder
            key={index}
            parameter={Parameter.fromPartial({
              identifier: `Authorizer ${index + 1}`,
              type: {
                kind: CadenceTypeKind.CADENCE_TYPE_ADDRESS,
              },
            })}
            value={proposer}
            setValue={(payerAddress) => setProposerByIndex(payerAddress, index)}
          />
        </>
      ))}
    </div>
  );
}

function InteractionDetails() {
  const { parseError, isParsing } = useInteractionDefinitionManager();

  if (isParsing) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Spinner size={50} />
      </div>
    );
  }

  if (parseError) {
    return <pre>{parseError}</pre>;
  }

  return <InteractionOutcome />;
}
