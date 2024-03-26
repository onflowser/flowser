import React, { ReactElement, useState } from "react";
import classes from "./InteractionsPage.module.scss";
import { BaseTabs, BaseTabItem } from "../common/tabs/BaseTabs/BaseTabs";
import { useInteractionRegistry } from "./contexts/interaction-registry.context";
import { InteractionOutcomeManagerProvider } from "./contexts/outcome.context";
import { InteractionHistory } from "./components/InteractionHistory/InteractionHistory";
import {
  InteractionDefinitionManagerProvider,
  useInteractionDefinitionManager,
} from "./contexts/definition.context";
import { InteractionTemplates } from "./components/InteractionTemplates/InteractionTemplates";
import { ExecutionSettings } from "./components/ExecutionSettings/ExecutionSettings";
import { CadenceEditor } from "../common/code/CadenceEditor/CadenceEditor";
import { InteractionOutcomeDisplay } from "./components/InteractionOutcomeDisplay/InteractionOutcomeDisplay";
import { SpinnerWithLabel } from "../common/loaders/Spinner/SpinnerWithLabel";
import { InteractionLabel } from "./components/InteractionLabel/InteractionLabel";
import { SaveSnippetDialog } from "./components/SaveSnippetDialog/SaveSnippetDialog";
import { InteractionSourceType, useTemplatesRegistry } from "./contexts/templates.context";

type InteractionsPageTab = "history" | "templates"

type InteractionsPageProps = {
  tabOrder: InteractionsPageTab[];
  enabledInteractionSourceTypes: InteractionSourceType[];
}

export function InteractionsPage(props: InteractionsPageProps): ReactElement {
  const { definitions, focusedDefinition, setFocused, create, remove } =
    useInteractionRegistry();
  const {templates} = useTemplatesRegistry();
  const [interactionIdToSaveBeforeClose, setInteractionIdToSaveBeforeClose] = useState<string>();


  const unOrderedTabs: BaseTabItem<InteractionsPageTab>[] = [
    {
      id: "history",
      label: "History",
      content: <InteractionHistory />,
    },
    {
      id: "templates",
      label: "Templates",
      content: <InteractionTemplates enabledSourceTypes={props.enabledInteractionSourceTypes} />,
    },
  ];

  const sideMenuTabs: BaseTabItem<InteractionsPageTab>[] = props.tabOrder.map(tabId => unOrderedTabs.find(tab => tab.id === tabId)!);
  const [currentSideMenuTabId, setCurrentSideMenuTabId] = useState(
    sideMenuTabs[0].id,
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
      {interactionIdToSaveBeforeClose !== undefined && (
        <SaveSnippetDialog
          interactionId={interactionIdToSaveBeforeClose}
          onClose={() => setInteractionIdToSaveBeforeClose(undefined)}
        />
      )}
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
        onClose={(tab) => {
          const interaction = definitions.find(e => e.id === tab.id)!;
          const exactTemplateMatch = templates.find(template => template.code === interaction.code);
          const isAlreadySavedOrEmpty = exactTemplateMatch || interaction.code === "";
          if (isAlreadySavedOrEmpty) {
            remove(interaction.id);
          } else {
            setInteractionIdToSaveBeforeClose(interaction.id);
          }
        }}
        onAddNew={() => {
          const createdInteraction = create({
            name: "Untitled",
            code: "",
            forkedFromTemplateId: undefined,
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

export default InteractionsPage;
