import { PollingEntity } from "../../common/entities/polling.entity";
import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import {
  Transaction,
  TransactionProposalKey,
  SignableObject,
  TransactionStatus,
} from "@flowser/types/generated/entities/transactions";
import {
  CadenceObject,
  cadenceTypeFromJSON,
} from "@flowser/types/generated/entities/cadence";
import {
  FlowBlock,
  FlowCadenceObject,
  FlowSignableObject,
  FlowTransaction,
  FlowTransactionStatus,
} from "../../flow/services/gateway.service";
import { ensurePrefixedAddress, typeOrmProtobufTransformer } from "../../utils";
import { AccountEntity } from "../../accounts/entities/account.entity";
import { CadenceUtils } from "../../flow/utils/cadence-utils";

@Entity({ name: "transactions" })
export class TransactionEntity extends PollingEntity {
  @PrimaryColumn()
  id: string;

  @Column("text")
  script: string;

  @Column()
  blockId: string;

  @Column()
  referenceBlockId: string;

  @Column()
  gasLimit: number;

  @Column()
  payerAddress: string; // payer account address

  @ManyToOne(() => AccountEntity, (account) => account.transactions)
  payer: AccountEntity; // payer account address

  @Column("simple-array")
  authorizers: string[]; // authorizers account addresses

  @Column("simple-json")
  args: FlowCadenceObject[];

  @Column("simple-json", {
    transformer: typeOrmProtobufTransformer(TransactionProposalKey),
  })
  proposalKey: TransactionProposalKey;

  @Column("simple-json", {
    transformer: typeOrmProtobufTransformer(SignableObject),
  })
  envelopeSignatures: SignableObject[];

  @Column("simple-json", {
    transformer: typeOrmProtobufTransformer(SignableObject),
  })
  payloadSignatures: SignableObject[];

  @Column("simple-json", {
    transformer: typeOrmProtobufTransformer(TransactionStatus),
  })
  status: TransactionStatus;

  toProto(): Transaction {
    return {
      id: this.id,
      script: this.script,
      blockId: this.blockId,
      referenceBlockId: this.referenceBlockId,
      gasLimit: this.gasLimit,
      payer: this.payerAddress,
      authorizers: this.authorizers,
      args: this.args.map((arg) => CadenceUtils.serializeCadenceObject(arg)),
      proposalKey: this.proposalKey,
      envelopeSignatures: this.envelopeSignatures,
      payloadSignatures: this.payloadSignatures,
      status: this.status,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  static create(
    flowBlock: FlowBlock,
    flowTransaction: FlowTransaction,
    flowTransactionStatus: FlowTransactionStatus
  ): TransactionEntity {
    const transaction = new TransactionEntity();
    transaction.id = flowTransaction.id;
    transaction.script = flowTransaction.script;
    transaction.payerAddress = ensurePrefixedAddress(flowTransaction.payer);
    transaction.blockId = flowBlock.id;
    transaction.referenceBlockId = flowTransaction.referenceBlockId;
    transaction.gasLimit = flowTransaction.gasLimit;
    transaction.authorizers = flowTransaction.authorizers.map((address) =>
      ensurePrefixedAddress(address)
    );
    transaction.args = flowTransaction.args;
    transaction.proposalKey = flowTransaction.proposalKey;
    transaction.envelopeSignatures = deserializeSignableObjects(
      flowTransaction.envelopeSignatures
    );
    transaction.payloadSignatures = deserializeSignableObjects(
      flowTransaction.payloadSignatures
    );
    transaction.status = TransactionStatus.fromJSON(flowTransactionStatus);
    return transaction;
  }
}

function deserializeSignableObjects(signableObjects: FlowSignableObject[]) {
  return signableObjects.map((signable) =>
    SignableObject.fromJSON({
      ...signable,
      address: ensurePrefixedAddress(signable.address),
    })
  );
}
