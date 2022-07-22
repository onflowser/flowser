import { Column, Entity } from "typeorm";

@Entity()
export class PollingEntity {
  @Column("timestamp")
  createdAt = new Date();

  @Column("timestamp")
  updatedAt = new Date();

  @Column("timestamp", { nullable: true })
  deletedAt = null;

  public markUpdated() {
    this.updatedAt = new Date();
  }

  public markDeleted() {
    this.deletedAt = new Date();
  }
}
