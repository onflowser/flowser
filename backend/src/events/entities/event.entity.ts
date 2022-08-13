import { PollingEntity } from "../../common/entities/polling.entity";
import { AfterLoad, Column, Entity, PrimaryColumn } from "typeorm";
import { ExtendedFlowEvent } from "../../flow/services/aggregator.service";
import { Event } from "@flowser/types/generated/entities/events";

@Entity({ name: "events" })
export class EventEntity extends PollingEntity {
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

  toProto() {
    return Event.fromPartial({
      id: this.id,
      transactionId: this.transactionId,
      blockId: this.blockId,
      eventIndex: this.eventIndex,
      type: this.type,
      transactionIndex: this.transactionIndex,
      data: this.data,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    });
  }

  static create(flowEvent: ExtendedFlowEvent): EventEntity {
    const event = new EventEntity();
    event.type = flowEvent.type;
    event.transactionIndex = flowEvent.transactionIndex;
    event.transactionId = flowEvent.transactionId;
    event.blockId = flowEvent.blockId;
    event.eventIndex = flowEvent.eventIndex;
    event.data = flowEvent.data;
    return event;
  }
}
