import { Column, Entity } from "typeorm";

@Entity()
export class PollingEntity {
  @Column("datetime")
  createdAt = new Date();

  @Column("datetime")
  updatedAt = new Date();

  @Column("datetime", { nullable: true })
  deletedAt = null;

  public markUpdated() {
    this.updatedAt = new Date();
  }

  public markDeleted() {
    this.deletedAt = new Date();
  }
}
