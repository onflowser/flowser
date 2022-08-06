import { PollingEntity } from "../../common/entities/polling.entity";
import { AfterLoad, Column, Entity, PrimaryColumn } from "typeorm";
import { ExtendedFlowEvent } from "../../flow/services/flow-aggregator.service";

@Entity({ name: "events" })
export class Event extends PollingEntity {
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

  // TODO(milestone-2): define type
  @Column("simple-json")
  data: object;

  @AfterLoad()
  private computeId() {
    this.id = `${this.transactionId}.${this.eventIndex}`;
  }

  static create(flowEvent: ExtendedFlowEvent): Event {
    return Object.assign(new Event(), flowEvent);
  }
}
