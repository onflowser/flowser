import { PollingEntity } from '../../shared/entities/polling.entity';
import { Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";

@Entity({ name: 'events' })
export class Event extends PollingEntity {
  @ObjectIdColumn()
  _id: ObjectID;

  @Column()
  id: string;

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
    const id = `${flowEventObject.transactionId}:${flowEventObject.type}`;
    return Object.assign(new Event(), {
      ...flowEventObject,
      _id: id,
      id
    });
  }
}
