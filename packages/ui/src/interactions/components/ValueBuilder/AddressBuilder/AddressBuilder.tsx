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
import { IWalletService, useServiceRegistry } from "../../../../contexts/service-registry.context";
import { useGetAccounts, useGetManagedKeys } from "../../../../api";
import { TextualBuilder } from "../TextualBuilder/TextualBuilder";

export function AddressBuilder(props: CadenceValueBuilder): ReactElement {
  const { walletService } = useServiceRegistry();

  if (walletService) {
    return <CustomWalletAddressBuilder {...props} walletService={walletService} />
  } else {
    return <TextualBuilder {...props} />
  }
}

type EmulatorAddressBuilderProps = CadenceValueBuilder & {
  walletService: IWalletService;
}

function CustomWalletAddressBuilder(props: EmulatorAddressBuilderProps): ReactElement {
  const { disabled, value, type, setValue, addressBuilderOptions, walletService } = props;
  const { data, mutate } = useGetAccounts();
  const { data: allKeys } = useGetManagedKeys();
  const accountsWithPrivateKeysLookup = new Set(
    allKeys?.filter((key) => Boolean(key.privateKey)).map((key) => key.address),
  );
  const accountsToShow = useMemo(
    () =>
      (addressBuilderOptions?.showManagedAccountsOnly
        ? data?.filter((account) =>
            accountsWithPrivateKeysLookup.has(account.address),
          )
        : data)?.sort((a, b) => a.address.localeCompare(b.address)),
    [addressBuilderOptions?.showManagedAccountsOnly, data],
  );

  useEffect(() => {
    const serviceAddress = "0xf8d6e0586b0a20c7";
    const defaultAccount =
      accountsToShow?.find((account) => account.address === serviceAddress) ??
      accountsToShow?.[0];
    if (
      !FclValueUtils.isFclAddressValue(value) &&
      defaultAccount &&
      !type.optional
    ) {
      setValue(defaultAccount.address);
    }
  }, [accountsToShow]);

  function toggleOrSelect(address: string) {
    if (type.optional && value === address) {
      setValue("");
    } else {
      setValue(address);
    }
  }

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
            onSelect={() => toggleOrSelect(account.address)}
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
          [classes.avatarWrapper__enabled]: !disabled,
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
        classes.newAccountButton,
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
