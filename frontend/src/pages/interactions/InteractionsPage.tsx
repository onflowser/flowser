import React, { ReactElement, useState } from "react";
import classes from "./InteractionsPage.module.scss";
import { TabList, TabItem } from "../../components/tab-list/TabList";
import {
  InteractionRegistryProvider,
  useInteractionRegistry,
} from "./contexts/interaction-registry.context";
import { InteractionOutcomeManagerProvider } from "./contexts/outcome.context";
import { InteractionHistory } from "./components/history/InteractionHistory";
import {
  InteractionDefinitionManagerProvider,
  useInteractionDefinitionManager,
} from "./contexts/definition.context";
import { InteractionTemplates } from "./components/templates/InteractionTemplates";
import { SizedBox } from "../../components/sized-box/SizedBox";
import { LineSeparator } from "../../components/line-separator/LineSeparator";
import { ExecutionSettings } from "./components/execution/ExecutionSettings";
import { CadenceEditor } from "../../components/cadence-editor/CadenceEditor";
import { Spinner } from "../../components/spinner/Spinner";
import { InteractionOutcome } from "./components/outcome/InteractionOutcome";

export function InteractionsPage(): ReactElement {
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
          <InteractionBody />
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

function InteractionBody(): ReactElement {
  return (
    <div className={classes.body}>
      <div className={classes.content}>
        <div className={classes.code}>
          <InteractionSourceEditor />
        </div>
        <SizedBox height={20} />
        <div className={classes.details}>
          <InteractionDetails />
        </div>
      </div>
      <LineSeparator vertical />
      <ExecutionSettings />
    </div>
  );
}

function InteractionSourceEditor() {
  const { definition, setSourceCode } = useInteractionDefinitionManager();
  return (
    <CadenceEditor
      value={definition.sourceCode}
      onChange={(sourceCode) => setSourceCode(sourceCode)}
    />
  );
}

function InteractionDetails() {
  const { parseError, isParsing } = useInteractionDefinitionManager();

  if (isParsing) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Spinner size={50} />
      </div>
    );
  }

  if (parseError) {
    return <pre>{parseError}</pre>;
  }

  return <InteractionOutcome />;
}
