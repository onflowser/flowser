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

export const Main: FunctionComponent = () => {
  const { data: projectObjects } = useGetProjectObjects();
  const { data: snapshots } = useGetPollingEmulatorSnapshots();
  const { contracts } = projectObjects ?? { contracts: [] };
  const limitedContracts = useLimitedArray([
    ...contracts,
    ...contracts,
    ...contracts,
  ]);
  const limitedSnapshots = useLimitedArray(snapshots);

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
              {limitedSnapshots.data.map((snapshot) => (
                <li key={snapshot.id}>
                  <ProjectItem
                    title={snapshot.description}
                    footer={snapshot.createdAt}
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
