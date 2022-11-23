import React, { ReactElement, useCallback, useState } from "react";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import classes from "./SideBar.module.scss";
import { ReactComponent as SettingsIcon } from "../../assets/icons/settings-circle.svg";
import { ReactComponent as ShareFeedbackIcon } from "../../assets/icons/share-feedback.svg";
import { ReactComponent as ConnectIcon } from "../../assets/icons/connect-circle.svg";
import { ReactComponent as LogoutIcon } from "../../assets/icons/logout.svg";
import { ReactComponent as SendTxIcon } from "../../assets/icons/send-tx.svg";
import { ReactComponent as SwitchIcon } from "../../assets/icons/switch.svg";
import { ReactComponent as PlusIcon } from "../../assets/icons/plus.svg";
import { ReactComponent as CreateSnapshotIcon } from "../../assets/icons/create-snapshot.svg";
import { ReactComponent as RestartIcon } from "../../assets/icons/restart.svg";
import IconButton from "components/icon-button/IconButton";
import { SimpleButton } from "../simple-button/SimpleButton";
import {
  useGetCurrentProject,
  useGetPollingProcesses,
} from "../../hooks/use-api";
import { useHistory } from "react-router-dom";
import { useProjectActions } from "../../contexts/project.context";
import { useFlow } from "../../hooks/use-flow";
import { routes } from "../../constants/routes";
import classNames from "classnames";
import { UserIcon } from "../user-icon/UserIcon";
import { useGetAccountBalance } from "../../hooks/use-account-balance";
import { ManagedProcess, ManagedProcessState } from "@flowser/shared";
import { ServiceRegistry } from "../../services/service-registry";
import { useErrorHandler } from "../../hooks/use-error-handler";
import { Spinner } from "../spinner/Spinner";
import { ActionButton } from "../action-button/ActionButton";
import { useAnalytics } from "../../hooks/use-analytics";
import { AnalyticEvent } from "../../services/analytics.service";

export type Sidebar = {
  toggled: boolean;
  toggleSidebar: () => void;
};

export function SideBar({ toggled, toggleSidebar }: Sidebar): ReactElement {
  const history = useHistory();
  const { track } = useAnalytics();
  const { data: currentProjectData } = useGetCurrentProject();
  const { login, logout, user, isLoggedIn } = useFlow();
  const { switchProject, sendTransaction, createSnapshot } =
    useProjectActions();
  const { flow: flowBalance } = useGetAccountBalance(user?.addr ?? "");
  const { data: processes } = useGetPollingProcesses();
  const { project: currentProject } = currentProjectData ?? {};
  const createProject = useCallback(() => {
    history.push(routes.configure);
  }, []);

  const openSettings = () => {
    track(AnalyticEvent.CLICK_PROJECT_SETTINGS);

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
          <ActionButton
            onClick={switchProject}
            title="Switch project"
            icon={<SwitchIcon />}
          />
          <ActionButton
            onClick={openSettings}
            title="Settings"
            icon={<SettingsIcon />}
          />
          <ActionButton
            onClick={() => {
              window.open("mailto:info.flowser@gmail.com");
            }}
            title="Share Feedback"
            icon={<ShareFeedbackIcon />}
          />
          <div className={classes.menuDivider} />
          <span className={classes.menuSectionTitle}>EMULATOR</span>
          <ActionButton
            onClick={() => {
              track(AnalyticEvent.CLICK_CREATE_SNAPSHOT);
              toggleSidebar();
              createSnapshot();
            }}
            title="Create snapshot"
            icon={<CreateSnapshotIcon />}
          />
          <div className={classes.menuDivider} />
          <span className={classes.menuSectionTitle}>WALLET</span>
          {isLoggedIn && (
            <ActionButton
              onClick={onClickUserProfile}
              title={user?.addr ?? "-"}
              footer={flowBalance}
              icon={<UserIcon />}
            />
          )}
          {isLoggedIn && (
            <ActionButton
              onClick={() => {
                track(AnalyticEvent.CLICK_CREATE_SNAPSHOT);
                toggleSidebar();
                sendTransaction();
              }}
              title="Send transaction"
              icon={<SendTxIcon />}
            />
          )}
          {isLoggedIn ? (
            <ActionButton
              onClick={logout}
              title="Disconnect wallet"
              icon={<LogoutIcon />}
            />
          ) : (
            <ActionButton
              onClick={login}
              title="Connect wallet"
              icon={<ConnectIcon />}
            />
          )}
          <div className={classes.menuDivider} />
          <span className={classes.menuSectionTitle}>PROCESSES</span>
          <div className={classes.processItemsWrapper}>
            {processes.length > 0 ? (
              processes.map((process) => (
                <ManagedProcessItem key={process.id} process={process} />
              ))
            ) : (
              <span className={classes.description}>
                No processes are running within Flowser
              </span>
            )}
          </div>
        </div>
        <div>
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
      </div>
    </Drawer>
  );
}

function ManagedProcessItem({ process }: { process: ManagedProcess }) {
  const { track } = useAnalytics();
  const { processesService } = ServiceRegistry.getInstance();
  const [isRestarting, setRestarting] = useState(false);
  const { handleError } = useErrorHandler(ManagedProcessItem.name);

  async function onRestart() {
    track(AnalyticEvent.RESTART_PROCESS, {
      processId: process.id,
      processName: process.name,
    });

    setRestarting(true);
    try {
      await processesService.restart({ processId: process.id });
    } catch (e) {
      handleError(e);
    } finally {
      // The restart in most cases happens so quickly that it isn't even visible in the UI
      // This could fool the user that nothing happened, so let's fake a larger delay.
      const fakeRestartDelay = 500;
      setTimeout(() => setRestarting(false), fakeRestartDelay);
    }
  }

  return (
    <div className={classNames(classes.menuItem, classes.processItem)}>
      <span className={classes.label}>{process.name}</span>
      <div className={classes.processItemActions}>
        <SimpleButton className={classes.restartButton} onClick={onRestart}>
          <RestartIcon />
        </SimpleButton>
        <ManagedProcessStatus
          isRestarting={isRestarting}
          state={process.state}
        />
      </div>
    </div>
  );
}

function ManagedProcessStatus({
  state,
  isRestarting,
}: {
  isRestarting: boolean;
  state: ManagedProcessState;
}) {
  const isNotRunning =
    state === ManagedProcessState.MANAGED_PROCESS_STATE_NOT_RUNNING;
  const isRunning = state === ManagedProcessState.MANAGED_PROCESS_STATE_RUNNING;
  const isError = state === ManagedProcessState.MANAGED_PROCESS_STATE_ERROR;
  if (isRestarting) {
    return <Spinner size={14} />;
  }
  return (
    <div
      className={classNames(classes.processStatus, {
        [classes.processStatusError]: isError,
        [classes.processStatusNotRunning]: isNotRunning,
        [classes.processStatusRunning]: isRunning,
      })}
    />
  );
}
