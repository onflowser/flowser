import { ManagedProcess, ManagedProcessState } from "@flowser/shared";
import { useAnalytics } from "../../hooks/use-analytics";
import { ServiceRegistry } from "../../services/service-registry";
import React, { ReactElement, useState } from "react";
import { useErrorHandler } from "../../hooks/use-error-handler";
import { AnalyticEvent } from "../../services/analytics.service";
import classNames from "classnames";
import classes from "../sidebar/SideBar.module.scss";
import { SimpleButton } from "../buttons/simple-button/SimpleButton";
import { Spinner } from "../spinner/Spinner";
import { FlowserIcon } from "../icons/Icons";

type ManagedProcessDisplayProps = { process: ManagedProcess };

export function ManagedProcessDisplay(
  props: ManagedProcessDisplayProps
): ReactElement {
  const { process } = props;
  const { track } = useAnalytics();
  const { processesService } = ServiceRegistry.getInstance();
  const [isRestarting, setRestarting] = useState(false);
  const { handleError } = useErrorHandler(ManagedProcessDisplay.name);

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
    <div className={classNames(classes.processItem)}>
      <span className={classes.label}>{process.name}</span>
      <div className={classes.processItemActions}>
        <SimpleButton className={classes.restartButton} onClick={onRestart}>
          <FlowserIcon.Restart />
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
