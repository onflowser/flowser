import React, { ReactElement, useEffect } from "react";
import { SizedBox } from "../../../common/misc/SizedBox/SizedBox";
import { ParamBuilder, ParamListBuilder } from "../ParamBuilder/ParamBuilder";
import {
  CadenceTypeKind,
  FclValue,
  FclValues,
  InteractionKind,
  Parameter,
} from "@flowser/shared";
import classes from "./ExecutionSettings.module.scss";
import { LoaderButton } from "../../../common/buttons/LoaderButton/LoaderButton";
import { useInteractionOutcomeManager } from "../../contexts/outcome.context";
import { useInteractionDefinitionManager } from "../../contexts/definition.context";
import { Callout } from "../../../common/misc/Callout/Callout";
import { ExternalLink } from "../../../common/links/ExternalLink/ExternalLink";
import { TransactionOptions } from "packages/ui/src/interactions/core/core-types";

export function ExecutionSettings(): ReactElement {
  return (
    <div className={classes.root}>
      <div className={classes.top}>
        <TopContent />
      </div>
      <div className={classes.bottom}>
        <ExecuteButton />
      </div>
    </div>
  );
}

function ExecuteButton() {
  const { execute } = useInteractionOutcomeManager();
  const { parsedInteraction } = useInteractionDefinitionManager();

  const isKnownInteraction =
    parsedInteraction &&
    parsedInteraction.kind !== InteractionKind.INTERACTION_UNKNOWN;

  return (
    <LoaderButton
      loadingContent="Executing"
      onClick={execute}
      disabled={!isKnownInteraction}
    >
      Execute
    </LoaderButton>
  );
}

function TopContent() {
  const { setFclValue, fclValuesByIdentifier, definition, parsedInteraction } =
    useInteractionDefinitionManager();

  if (definition.code === "") {
    return <EmptyInteractionHelp />;
  }

  if (
    // Parsed interaction isn't defined if parsing fails.
    !parsedInteraction ||
    parsedInteraction?.kind === InteractionKind.INTERACTION_UNKNOWN
  ) {
    return <UnknownInteractionHelp />;
  }

  return (
    <>
      <div>
        <h2>Arguments</h2>
        <SizedBox height={20} />
        {parsedInteraction?.parameters.length === 0 && <NoArgumentsHelp />}
      </div>
      <ParamListBuilder
        parameters={parsedInteraction?.parameters ?? []}
        setFclValue={setFclValue}
        fclValuesByIdentifier={fclValuesByIdentifier}
      />
      <SizedBox height={30} />
      {parsedInteraction?.kind === InteractionKind.INTERACTION_TRANSACTION && (
        <SigningSettings />
      )}
    </>
  );
}

function EmptyInteractionHelp() {
  return (
    <Callout
      icon="💡"
      title="Interacting with the blockchain"
      description={
        <div>
          <p>
            Cadence transactions or scripts are used to interact with the Flow
            blockchain.
          </p>
          <SizedBox height={10} />
          <p>
            <b>
              <ExternalLink
                inline
                href="https://developers.flow.com/cadence/language/transactions"
              >
                Transactions
              </ExternalLink>
            </b>{" "}
            can be used to trigger state changes, while{" "}
            <b>
              <ExternalLink
                inline
                href="https://developers.flow.com/tooling/fcl-js/scripts"
              >
                scripts
              </ExternalLink>
            </b>{" "}
            are used for reading existing state from the blockchain.
          </p>
        </div>
      }
    />
  );
}

function UnknownInteractionHelp() {
  return (
    <Callout
      icon="❓"
      title="Unknown interaction"
      description={
        <div>
          <p>
            This interaction is neither a transaction or script. To learn more,
            head over to the official Flow documentation.
          </p>
          <SizedBox height={10} />
          <ExternalLink href="https://developers.flow.com/cadence/language/transactions">
            Transactions docs
          </ExternalLink>
          <ExternalLink href="https://developers.flow.com/tooling/fcl-js/scripts">
            Scripts docs
          </ExternalLink>
        </div>
      }
    />
  );
}

function NoArgumentsHelp() {
  const { parsedInteraction } = useInteractionDefinitionManager();
  switch (parsedInteraction?.kind) {
    case InteractionKind.INTERACTION_TRANSACTION:
      return (
        <Callout
          icon="💡"
          title="Transaction without parameters"
          description={
            <div>
              <p>
                Parameters allow you to inject values without having to specify
                them in code.
              </p>
              <SizedBox height={10} />
              <ExternalLink href="https://developers.flow.com/cadence/language/transactions#transaction-parameters">
                Learn more in Flow docs
              </ExternalLink>
            </div>
          }
        />
      );
    case InteractionKind.INTERACTION_SCRIPT:
      return (
        <Callout
          icon="💡"
          title="Script without parameters"
          description={
            <div>
              <p>
                Parameters allow you to inject values without having to specify
                them in code.
              </p>
              <SizedBox height={10} />
              <ExternalLink href="https://developers.flow.com/cadence/language/transactions#transaction-parameters">
                Learn more in Flow docs
              </ExternalLink>
            </div>
          }
        />
      );
    default:
      return null;
  }
}

const initialTransactionOptions: TransactionOptions = {
  authorizerAddresses: [],
  proposerAddress: "",
  payerAddress: "",
};

function SigningSettings() {
  const { definition, partialUpdate } = useInteractionDefinitionManager();

  function setTransactionOptions(options: Partial<TransactionOptions>) {
    partialUpdate({
      transactionOptions: {
        ...(definition.transactionOptions ?? initialTransactionOptions),
        ...options,
      },
    });
  }

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
        value={definition.transactionOptions?.proposerAddress}
        setValue={(proposerAddress: FclValue) =>
          setTransactionOptions({
            proposerAddress: proposerAddress as string,
          })
        }
        addressBuilderOptions={{
          showManagedAccountsOnly: true,
        }}
      />
      <SizedBox height={12} />
      <ParamBuilder
        parameter={Parameter.fromPartial({
          identifier: "Payer",
          type: {
            kind: CadenceTypeKind.CADENCE_TYPE_ADDRESS,
          },
        })}
        value={definition.transactionOptions?.payerAddress}
        setValue={(payerAddress: FclValue) =>
          setTransactionOptions({ payerAddress: payerAddress as string })
        }
        addressBuilderOptions={{
          showManagedAccountsOnly: true,
        }}
      />
      <AuthorizerSettings />
    </>
  );
}

function AuthorizerSettings() {
  const { definition, parsedInteraction, partialUpdate } =
    useInteractionDefinitionManager();
  const authorizerAddresses =
    definition.transactionOptions?.authorizerAddresses ?? [];

  function setTransactionOptions(options: Partial<TransactionOptions>) {
    partialUpdate({
      transactionOptions: {
        ...(definition.transactionOptions ?? initialTransactionOptions),
        ...options,
      },
    });
  }

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
              identifier: `Authorizer ${
                authorizerAddresses.length > 1 ? index + 1 : ""
              }`,
              type: {
                kind: CadenceTypeKind.CADENCE_TYPE_ADDRESS,
              },
            })}
            value={proposer}
            setValue={(payerAddress) => setProposerByIndex(payerAddress, index)}
            addressBuilderOptions={{
              showManagedAccountsOnly: true,
            }}
          />
        </>
      ))}
    </div>
  );
}
