import Card from "components/card/Card";
import React, { FunctionComponent } from "react";
import classes from "./Main.module.scss";
import { ProjectItem } from "./ProjectItem";
import { ReactComponent as IconContracts } from "../../../assets/icons/contracts.svg";
import {
  useGetPollingEmulatorSnapshots,
  useGetProjectObjects,
} from "../../../hooks/use-api";
import {
  useLimitedArray,
  LimitedArrayState,
} from "../../../hooks/use-limited-array";
import { SimpleButton } from "../../../components/simple-button/SimpleButton";
import { ProjectItemBadge } from "./ProjectItemBadge";
import { EmulatorSnapshot } from "@flowser/shared";
import { ServiceRegistry } from "../../../services/service-registry";
import toast from "react-hot-toast";
import { useErrorHandler } from "../../../hooks/use-error-handler";

export const Main: FunctionComponent = () => {
  const { handleError } = useErrorHandler("Project");
  const { snapshotService } = ServiceRegistry.getInstance();
  const { data: projectObjects } = useGetProjectObjects();
  const { data: snapshots } = useGetPollingEmulatorSnapshots();
  const { contracts } = projectObjects ?? { contracts: [] };
  const limitedContracts = useLimitedArray(contracts);
  const limitedSnapshots = useLimitedArray(snapshots);

  async function onRevertToSnapshot(snapshot: EmulatorSnapshot) {
    try {
      await snapshotService.revertTo({
        blockId: snapshot.blockId,
      });
      toast.success(`Reverted to block ${snapshot.blockId}`);
    } catch (e) {
      handleError(e);
    }
  }

  return (
    <div className={classes.root}>
      <Card className={classes.card}>
        <div className={classes.content}>
          <div className={classes.title}>
            <div>Snapshots</div>
            <div className={classes.counter}>{snapshots.length}</div>
          </div>
          <div className={classes.items}>
            <ul className={classes.bar}>
              {snapshots.length === 0 && <span>No snapshots created yet</span>}
              {limitedSnapshots.data.map((snapshot) => (
                <li key={snapshot.id}>
                  <ProjectItem
                    title={snapshot.description}
                    footer={snapshot.createdAt}
                    rightSection={
                      <ProjectItemBadge
                        onClick={() => onRevertToSnapshot(snapshot)}
                      >
                        Revert
                      </ProjectItemBadge>
                    }
                  />
                </li>
              ))}
            </ul>
          </div>
          <ToggleLimitedButton
            title="Snapshots"
            limitedState={limitedSnapshots}
          />
        </div>
      </Card>
      <Card className={classes.card}>
        <div className={classes.content}>
          <div className={classes.title}>
            <div>Contracts</div>
            <div className={classes.counter}>{contracts.length}</div>
          </div>
          <div className={classes.items}>
            {contracts.length === 0 && (
              <span>No contracts defined in flow.json</span>
            )}
            {limitedContracts.data.map((contract) => (
              <div key={contract.filePath} className={classes.item}>
                <IconContracts />
                <ProjectItem title={contract.name} footer={contract.filePath} />
              </div>
            ))}
          </div>
          <ToggleLimitedButton
            title="Contracts"
            limitedState={limitedContracts}
          />
        </div>
      </Card>
    </div>
  );
};

function ToggleLimitedButton<DataItem>({
  title,
  limitedState,
}: {
  limitedState: LimitedArrayState<DataItem>;
  title: string;
}) {
  const showButton = limitedState.hiddenCount > 0;
  if (!showButton) {
    return null;
  }
  if (limitedState.isExpanded) {
    return (
      <SimpleButton className={classes.footer} onClick={limitedState.showLess}>
        <span>Show less</span>
      </SimpleButton>
    );
  } else {
    return (
      <SimpleButton className={classes.footer} onClick={limitedState.showMore}>
        <span>
          + {limitedState.hiddenCount} {title}
        </span>
      </SimpleButton>
    );
  }
}
