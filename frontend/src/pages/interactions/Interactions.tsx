import React, { ReactElement, useState } from "react";
import { CadenceEditor } from "../../components/cadence-editor/CadenceEditor";
import classes from "./Interactions.module.scss";
import { SideMenu, SideMenuTab } from "../../components/side-menu/SideMenu";

export function Interactions(): ReactElement {
  const sideMenuTabs: SideMenuTab[] = [
    {
      id: "action-history",
      label: "Action History",
      content: <ActionHistory />,
    },
    {
      id: "templates",
      label: "Templates",
      content: <Templates />,
    },
  ];
  const [currentTab, setCurrentTab] = useState(sideMenuTabs[0]);

  return (
    <div className={classes.pageRoot}>
      <SideMenu
        className={classes.sideMenuContainer}
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        tabs={sideMenuTabs}
      />
      <div className={classes.mainContent}>
        <CadenceEditor className={classes.editorSection} />
        <DetailsSection className={classes.detailsSection} />
      </div>
    </div>
  );
}

function ActionHistory() {
  return (
    <ul>
      <li>Action 1</li>
      <li>Action 2</li>
      <li>Action 3</li>
    </ul>
  );
}

function Templates() {
  return <div>Templates</div>;
}

function DetailsSection(props: { className?: string }) {
  return <div className={props.className}>Details</div>;
}
