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

@Entity({ name: "transactions" })
export class TransactionEntity extends PollingEntity implements Transaction {
  @PrimaryColumn()
  id: string;

  @Column("text")
  script: string;

  @Column("simple-json")
  args: TransactionArgument[];

  @Column()
  referenceBlockId: string;

  @Column()
  gasLimit: number;

  @Column("simple-json")
  proposalKey: TransactionProposalKey;

  @Column()
  payer: string; // payer account address

  @Column("simple-array")
  authorizers: string[]; // authorizers account addresses

  @Column("simple-json")
  envelopeSignatures: TransactionEnvelopeSignature[];

  @Column("simple-json")
  status: TransactionStatus;

  static create(flowTransaction: FlowTransaction): TransactionEntity {
    return Object.assign(
      new TransactionEntity(),
      Transaction.fromJSON(flowTransaction)
    );
  }
}
