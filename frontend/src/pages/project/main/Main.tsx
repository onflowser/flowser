import Card from "components/card/Card";
import React, { FunctionComponent, useEffect } from "react";
import classes from "./Main.module.scss";
import { ProjectItem } from "./ProjectItem";
import { ReactComponent as IconContracts } from "../../../assets/icons/contracts.svg";
import { NavLink } from "react-router-dom";

export const Main: FunctionComponent = () => {
  return (
    <div className={classes.root}>
      <Card className={classes.card}>
        <div className={classes.content}>
          <div className={classes.title}>
            <div>Snapshots</div>
            <div className={classes.counter}>10</div>
          </div>
          <div className={classes.items}>
            <ul className={classes.bar}>
              <li>
                <ProjectItem
                  content={{
                    title: "Block name given from the user",
                    timestamp: "Created on 20 Aug",
                  }}
                />
              </li>
              <li>
                <ProjectItem
                  content={{
                    title: "Block name",
                    timestamp: "Created on 20 Aug",
                  }}
                />
              </li>
              <li>
                <ProjectItem
                  content={{
                    title:
                      "Block name given from the user and it it is not limited by its length",
                    timestamp: "Created on 20 Aug",
                  }}
                />
              </li>
              <li>
                <ProjectItem
                  content={{
                    title: "Test",
                    timestamp: "Created on 20 Aug",
                  }}
                />
              </li>
              <li>
                <ProjectItem
                  content={{
                    title: "Block name",
                    timestamp: "Created on 20 Aug",
                  }}
                />
              </li>
              <li>
                <ProjectItem
                  content={{
                    title:
                      "Block name given from the user and it it is not limited by its length",
                    timestamp: "Created on 20 Aug",
                  }}
                />
              </li>
            </ul>
          </div>
          <NavLink className={classes.footer} to={"#"}>
            + 5 Snapshots
          </NavLink>
        </div>
      </Card>
      <Card className={classes.card}>
        <div className={classes.content}>
          <div className={classes.title}>
            <div>Contracts</div>
            <div className={classes.counter}>10</div>
          </div>
          <div className={classes.items}>
            <div className={classes.item}>
              <IconContracts />
              <ProjectItem
                content={{
                  title: "Contract name or id",
                  timestamp: "Deployed on 20 Aug",
                }}
              />
            </div>
            <div className={classes.item}>
              <IconContracts />
              <ProjectItem
                content={{
                  title: "Test",
                  timestamp: "Contract was not yet deployed",
                }}
              />
            </div>
            <div className={classes.item}>
              <IconContracts />
              <ProjectItem
                content={{
                  title: "Contract name or id",
                  timestamp: "Deployed on 20 Aug",
                }}
              />
            </div>
            <div className={classes.item}>
              <IconContracts />
              <ProjectItem
                content={{
                  title: "Test",
                  timestamp: "Contract was not yet deployed",
                }}
              />
            </div>
            <div className={classes.item}>
              <IconContracts />
              <ProjectItem
                content={{
                  title: "Contract name or id",
                  timestamp: "Deployed on 20 Aug",
                }}
              />
            </div>
          </div>
          <NavLink className={classes.footer} to={"#"}>
            + 6 Contracts
          </NavLink>
        </div>
      </Card>
    </div>
  );
};
