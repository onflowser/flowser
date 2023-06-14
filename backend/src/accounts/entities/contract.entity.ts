import { PollingEntity } from "../../core/entities/polling.entity";
import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { AccountEntity } from "./account.entity";
import { BadRequestException } from "@nestjs/common";
import { AccountContract } from "@flowser/shared";
import { BlockContextEntity } from "../../blocks/entities/block-context.entity";

@Entity({ name: "contracts" })
export class AccountContractEntity
  extends PollingEntity
  implements BlockContextEntity
{
  // Encodes both accountAddress and name into the id.
  id: string;

  @PrimaryColumn()
  accountAddress: string;

  @PrimaryColumn()
  name: string;

  // Nullable for backward compatability - to not cause not null constraint failure on migration.
  @Column({ nullable: true })
  blockId: string;

  @Column("text")
  code: string;

  @ManyToOne(() => AccountEntity, (account) => account.contracts)
  account: AccountEntity;

  @AfterLoad()
  public updateId() {
    this.id = `${this.accountAddress}.${this.name}`;
  }

  @BeforeInsert()
  @BeforeUpdate()
  public unsetId() {
    delete this.id;
  }

  toProto(): AccountContract {
    return {
      id: this.id,
      accountAddress: this.accountAddress,
      name: this.name,
      code: this.code,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  public static parseId(id: string) {
    const idParts = id.split(".");
    if (idParts.length !== 2) {
      throw new BadRequestException("Invalid contract id");
    }
    const [accountAddress, name] = idParts;
    return { accountAddress, name };
  }
}
