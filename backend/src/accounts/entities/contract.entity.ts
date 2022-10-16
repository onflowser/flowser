import { PollingEntity } from "../../core/entities/polling.entity";
import { AfterLoad, Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { AccountEntity } from "./account.entity";
import { BadRequestException } from "@nestjs/common";
import { ensurePrefixedAddress } from "../../utils";
import { FlowAccount } from "../../flow/services/gateway.service";
import { AccountContract } from "@flowser/shared";

@Entity({ name: "contracts" })
export class AccountContractEntity extends PollingEntity {
  // Encodes both accountAddress and name into the id.
  id: string;

  @PrimaryColumn()
  accountAddress: string;

  @PrimaryColumn()
  name: string;

  @Column("text")
  code: string;

  @ManyToOne(() => AccountEntity, (account) => account.contracts)
  account: AccountEntity;

  public static parseId(id: string) {
    const idParts = id.split(".");
    if (idParts.length !== 2) {
      throw new BadRequestException("Invalid contract id");
    }
    const [accountAddress, name] = idParts;
    return { accountAddress, name };
  }

  @AfterLoad()
  private computeId() {
    this.id = `${this.accountAddress}.${this.name}`;
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

  static create(account: FlowAccount, name: string, code: string) {
    const contract = new AccountContractEntity();
    contract.accountAddress = ensurePrefixedAddress(account.address);
    contract.name = name;
    contract.code = code;
    return contract;
  }
}
