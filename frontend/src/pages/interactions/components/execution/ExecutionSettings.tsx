import React, { ReactElement, useEffect } from "react";
import { SizedBox } from "../../../../components/sized-box/SizedBox";
import {
  ParamBuilder,
  ParamListBuilder,
} from "../parameters/ParamBuilder/ParamBuilder";
import {
  CadenceTypeKind,
  FclValue,
  FclValues,
  InteractionKind,
  Parameter,
} from "@flowser/shared";
import classes from "./ExecutionSettings.module.scss";
import { LoaderButton } from "../../../../components/buttons/loader-button/LoaderButton";
import { useInteractionOutcomeManager } from "../../contexts/outcome.context";
import { useInteractionDefinitionManager } from "../../contexts/definition.context";

export function ExecutionSettings(): ReactElement {
  const { execute } = useInteractionOutcomeManager();
  const { setFclValue, fclValuesByIdentifier, parsedInteraction } =
    useInteractionDefinitionManager();

  return (
    <div className={classes.root}>
      <div>
        <h2>Arguments</h2>
        <SizedBox height={20} />
        {parsedInteraction?.parameters?.length === 0 && <div>No arguments</div>}
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
        <LoaderButton loadingContent="Executing" onClick={execute}>
          Execute
        </LoaderButton>
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
