import React, { ReactElement, useEffect, useMemo, useState } from "react";
import classes from "./AddressBuilder.module.scss";
import { CadenceValueBuilder } from "../interface";
import { useGetPollingAccounts } from "../../../../../hooks/use-api";
import { AccountAvatar } from "../../../../accounts/AccountAvatar/AccountAvatar";
import { AccountName } from "../../../../accounts/AccountName/AccountName";
import { FlowserIcon } from "../../../../../components/icons/Icons";
import classNames from "classnames";
import { ServiceRegistry } from "../../../../../services/service-registry";
import { Account, FclValues } from "@flowser/shared";
import { Spinner } from "../../../../../components/spinner/Spinner";

export function AddressBuilder(props: CadenceValueBuilder): ReactElement {
  const { value, setValue, addressBuilderOptions } = props;
  const { data, refresh } = useGetPollingAccounts();
  const managedAccounts = useMemo(
    () =>
      addressBuilderOptions?.showManagedAccountsOnly
        ? data.filter((account) =>
            account.keys.some((key) => key.privateKey !== "")
          )
        : data,
    [data]
  );

  // TODO(polish): Don't trigger this hook on every rerender
  //  See: https://www.notion.so/flowser/Looks-like-polling-data-isn-t-properly-mutated-and-doesn-t-retrigger-the-useEffect-call-fb84a35b33fb4e6e8518c11cb30bd14d?pvs=4
  useEffect(() => {
    const serviceAddress = "0xf8d6e0586b0a20c7";
    const defaultAccount =
      managedAccounts.find((account) => account.address === serviceAddress) ??
      managedAccounts[0];
    if (!FclValues.isFclAddressValue(value) && defaultAccount) {
      setValue(defaultAccount.address);
    }
  });

  async function createNewAccount() {
    const { walletService } = ServiceRegistry.getInstance();
    await walletService.createAccount();
    await refresh();
  }

  return (
    <div className={classes.root}>
      <div className={classes.innerWrapper}>
        {managedAccounts.map((account) => (
          <AccountButton
            key={account.address}
            account={account}
            isSelected={value === account.address}
            onSelect={() => setValue(account.address)}
          />
        ))}
        <NewAccountButton onCreateNewAccount={createNewAccount} />
      </div>
    </div>
  );
}

type AccountButtonProps = {
  isSelected: boolean;
  onSelect: () => void;
  account: Account;
};

function AccountButton(props: AccountButtonProps) {
  const { isSelected, account, onSelect } = props;
  return (
    <div className={classes.selectAccountButton} onClick={() => onSelect()}>
      <div
        className={classNames(classes.avatarWrapper, {
          [classes.selectedAccount]: isSelected,
        })}
      >
        <AccountAvatar address={account.address} className={classes.avatar} />
      </div>
      <AccountName
        className={classes.accountName}
        address={account.address}
        shorten
      />
    </div>
  );
}

type NewAccountButtonProps = {
  onCreateNewAccount: () => Promise<void>;
};

function NewAccountButton(props: NewAccountButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <div
      className={classNames(
        classes.selectAccountButton,
        classes.newAccountButton
      )}
      onClick={async () => {
        try {
          setIsLoading(true);
          await props.onCreateNewAccount();
        } finally {
          setIsLoading(false);
        }
      }}
    >
      <div className={classes.avatarWrapper}>
        <div className={classes.plusIconWrapper}>
          {isLoading ? (
            <Spinner className={classes.spinner} size={20} />
          ) : (
            <FlowserIcon.Plus />
          )}
        </div>
      </div>
      <div className={classes.accountName}>New</div>
    </div>
  );
}
