import React, { ReactElement, useMemo } from "react";
import classes from "./AddressParamBuilder.module.scss";
import { ParameterBuilder } from "../interface";
import { useGetPollingAccounts } from "../../../../../../hooks/use-api";
import { AccountAvatar } from "../../../../../../components/account/avatar/AccountAvatar";
import { AccountName } from "../../../../../../components/account/name/AccountName";
import { FlowserIcon } from "../../../../../../components/icons/Icons";
import classNames from "classnames";
import { ServiceRegistry } from "../../../../../../services/service-registry";

export function AddressParamBuilder(props: ParameterBuilder): ReactElement {
  const { parameterValue, setParameterValue } = props;
  const { data, refresh } = useGetPollingAccounts();
  const managedAccounts = useMemo(
    () =>
      data?.filter((account) =>
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
        <div
          key={account.address}
          className={classes.accountItem}
          onClick={() => setParameterValue(account.address)}
        >
          <div
            className={classNames(classes.avatarWrapper, {
              [classes.selectedAccount]: account.address === parameterValue,
            })}
          >
            <AccountAvatar address={account.address} />
          </div>
          <AccountName address={account.address} shorten />
        </div>
      ))}
      <div className={classes.accountItem} onClick={() => createNewAccount()}>
        <div className={classes.avatarWrapper}>
          <div className={classes.plusIconWrapper}>
            <FlowserIcon.Plus />
          </div>
        </div>
        <div>New</div>
      </div>
    </div>
  );
}
