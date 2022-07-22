import { PollingEntity } from "../../common/entities/polling.entity";
import { Column, Entity, PrimaryColumn } from "typeorm";

type TransactionArgument = {
  type: string;
  value: any;
};

type TransactionProposalKey = {
  address: string;
  keyId: number;
  sequenceNumber: number;
};

type TransactionEnvelopeSignature = {
  address: string;
  keyId: number;
  signature: string;
};

type TransactionStatus = {
  status: number;
  statusCode: number;
  errorMessage: string;
  eventsCount: number;
};

@Entity({ name: "transactions" })
export class Transaction extends PollingEntity {
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

  static init(flowTransactionObject): Transaction {
    return Object.assign(new Transaction(), flowTransactionObject);
  }
}
