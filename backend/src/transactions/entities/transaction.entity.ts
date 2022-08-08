import { PollingEntity } from "../../common/entities/polling.entity";
import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import {
  Transaction,
  TransactionProposalKey,
  TransactionEnvelopeSignature,
  TransactionStatus,
} from "@flowser/types/generated/entities/transactions";
import { CadenceObject } from "@flowser/types/generated/entities/common";
import {
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

  @PrimaryColumn()
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
    transformer: typeOrmProtobufTransformer(TransactionEnvelopeSignature),
  })
  envelopeSignatures: TransactionEnvelopeSignature[];

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
    transaction.envelopeSignatures = flowTransaction.envelopeSignatures;
    transaction.status = TransactionStatus.fromJSON(flowTransactionStatus);
    return transaction;
  }
}
