import { PollingEntity } from '../../shared/entities/polling.entity';
import { Entity, ObjectID, ObjectIdColumn } from "typeorm";

@Entity({name: 'transactions'})
export class Transaction extends PollingEntity {
  @ObjectIdColumn()
  _id: ObjectID;
}
