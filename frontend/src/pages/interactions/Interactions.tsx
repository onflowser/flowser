import React, { ReactElement, useState } from "react";
import classes from "./Interactions.module.scss";
import { TabList, TabItem } from "../../components/tab-list/TabList";
import {
  InteractionRegistryProvider,
  useInteractionRegistry,
} from "./contexts/interaction-registry.context";
import { InteractionContent } from "./components/content/InteractionContent";
import { InteractionOutcomeManagerProvider } from "./contexts/outcome.context";
import { InteractionHistory } from "./components/history/InteractionHistory";
import { InteractionDefinitionManagerProvider } from "./contexts/definition.context";
import { InteractionTemplates } from "./components/templates/InteractionTemplates";
import { SizedBox } from "../../components/sized-box/SizedBox";

export function Interactions(): ReactElement {
  return (
    <InteractionRegistryProvider>
      <ContentWithProvider />
    </InteractionRegistryProvider>
  );
}

function ContentWithProvider() {
  const sideMenuTabs: TabItem[] = [
    {
      id: "history",
      label: "History",
      content: <InteractionHistory />,
    },
    {
      id: "templates",
      label: "Templates",
      content: <InteractionTemplates />,
    },
  ];
  const [currentSideMenuTabId, setCurrentSideMenuTabId] = useState(
    sideMenuTabs[0].id
  );

  const { definitions, focusedDefinition, remove, update, setFocused } =
    useInteractionRegistry();
  const openEditorTabs: TabItem[] = definitions.map((definition) => ({
    id: definition.id,
    label: definition.name,
    content: (
      <InteractionDefinitionManagerProvider definition={definition}>
        <InteractionOutcomeManagerProvider>
          <InteractionContent />
        </InteractionOutcomeManagerProvider>
      </InteractionDefinitionManagerProvider>
    ),
  }));

  return (
    <div className={classes.pageRoot}>
      <TabList
        className={classes.leftSideMenu}
        currentTabId={currentSideMenuTabId}
        onChangeTab={(tab) => setCurrentSideMenuTabId(tab.id)}
        tabs={sideMenuTabs}
      />
      <SizedBox width={20} />
      <TabList
        className={classes.mainContent}
        tabClassName={classes.interactionTab}
        currentTabId={focusedDefinition?.id}
        onChangeTab={(tab) => setFocused(tab.id)}
        tabs={openEditorTabs}
        onClose={(tab) => remove(tab.id)}
        onChangeLabel={(tab) => {
          const definition = definitions.find(
            (definition) => definition.id === tab.id
          );
          if (definition) {
            update({ ...definition, name: tab.label });
          }
        }}
      />
    </div>
  );
}
