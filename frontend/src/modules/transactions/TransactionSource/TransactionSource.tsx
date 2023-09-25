import React, { FC } from "react";
import { BaseCard } from "../../../components/cards/BaseCard/BaseCard";
import classes from "./TransactionSource.module.scss";
import { Transaction } from "@flowser/shared";
import { CadenceEditor } from "../../../components/code/CadenceEditor/CadenceEditor";
import { ParamBuilder } from "../../interactions/components/ParamBuilder/ParamBuilder";
import { SizedBox } from "../../../components/misc/SizedBox/SizedBox";
import { ProjectLink } from "../../../components/links/ProjectLink";
import { FlowserIcon } from "../../../components/icons/FlowserIcon";
import { useInteractionRegistry } from "../../interactions/contexts/interaction-registry.context";
import { useTransactionName } from "../../interactions/hooks/use-transaction-name";

type TransactionSourceProps = {
  transaction: Transaction;
};

export const TransactionSource: FC<TransactionSourceProps> = ({
  transaction,
}) => {
  const { setFocused, create } = useInteractionRegistry();
  const transactionName = useTransactionName({ transaction });

  function onOpenInteraction() {
    const createdInteraction = create(
      {
        name: transactionName ?? "Unknown",
        code: transaction.script,
        fclValuesByIdentifier: new Map(
          transaction.arguments.map((arg) => [
            arg.identifier,
            JSON.parse(arg.valueAsJson),
          ])
        ),
        initialOutcome: {
          transaction: {
            transactionId: transaction.id,
            error: transaction.status?.errorMessage,
          },
        },
        transactionOptions: {
          authorizerAddresses: transaction.authorizers,
          payerAddress: transaction.payer,
          proposerAddress: transaction.proposalKey!.address,
        },
      },
      {
        deduplicateBySourceCodeSemantics: true,
      }
    );
    setFocused(createdInteraction.id);
  }

  return (
    <BaseCard className={classes.root}>
      {transaction.arguments.length > 0 && (
        <div className={classes.left}>
          <h3>Arguments</h3>
          <SizedBox height={20} />
          <div className={classes.argumentsWrapper}>
            {transaction.arguments.map((arg) => (
              <ParamBuilder
                key={arg.identifier}
                disabled
                value={JSON.parse(arg.valueAsJson)}
                setValue={console.log}
                parameter={arg}
              />
            ))}
          </div>
        </div>
      )}
      <div className={classes.right}>
        <CadenceEditor value={transaction.script} editable={false} />
      </div>
      <ProjectLink
        className={classes.interactLink}
        to="/interactions"
        onClick={() => onOpenInteraction()}
      >
        <FlowserIcon.CursorClick /> Interact
      </ProjectLink>
    </BaseCard>
  );
};
