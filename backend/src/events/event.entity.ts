import { PollingEntity } from "../core/entities/polling.entity";
import { AfterLoad, Column, Entity, PrimaryColumn } from "typeorm";
import { Event } from "@flowser/shared";
import { BlockContextEntity } from "../blocks/entities/block-context.entity";

@Entity({ name: "events" })
export class EventEntity extends PollingEntity implements BlockContextEntity {
  id: string;

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

  @AfterLoad()
  private computeId() {
    this.id = `${this.transactionId}.${this.eventIndex}`;
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
