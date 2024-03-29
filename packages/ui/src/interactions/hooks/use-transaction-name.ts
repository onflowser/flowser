import { useInteractionRegistry } from "../contexts/interaction-registry.context";
import { useMemo } from "react";
import { useTemplatesRegistry } from "../contexts/templates.context";
import { InteractionUtils } from "../core/core-utils";
import { FlowTransaction } from "@onflowser/api";
import { FclValue } from "@onflowser/core";

type UseInteractionNameProps = {
  transaction: FlowTransaction | undefined;
};

enum TransactionKind {
  DEPLOY_CONTRACT,
  REMOVE_CONTRACT,
  INITIALIZE_ACCOUNT,
}

const hardcodedTemplates: [string, TransactionKind][] = [
  [
    // Used by `flow emulator --contracts`
    `transaction(name: String, code: String) {
      prepare(signer: AuthAccount) {
        signer.contracts.add(name: name, code: code.decodeHex() )
      }
    }`,
    TransactionKind.DEPLOY_CONTRACT,
  ],
  // Used by `flow deploy`
  [
    `transaction(name: String, code: String) {
      prepare(signer: AuthAccount) {
        signer.contracts.add(name: name, code: code.utf8)
      }
    }`,
    TransactionKind.DEPLOY_CONTRACT,
  ],
  [
    `transaction(name: String) {
      prepare(signer: AuthAccount) {
        signer.contracts.remove(name: name)
      }
    }`,
    TransactionKind.REMOVE_CONTRACT,
  ],
  [
    `import Crypto

    transaction(publicKeys: [Crypto.KeyListEntry], contracts: {String: String}) {
      prepare(signer: AuthAccount) {
        let account = AuthAccount(payer: signer)
    
        // add all the keys to the account
        for key in publicKeys {
          account.keys.add(publicKey: key.publicKey, hashAlgorithm: key.hashAlgorithm, weight: key.weight)
        }
    
        // add contracts if provided
        for contract in contracts.keys {
          account.contracts.add(name: contract, code: contracts[contract]!.decodeHex())
        }
      }
    }`,
    TransactionKind.INITIALIZE_ACCOUNT,
  ],
];

const transactionKindBySource = new Map<string, TransactionKind>(
  hardcodedTemplates.map((entry) => [
    InteractionUtils.normalizeCadenceCode(entry[0]),
    entry[1],
  ]),
);

export function useTransactionName(
  props: UseInteractionNameProps,
): string | undefined {
  const { transaction } = props;
  const { templates } = useTemplatesRegistry();
  const { definitions } = useInteractionRegistry();

  return useMemo(() => {
    if (!transaction?.script) {
      return undefined;
    }

    const standardInteractionName = getStandardInteractionName(transaction);

    // Standard interaction names should take precedence,
    // otherwise the stored/active interactions would overwrite the standard interaction names.
    if (standardInteractionName) {
      return standardInteractionName;
    }

    const sanitizedTargetCode = InteractionUtils.normalizeCadenceCode(
      transaction.script,
    );
    return [...templates, ...definitions].find(
      (template) =>
        template.code &&
        InteractionUtils.normalizeCadenceCode(template.code) ===
          sanitizedTargetCode,
    )?.name;
  }, [transaction, templates, definitions]);
}

function getStandardInteractionName(
  transaction: FlowTransaction,
): string | undefined {
  const kind = transactionKindBySource.get(
    InteractionUtils.normalizeCadenceCode(transaction.script),
  );

  switch (kind) {
    case TransactionKind.DEPLOY_CONTRACT:
      return `Deploy ${
        getArgumentValueById(transaction, "name") ?? "contract"
      }`;
    case TransactionKind.REMOVE_CONTRACT:
      return `Remove ${
        getArgumentValueById(transaction, "name") ?? "contract"
      }`;
    case TransactionKind.INITIALIZE_ACCOUNT:
      return "Init signer account";
    default:
      return undefined;
  }
}

function getArgumentValueById(
  transaction: FlowTransaction,
  id: string,
): FclValue {
  return transaction.arguments.find((argument) => argument.identifier === id)
    ?.value;
}
