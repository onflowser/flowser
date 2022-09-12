import React, { ReactElement, useCallback } from "react";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import classes from "./SideBar.module.scss";
import { ReactComponent as SettingsIcon } from "../../assets/icons/settings-circle.svg";
import { ReactComponent as ConnectIcon } from "../../assets/icons/connect-circle.svg";
import { ReactComponent as SendTxIcon } from "../../assets/icons/send-tx.svg";
import { ReactComponent as SwitchIcon } from "../../assets/icons/switch.svg";
import { ReactComponent as PlusIcon } from "../../assets/icons/plus.svg";
import IconButton from "components/icon-button/IconButton";
import { SimpleButton } from "../simple-button/SimpleButton";
import {
  useGetCurrentProject,
  useGetPollingProcesses,
} from "../../hooks/use-api";
import { useHistory } from "react-router-dom";
import { useProjectActions } from "../../contexts/project-actions.context";
import { useFlow } from "../../hooks/use-flow";
import { routes } from "../../constants/routes";
import classNames from "classnames";
import { UserIcon } from "../user-icon/UserIcon";
import { useGetAccountBalance } from "../../hooks/use-account-balance";
import { ManagedProcess, ManagedProcessState } from "@flowser/shared";

export type Sidebar = {
  toggled: boolean;
  toggleSidebar: () => void;
};

export function SideBar({ toggled, toggleSidebar }: Sidebar): ReactElement {
  const history = useHistory();
  const { data: currentProjectData } = useGetCurrentProject();
  const { login, logout, user, isLoggedIn } = useFlow();
  const { switchProject, sendTransaction } = useProjectActions();
  const { flow: flowBalance } = useGetAccountBalance(user?.addr);
  const { data: processes } = useGetPollingProcesses();
  const { project: currentProject } = currentProjectData ?? {};

  const createProject = useCallback(() => {
    history.push(`/${routes.start}/configure`);
  }, []);

  const openSettings = () => {
    history.push(`/start/configure/${currentProject?.id}`);
  };

  function onClickUserProfile() {
    history.push(`/accounts/details/${user?.addr}`);
    toggleSidebar();
  }

  return (
    <Drawer
      open={toggled}
      direction={"right"}
      onClose={toggleSidebar}
      className={classes.sidebar}
      size={300}
      duration={300}
    >
      <div className={classes.menu}>
        <div>
          <span className={classes.menuSectionTitle}>FLOWSER</span>
          <SidebarButton
            onClick={switchProject}
            title="Switch project"
            icon={<SwitchIcon />}
          />
          <SidebarButton
            onClick={openSettings}
            title="Settings"
            icon={<SettingsIcon />}
          />
          <div className={classes.menuDivider} />
          <span className={classes.menuSectionTitle}>EMULATOR</span>
          {isLoggedIn && (
            <SidebarButton
              onClick={onClickUserProfile}
              title={user?.addr}
              footer={flowBalance}
              icon={<UserIcon />}
            />
          )}
          {isLoggedIn && (
            <SidebarButton
              onClick={sendTransaction}
              title="Send transaction"
              icon={<SendTxIcon />}
            />
          )}
          {isLoggedIn ? (
            <SidebarButton
              onClick={logout}
              title="Disconnect wallet"
              icon={<ConnectIcon />}
            />
          ) : (
            <SidebarButton
              onClick={login}
              title="Connect wallet"
              icon={<ConnectIcon />}
            />
          )}
        </div>
        <div>
          {processes.map((process) => (
            <ManagedProcessItem key={process.id} process={process} />
          ))}
        </div>
        <div className={classNames(classes.menuItem, classes.footer)}>
          <IconButton
            onClick={createProject}
            icon={<PlusIcon></PlusIcon>}
            iconPosition="before"
            className={classes.button}
          >
            NEW PROJECT
          </IconButton>
        </div>
      </div>
    </Drawer>
  );
}

function SidebarButton({
  onClick,
  title,
  footer,
  icon,
}: {
  onClick: () => void;
  title: string;
  footer?: string;
  icon: ReactElement;
}) {
  return (
    <SimpleButton className={classes.menuItem} onClick={onClick}>
      <div className={classes.menuItemIcon}>{icon}</div>
      <div className={classes.menuItemMainWrapper}>
        <div className={classes.menuItemHeader}>{title}</div>
        {footer && <span className={classes.menuItemFooter}>{footer}</span>}
      </div>
    </SimpleButton>
  );
}

function ManagedProcessItem({ process }: { process: ManagedProcess }) {
  return (
    <div className={classNames(classes.menuItem, classes.processItem)}>
      <span>{processIdToName(process.id)}</span>
      <div>
        <ManagedProcessStatus state={process.state} />
      </div>
    </div>
  );
}

function ManagedProcessStatus({ state }: { state: ManagedProcessState }) {
  return (
    <div
      className={classNames(classes.processStatus, {
        [classes.processStatusError]:
          state === ManagedProcessState.MANAGED_PROCESS_STATE_ERROR,
        [classes.processStatusNotRunning]:
          state === ManagedProcessState.MANAGED_PROCESS_STATE_NOT_RUNNING,
        [classes.processStatusRunning]:
          state === ManagedProcessState.MANAGED_PROCESS_STATE_RUNNING,
      })}
    />
  );
}

function processIdToName(processId: string) {
  switch (processId) {
    case "dev-wallet":
      return "Dev Wallet";
    case "emulator":
      return "Emulator";
    default:
      return "Unknown";
  }
}
