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
import { ExternalLink } from "../../../components/link/ExternalLink";
import { SizedBox } from "../../../components/sized-box/SizedBox";
import { spacings } from "../../../styles/spacings";

export const Main: FunctionComponent = () => {
  const { checkoutBlock } = useProjectActions();
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
              {snapshots.length === 0 && (
                <>
                  <p>You haven{`'`}t created any snapshots yet</p>
                  <SizedBox height={spacings.base} />
                  <p>
                    Snapshots provide a way to store your local blockchain at
                    different points in time (aka. blocks).
                  </p>
                </>
              )}
              {limitedSnapshots.data.map((snapshot) => (
                <li key={snapshot.id}>
                  <ProjectItem
                    title={snapshot.description}
                    footer={<ReactTimeago date={snapshot.createdAt} />}
                    rightSection={
                      <ProjectItemBadge
                        onClick={() => checkoutBlock(snapshot.blockId)}
                      >
                        Jump to
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
              <>
                <p>No contracts defined in flow.json</p>
                <SizedBox height={spacings.base} />
                <p>
                  Get started with Cadence smart contract development on{" "}
                  <ExternalLink href="https://developers.flow.com/cadence/language/contracts">
                    flow developer portal
                  </ExternalLink>
                  .
                </p>
                <p>
                  ... or see how to define your Cadence files in flow
                  configuration{" "}
                  <ExternalLink href="https://developers.flow.com/tools/flow-cli/configuration#contracts" />
                </p>
              </>
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
