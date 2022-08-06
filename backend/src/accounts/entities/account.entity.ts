import { PollingEntity } from "../../common/entities/polling.entity";
import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { AccountKeyEntity } from "./key.entity";
import { AccountContractEntity } from "./contract.entity";
import { AccountsStorageEntity } from "./storage.entity";
import { ensurePrefixedAddress } from "../../utils";
import { FlowAccount } from "../../flow/services/flow-gateway.service";
import { Account } from "@flowser/types/generated/accounts";

@Entity({ name: "accounts" })
export class AccountEntity extends PollingEntity implements Account {
  @PrimaryColumn()
  address: string;

  @Column({ type: "bigint" })
  balance: number;

  @Column()
  code: string;

  @OneToMany(() => AccountKeyEntity, (key) => key.account, {
    eager: true,
  })
  keys: AccountKeyEntity[];

  @OneToMany(() => AccountsStorageEntity, (storage) => storage.account, {
    eager: true,
  })
  storage: AccountsStorageEntity[];

  @OneToMany(() => AccountContractEntity, (contract) => contract.account, {
    eager: true,
  })
  contracts: AccountContractEntity[];

  static create(flowAccount: FlowAccount): AccountEntity {
    const account = Object.assign(
      new AccountEntity(),
      Account.fromJSON(flowAccount)
    );
    account.address = ensurePrefixedAddress(flowAccount.address);
    return account;
  }
}
