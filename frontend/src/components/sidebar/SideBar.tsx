import React, { FunctionComponent, ReactElement, useCallback } from "react";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import classes from "./SideBar.module.scss";
import { ReactComponent as SettingsIcon } from "../../assets/icons/settings-circle.svg";
import { ReactComponent as ConnectIcon } from "../../assets/icons/connect-circle .svg";
import { ReactComponent as SwitchIcon } from "../../assets/icons/switch.svg";
import { ReactComponent as PlusIcon } from "../../assets/icons/plus.svg";
import IconButton from "components/icon-button/IconButton";
import { SimpleButton } from "../simple-button/SimpleButton";
import { useGetCurrentProject } from "../../hooks/use-api";
import { useHistory } from "react-router-dom";
import { useProjectActions } from "../../contexts/project-actions.context";
import { useFlow } from "../../hooks/use-flow";
import { routes } from "../../constants/routes";
import classNames from "classnames";

export type Sidebar = {
  toggled: boolean;
  toggleSidebar: () => void;
};

export function SideBar({ toggled, toggleSidebar }: Sidebar): ReactElement {
  const history = useHistory();
  const { data } = useGetCurrentProject();
  const { login } = useFlow();
  const { switchProject, sendTransaction } = useProjectActions();
  const { project: currentProject } = data ?? {};

  const createProject = useCallback(() => {
    history.push(`/${routes.start}/configure`);
  }, []);

  const openSettings = () => {
    history.push(`/start/configure/${currentProject?.id}`);
  };

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
          <SidebarButton
            onClick={switchProject}
            title="Switch project"
            iconComponent={SwitchIcon}
          />
          <SidebarButton
            onClick={openSettings}
            title="Settings"
            iconComponent={SettingsIcon}
          />
          <SidebarButton
            onClick={login}
            title="Connect wallet"
            iconComponent={ConnectIcon}
          />
          <SidebarButton
            onClick={sendTransaction}
            title="Send transaction"
            iconComponent={ConnectIcon}
          />
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
          {/* TODO(milestone-5): Show emulator status? */}
        </div>
      </div>
    </Drawer>
  );
}

function SidebarButton({
  onClick,
  title,
  iconComponent: IconComponent,
}: {
  onClick: () => void;
  title: string;
  iconComponent: FunctionComponent<{ className?: string }>;
}) {
  return (
    <SimpleButton className={classes.menuItem} onClick={onClick}>
      <IconComponent className={classes.icon} />
      <div className={classes.text}>{title}</div>
    </SimpleButton>
  );
}
