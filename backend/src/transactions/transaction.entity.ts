import { PollingEntity } from "../core/entities/polling.entity";
import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import {
  Transaction,
  TransactionProposalKey,
  SignableObject,
  TransactionStatus,
} from "@flowser/shared";
import {
  FlowBlock,
  FlowCadenceObject,
  FlowSignableObject,
  FlowTransaction,
  FlowTransactionStatus,
} from "../flow/services/gateway.service";
import {
  ensurePrefixedAddress,
  typeOrmProtobufTransformer,
} from "../utils/common-utils";
import { AccountEntity } from "../accounts/entities/account.entity";
import { CadenceUtils } from "../flow/utils/cadence-utils";
import { BlockContextEntity } from "../blocks/entities/block-context.entity";
import { PollingEntityInitArguments } from "../utils/type-utils";

type TransactionEntityInitArgs = PollingEntityInitArguments<TransactionEntity>;

@Entity({ name: "transactions" })
export class TransactionEntity
  extends PollingEntity
  implements BlockContextEntity
{
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
  payer: AccountEntity | null; // payer account address

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

  constructor(args: TransactionEntityInitArgs) {
    super();
    this.id = args.id;
    this.script = args.script;
    this.blockId = args.blockId;
    this.referenceBlockId = args.referenceBlockId;
    this.gasLimit = args.gasLimit;
    this.payerAddress = args.payerAddress;
    this.payer = args.payer;
    this.authorizers = args.authorizers;
    this.args = args.args;
    this.proposalKey = args.proposalKey;
    this.envelopeSignatures = args.envelopeSignatures;
    this.payloadSignatures = args.payloadSignatures;
    this.status = args.status;
  }

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
}
