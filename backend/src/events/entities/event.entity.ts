import { PollingEntity } from "../../shared/entities/polling.entity";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "events" })
export class Event extends PollingEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  transactionId: string;

  @Column()
  blockId: string;

  @Column()
  type: string;

  @Column()
  transactionIndex: number;

  @Column()
  eventIndex: number;

  @Column("simple-json")
  data: object;

  static init(flowEventObject): Event {
    return Object.assign(new Event(), {
      ...flowEventObject,
      id: `${flowEventObject.transactionId}:${flowEventObject.type}:${flowEventObject.eventIndex}`,
    });
  }
}
