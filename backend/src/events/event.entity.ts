import { PollingEntity } from "../core/entities/polling.entity";
import { Column, Entity, PrimaryColumn } from "typeorm";
import { Event } from "@flowser/shared";
import { BlockContextEntity } from "../blocks/entities/block-context.entity";
import { PollingEntityInitArguments } from "../utils/type-utils";

type EventEntityInitArgs = Omit<PollingEntityInitArguments<EventEntity>, "id">;

@Entity({ name: "events" })
export class EventEntity extends PollingEntity implements BlockContextEntity {
  @PrimaryColumn()
  transactionId: string;

  @PrimaryColumn()
  blockId: string;

  @PrimaryColumn()
  eventIndex: number;

  @Column()
  type: string;

  @Column()
  transactionIndex: number;

  @Column("simple-json")
  data: object;

  // Entities are also automatically initialized by TypeORM.
  // In those cases no constructor arguments are provided.
  constructor(args: EventEntityInitArgs | undefined) {
    super();
    this.transactionId = args?.transactionId ?? "";
    this.blockId = args?.blockId ?? "";
    this.eventIndex = args?.eventIndex ?? -1;
    this.type = args?.type ?? "";
    this.transactionIndex = args?.transactionIndex ?? -1;
    this.data = args?.data ?? {};
  }

  get id() {
    return `${this.transactionId}.${this.eventIndex}`;
  }

  toProto(): Event {
    return {
      id: this.id,
      transactionId: this.transactionId,
      blockId: this.blockId,
      eventIndex: this.eventIndex,
      type: this.type,
      transactionIndex: this.transactionIndex,
      data: this.data,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
