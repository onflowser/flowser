import React, { ReactElement, useEffect, useMemo, useState } from "react";
import classes from "./AddressBuilder.module.scss";
import { CadenceValueBuilder } from "../interface";
import { AccountAvatar } from "../../../../accounts/AccountAvatar/AccountAvatar";
import { AccountName } from "../../../../accounts/AccountName/AccountName";
import { FlowserIcon } from "../../../../common/icons/FlowserIcon";
import classNames from "classnames";
import { Spinner } from "../../../../common/loaders/Spinner/Spinner";
import { FclValueUtils } from "@onflowser/core";
import { FlowAccount } from "@onflowser/api";
import { useServiceRegistry } from "../../../../contexts/service-registry.context";
import { useGetAccounts, useGetManagedKeys } from "../../../../api";

export function AddressBuilder(props: CadenceValueBuilder): ReactElement {
  const { disabled, value, setValue, addressBuilderOptions } = props;
  const { data, mutate } = useGetAccounts();
  const { walletService } = useServiceRegistry();
  const { data: allKeys } = useGetManagedKeys();
  const accountsWithPrivateKeysLookup = new Set(allKeys?.filter(key => Boolean(key.privateKey)).map(key => key.address));
  const accountsToShow = useMemo(() => addressBuilderOptions?.showManagedAccountsOnly
    ? data?.filter((account) => accountsWithPrivateKeysLookup.has(account.address))
    : data, [addressBuilderOptions?.showManagedAccountsOnly, data]);

  useEffect(() => {
    const serviceAddress = "0xf8d6e0586b0a20c7";
    const defaultAccount =
      accountsToShow?.find((account) => account.address === serviceAddress) ??
      accountsToShow?.[0];
    if (!FclValueUtils.isFclAddressValue(value) && defaultAccount) {
      setValue(defaultAccount.address);
    }
  }, [accountsToShow]);

  async function createNewAccount() {
    await walletService.createAccount();
    await mutate();
  }

  return (
    <div className={classes.root}>
      <div className={classes.innerWrapper}>
        {accountsToShow?.map((account) => (
          <AccountButton
            key={account.address}
            disabled={disabled}
            account={account}
            isSelected={value === account.address}
            onSelect={() => setValue(account.address)}
          />
        ))}
        {!disabled && (
          <NewAccountButton onCreateNewAccount={createNewAccount} />
        )}
      </div>
    </div>
  );
}

type AccountButtonProps = {
  isSelected: boolean;
  onSelect: () => void;
  account: FlowAccount;
  disabled?: boolean;
};

function AccountButton(props: AccountButtonProps) {
  const { disabled, isSelected, account, onSelect } = props;
  return (
    <button
      disabled={disabled}
      className={classes.selectAccountButton}
      onClick={() => onSelect()}
    >
      <div
        className={classNames(classes.avatarWrapper, {
          [classes.selectedAccount]: isSelected,
          [classes.avatarWrapper__enabled]: !disabled
        })}
      >
        <AccountAvatar address={account.address} className={classes.avatar} />
      </div>
      <AccountName
        className={classes.accountName}
        address={account.address}
        short
      />
    </button>
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
