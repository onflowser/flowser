import { PollingEntity } from '../../shared/entities/polling.entity';
import { Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";

type TransactionArgument = {
  type: string;
  value: any;
}

type TransactionProposalKey = {
  address: string;
  keyId: number;
  sequenceNumber: number;
}

type TransactionEnvelopeSignature = {
  address: string;
  keyId: number;
  signature: string;
}

type TransactionStatus = {
  status: number;
  statusCode: number;
  errorMessage: string;
  eventsCount: number;
}

@Entity({name: 'transactions'})
export class Transaction extends PollingEntity {
  @ObjectIdColumn()
  _id: ObjectID;

  @Column()
  id: string;

  @Column()
  script: string;

  @Column()
  args: TransactionArgument[];

  @Column()
  referenceBlockId: string;

  @Column()
  gasLimit: number;

  @Column()
  proposalKey: TransactionProposalKey;

  @Column()
  payer: string; // payer account address

  @Column()
  authorizers: string[] // authorizers account addresses

  @Column()
  envelopeSignatures: TransactionEnvelopeSignature[];

  @Column()
  status: TransactionStatus;
}
