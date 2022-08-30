import { PollingEntity } from "../../common/entities/polling.entity";
import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import {
  Transaction,
  TransactionProposalKey,
  SignableObject,
  TransactionStatus,
} from "@flowser/types";
import { CadenceObject } from "@flowser/types";
import {
  FlowSignableObject,
  FlowTransaction,
  FlowTransactionStatus,
} from "../../flow/services/flow-gateway.service";
import {
  deserializeCadenceObject,
  ensurePrefixedAddress,
  typeOrmProtobufTransformer,
} from "../../utils";
import { AccountEntity } from "../../accounts/entities/account.entity";

@Entity({ name: "transactions" })
export class TransactionEntity extends PollingEntity {
  @PrimaryColumn()
  id: string;

  @Column("text")
  script: string;

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

  @Column("simple-json", {
    transformer: typeOrmProtobufTransformer(CadenceObject),
  })
  args: CadenceObject[];

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

  toProto() {
    return Transaction.fromPartial({
      id: this.id,
      script: this.script,
      referenceBlockId: this.referenceBlockId,
      gasLimit: this.gasLimit,
      payer: this.payerAddress,
      authorizers: this.authorizers,
      args: this.args,
      proposalKey: this.proposalKey,
      envelopeSignatures: this.envelopeSignatures,
      status: this.status,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    });
  }

  static create(
    flowTransaction: FlowTransaction,
    flowTransactionStatus: FlowTransactionStatus
  ): TransactionEntity {
    const transaction = new TransactionEntity();
    transaction.id = flowTransaction.id;
    transaction.script = flowTransaction.script;
    transaction.payerAddress = ensurePrefixedAddress(flowTransaction.payer);
    transaction.referenceBlockId = flowTransaction.referenceBlockId;
    transaction.gasLimit = flowTransaction.gasLimit;
    transaction.authorizers = flowTransaction.authorizers.map((address) =>
      ensurePrefixedAddress(address)
    );
    transaction.args = flowTransaction.args.map((arg) =>
      deserializeCadenceObject(arg)
    );
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
  return signableObjects.map((signable) => SignableObject.fromJSON(signable));
}
