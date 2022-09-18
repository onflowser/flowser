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
import { useProjectActions } from "../../../contexts/project-actions.context";
import ReactTimeago from "react-timeago";

export const Main: FunctionComponent = () => {
  const { revertToBlock } = useProjectActions();
  const { data: projectObjects } = useGetProjectObjects();
  const { data: snapshots } = useGetPollingEmulatorSnapshots();
  const { contracts } = projectObjects ?? { contracts: [] };
  const limitedContracts = useLimitedArray(contracts);
  const limitedSnapshots = useLimitedArray(snapshots);

  return (
    <div className={classes.root}>
      <Card className={classes.card}>
        <div className={classes.content}>
          <div className={classes.title}>
            <div>Snapshots</div>
            <div className={classes.counter}>{snapshots.length}</div>
          </div>
          <div className={classes.itemsWrapper}>
            <ul className={classes.snapshotsList}>
              {snapshots.length === 0 && <span>No snapshots created yet</span>}
              {limitedSnapshots.data.map((snapshot) => (
                <li key={snapshot.id}>
                  <ProjectItem
                    title={snapshot.description}
                    footer={<ReactTimeago date={snapshot.createdAt} />}
                    rightSection={
                      <ProjectItemBadge
                        onClick={() => revertToBlock(snapshot.blockId)}
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
          <div className={classes.itemsWrapper}>
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
