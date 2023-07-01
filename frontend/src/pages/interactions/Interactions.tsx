import React, { ReactElement, useState } from "react";
import classes from "./Interactions.module.scss";
import { TabList, TabItem } from "../../components/tab-list/TabList";
import {
  InteractionDefinitionsManagerProvider,
  useInteractionDefinitionsManager,
} from "./contexts/definition.context";
import { InteractionContent } from "./components/content/InteractionContent";
import { InteractionOutcomeManagerProvider } from "./contexts/outcome.context";
import { InteractionHistory } from "./components/history/InteractionHistory";

export function Interactions(): ReactElement {
  return (
    <InteractionDefinitionsManagerProvider>
      <ContentWithProvider />
    </InteractionDefinitionsManagerProvider>
  );
}

function ContentWithProvider() {
  const sideMenuTabs: TabItem[] = [
    {
      id: "action-history",
      label: "Action History",
      content: <InteractionHistory />,
    },
    {
      id: "templates",
      label: "Templates",
      content: <div>TODO</div>,
    },
  ];
  const [currentSideMenuTab, setCurrentSideMenuTab] = useState(sideMenuTabs[0]);

  // TODO(feature-interact-screen): Add ability to add new tabs and switch between them
  const { definitions } = useInteractionDefinitionsManager();
  const openEditorTabs: TabItem[] = definitions.map((definition) => ({
    id: definition.id,
    label: definition.name,
    content: (
      <InteractionOutcomeManagerProvider interactionId={definition.id}>
        <InteractionContent />
      </InteractionOutcomeManagerProvider>
    ),
  }));
  const [currentEditorTab, setCurrentEditorTab] = useState<TabItem>(
    openEditorTabs[0]
  );

  return (
    <div className={classes.pageRoot}>
      <TabList
        className={classes.leftSideMenu}
        currentTab={currentSideMenuTab}
        onChangeTab={setCurrentSideMenuTab}
        tabs={sideMenuTabs}
      />
      <TabList
        className={classes.mainContent}
        currentTab={currentEditorTab}
        onChangeTab={setCurrentEditorTab}
        tabs={openEditorTabs}
      />
    </div>
  );
}
