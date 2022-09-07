import Card from "components/card/Card";
import React, { FunctionComponent } from "react";
import classes from "./Main.module.scss";
import { ProjectItem } from "./ProjectItem";
import { ReactComponent as IconContracts } from "../../../assets/icons/contracts.svg";
import {
  useGetPollingEmulatorSnapshots,
  useGetProjectObjects,
} from "../../../hooks/use-api";

export const Main: FunctionComponent = () => {
  const { data: projectObjects } = useGetProjectObjects();
  const { data: snapshots } = useGetPollingEmulatorSnapshots();
  const { contracts } = projectObjects ?? { contracts: [] };

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
              {snapshots.map((snapshot) => (
                <li key={snapshot.id}>
                  <ProjectItem
                    title={snapshot.description}
                    footer={snapshot.createdAt}
                  />
                </li>
              ))}
            </ul>
          </div>
          {/*<NavLink className={classes.footer} to={"#"}>*/}
          {/*  + 5 Snapshots*/}
          {/*</NavLink>*/}
        </div>
      </Card>
      <Card className={classes.card}>
        <div className={classes.content}>
          <div className={classes.title}>
            <div>Contracts</div>
            <div className={classes.counter}>{contracts.length}</div>
          </div>
          {contracts.map((contract) => (
            <div key={contract.filePath} className={classes.items}>
              <div className={classes.item}>
                <IconContracts />
                <ProjectItem title={contract.name} footer={contract.filePath} />
              </div>
            </div>
          ))}
          {/*<NavLink className={classes.footer} to={"#"}>*/}
          {/*  + 6 Contracts*/}
          {/*</NavLink>*/}
        </div>
      </Card>
    </div>
  );
};
