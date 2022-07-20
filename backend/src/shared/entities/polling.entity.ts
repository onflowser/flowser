import { Column, Entity } from "typeorm";

@Entity()
export class PollingEntity {
  @Column("datetime")
  createdAt: Date = new Date();

  @Column("datetime")
  updatedAt: Date = new Date();

  @Column("datetime", { nullable: true })
  deletedAt: Date;
}
