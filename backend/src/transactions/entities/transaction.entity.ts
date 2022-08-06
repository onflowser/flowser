import { PollingEntity } from "../../common/entities/polling.entity";
import { Column, Entity, PrimaryColumn } from "typeorm";
import {
  Transaction,
  TransactionArgument,
  TransactionProposalKey,
  TransactionEnvelopeSignature,
  TransactionStatus,
} from "@flowser/types/generated/transactions";
import { FlowTransaction } from "../../flow/services/flow-gateway.service";
import { typeOrmProtobufTransformer } from "../../utils";

@Entity({ name: "transactions" })
export class TransactionEntity extends PollingEntity implements Transaction {
  @PrimaryColumn()
  id: string;

  @Column("text")
  script: string;

  @Column()
  referenceBlockId: string;

  @Column()
  gasLimit: number;

  @Column()
  payer: string; // payer account address

  @Column("simple-array")
  authorizers: string[]; // authorizers account addresses

  @Column("simple-json", {
    transformer: typeOrmProtobufTransformer(TransactionArgument),
  })
  args: TransactionArgument[];

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

  static create(flowTransaction: FlowTransaction): TransactionEntity {
    return Object.assign(
      new TransactionEntity(),
      Transaction.fromJSON(flowTransaction)
    );
  }
}
