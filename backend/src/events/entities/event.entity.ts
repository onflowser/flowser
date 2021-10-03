import { PollingEntity } from '../../shared/entities/polling.entity';
import { Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";

@Entity({ name: 'events' })
export class Event extends PollingEntity {
  @ObjectIdColumn()
  _id: ObjectID;

  @Column()
  transactionId: string;

  @Column()
  type: string;

  @Column()
  transactionIndex: number;

  @Column()
  eventIndex: number;

  @Column()
  data: object;

  static init(flowEventObject): Event {
    return Object.assign(new Event(), {
      ...flowEventObject,
      _id: `${flowEventObject.transactionId}:${flowEventObject.type}`
    });
  }
}
