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
import { LineSeparator } from "../common/misc/LineSeparator/LineSeparator";
import { ExternalLink } from "../common/links/ExternalLink/ExternalLink";
import { Callout } from "../common/misc/Callout/Callout";
import { SizedBox } from "../common/misc/SizedBox/SizedBox";

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
        defaultContent={<EmptyState />}
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
            name: "New interaction",
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

function EmptyState() {
  return (
    <div className={classes.emptyState}>
      <Callout
        icon="🚀"
        title="Getting started #onFlow"
        description={
          <div>
            <p>
              Here are some resources that should help you get started on
              Flow.
            </p>
            <LineSeparator horizontal />
            <ExternalLink href="https://developers.flow.com" />
            <ExternalLink href="https://academy.ecdao.org" />
          </div>
        }
      />
      <Callout
        icon="💡"
        title="Interacting with the blockchain"
        description={
          <div>
            <p>
              Cadence transactions or scripts are used to interact with the Flow
              blockchain.
            </p>
            <SizedBox height={10} />
            <p>
              <b>
                <ExternalLink
                  inline
                  href="https://developers.flow.com/cadence/language/transactions"
                >
                  Transactions
                </ExternalLink>
              </b>{" "}
              can be used to trigger state changes, while{" "}
              <b>
                <ExternalLink
                  inline
                  href="https://developers.flow.com/tooling/fcl-js/scripts"
                >
                  scripts
                </ExternalLink>
              </b>{" "}
              are used for reading existing state from the blockchain.
            </p>
          </div>
        }
      />
    </div>
  )
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
