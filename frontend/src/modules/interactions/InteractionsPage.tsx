import React, { ReactElement, useState } from "react";
import classes from "./InteractionsPage.module.scss";
import { BaseTabs, BaseTabItem } from "../../components/tabs/BaseTabs/BaseTabs";
import { useInteractionRegistry } from "./contexts/interaction-registry.context";
import { InteractionOutcomeManagerProvider } from "./contexts/outcome.context";
import { InteractionHistory } from "./components/InteractionHistory/InteractionHistory";
import {
  InteractionDefinitionManagerProvider,
  useInteractionDefinitionManager,
} from "./contexts/definition.context";
import { InteractionTemplates } from "./components/InteractionTemplates/InteractionTemplates";
import { ExecutionSettings } from "./components/ExecutionSettings/ExecutionSettings";
import { CadenceEditor } from "../../components/code/CadenceEditor/CadenceEditor";
import { InteractionOutcomeDisplay } from "./components/InteractionOutcomeDisplay/InteractionOutcomeDisplay";
import { SpinnerWithLabel } from "../../components/loaders/Spinner/SpinnerWithLabel";
import { InteractionLabel } from "./components/InteractionLabel/InteractionLabel";

export function InteractionsPage(): ReactElement {
  const { definitions, focusedDefinition, remove, setFocused, create } =
    useInteractionRegistry();

  const sideMenuTabs: BaseTabItem[] = [
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

  const openEditorTabs: BaseTabItem[] = definitions.map((definition) => ({
    id: definition.id,
    label: <InteractionLabel interaction={definition} />,
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
      <BaseTabs
        className={classes.leftSideMenu}
        contentClassName={classes.content}
        currentTabId={currentSideMenuTabId}
        onChangeTab={(tab) => setCurrentSideMenuTabId(tab.id)}
        tabs={sideMenuTabs}
      />
      <BaseTabs
        className={classes.mainContent}
        tabWrapperClassName={classes.interactionsTabWrapper}
        tabClassName={classes.interactionTab}
        tabLabelClassName={classes.label}
        currentTabId={focusedDefinition?.id}
        onChangeTab={(tab) => setFocused(tab.id)}
        tabs={openEditorTabs}
        onClose={(tab) => remove(tab.id)}
        onAddNew={() => {
          const createdInteraction = create({
            name: "New interaction",
            code: "",
            fclValuesByIdentifier: new Map(),
            transactionOptions: undefined,
            initialOutcome: undefined,
          });
          setFocused(createdInteraction.id);
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
        <div className={classes.details}>
          <InteractionDetails />
        </div>
      </div>
      <ExecutionSettings />
    </div>
  );
}

function InteractionSourceEditor() {
  const { definition, partialUpdate } = useInteractionDefinitionManager();
  return (
    <CadenceEditor
      value={definition.code}
      onChange={(sourceCode) => partialUpdate({ code: sourceCode })}
    />
  );
}

function InteractionDetails() {
  const { parseError, isParsing } = useInteractionDefinitionManager();

  if (isParsing) {
    return <SpinnerWithLabel label="Parsing" />;
  }

  if (parseError) {
    return <pre className={classes.error}>{parseError}</pre>;
  }

  return <InteractionOutcomeDisplay />;
}
