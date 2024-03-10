import React, { ReactElement, useEffect } from "react";
import { SizedBox } from "../../../common/misc/SizedBox/SizedBox";
import { ParamBuilder, ParamListBuilder } from "../ParamBuilder/ParamBuilder";
import classes from "./ExecutionSettings.module.scss";
import { LoaderButton } from "../../../common/buttons/LoaderButton/LoaderButton";
import { useInteractionOutcomeManager } from "../../contexts/outcome.context";
import { useInteractionDefinitionManager } from "../../contexts/definition.context";
import { Callout } from "../../../common/misc/Callout/Callout";
import { ExternalLink } from "../../../common/links/ExternalLink/ExternalLink";
import { CadenceType, CadenceTypeKind, InteractionKind } from "@onflowser/api";
import { TransactionOptions } from "../../core/core-types";
import { FclValue, FclValueUtils } from "@onflowser/core";
import { useServiceRegistry } from "../../../contexts/service-registry.context";

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
  const { flixTemplate, setFclValue, fclValuesByIdentifier, definition, parsedInteraction } =
    useInteractionDefinitionManager();
  const {walletService} = useServiceRegistry();

  // Signing settings are not needed when using standard flow wallet API.
  const showSigningSettings = parsedInteraction?.kind === InteractionKind.INTERACTION_TRANSACTION && walletService;

  if (definition.code === "") {
    return null;
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
        flixTemplate={flixTemplate}
      />
      <SizedBox height={30} />
      {showSigningSettings && (
        <SigningSettings />
      )}
    </>
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

const defaultCadenceType: CadenceType = {
  rawType: "",
  optional: false,
  array: undefined,
  dictionary: undefined,
  kind: CadenceTypeKind.CADENCE_TYPE_UNKNOWN,
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
        flixArgument={undefined}
        parameter={{
          identifier: "Proposer",
          type: {
            ...defaultCadenceType,
            kind: CadenceTypeKind.CADENCE_TYPE_ADDRESS,
          },
        }}
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
        flixArgument={undefined}
        parameter={{
          identifier: "Payer",
          type: {
            ...defaultCadenceType,
            kind: CadenceTypeKind.CADENCE_TYPE_ADDRESS,
          },
        }}
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
    if (!FclValueUtils.isFclAddressValue(address)) {
      throw new Error(`Expected address value, found: ${address}`);
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
            flixArgument={undefined}
            parameter={{
              identifier: `Authorizer ${
                authorizerAddresses.length > 1 ? index + 1 : ""
              }`,
              type: {
                ...defaultCadenceType,
                kind: CadenceTypeKind.CADENCE_TYPE_ADDRESS,
              },
            }}
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
