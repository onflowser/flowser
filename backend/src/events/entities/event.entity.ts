import { PollingEntity } from "../../common/entities/polling.entity";
import { AfterLoad, Column, Entity, PrimaryColumn } from "typeorm";

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

  @Column("simple-json")
  data: object;

  @AfterLoad()
  private computeId() {
    this.id = `${this.transactionId}.${this.blockId}.${this.eventIndex}`;
  }

  static init(flowEventObject): Event {
    return Object.assign(new Event(), flowEventObject);
  }
}
