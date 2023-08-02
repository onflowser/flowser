import React, { ReactElement, useMemo, useState } from "react";
import classes from "./AddressBuilder.module.scss";
import { CadenceValueBuilder } from "../interface";
import { useGetPollingAccounts } from "../../../../../../hooks/use-api";
import { AccountAvatar } from "../../../../../../components/account/avatar/AccountAvatar";
import { AccountName } from "../../../../../../components/account/name/AccountName";
import { FlowserIcon } from "../../../../../../components/icons/Icons";
import classNames from "classnames";
import { ServiceRegistry } from "../../../../../../services/service-registry";
import { Account } from "@flowser/shared";
import { Spinner } from "../../../../../../components/spinner/Spinner";

export function AddressBuilder(props: CadenceValueBuilder): ReactElement {
  const { value, setValue } = props;
  const { data, refresh } = useGetPollingAccounts();
  const managedAccounts = useMemo(
    () =>
      data.filter((account) =>
        account.keys.some((key) => key.privateKey !== "")
      ),
    [data]
  );

  async function createNewAccount() {
    const { walletService } = ServiceRegistry.getInstance();
    await walletService.createAccount();
    await refresh();
  }

  return (
    <div className={classes.root}>
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
      <AccountName address={account.address} shorten />
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
      <div>New</div>
    </div>
  );
}
