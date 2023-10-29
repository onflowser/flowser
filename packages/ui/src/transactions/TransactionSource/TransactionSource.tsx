import React, { FC } from "react";
import { BaseCard } from "../../common/cards/BaseCard/BaseCard";
import classes from "./TransactionSource.module.scss";
import { CadenceEditor } from "../../common/code/CadenceEditor/CadenceEditor";
import { ParamBuilder } from "../../interactions/components/ParamBuilder/ParamBuilder";
import { SizedBox } from "../../common/misc/SizedBox/SizedBox";
import { ProjectLink } from "../../common/links/ProjectLink";
import { FlowserIcon } from "../../common/icons/FlowserIcon";
import { useInteractionRegistry } from "../../interactions/contexts/interaction-registry.context";
import { useTransactionName } from "../../interactions/hooks/use-transaction-name";
import { FlowTransaction } from "@onflowser/api";

type TransactionSourceProps = {
  transaction: FlowTransaction;
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
          transaction.arguments.map((arg) => [arg.identifier, arg.value]),
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
      },
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
                value={arg.value}
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
