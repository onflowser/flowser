import React, { ReactElement, useState } from "react";
import classes from "./InteractionsPage.module.scss";
import { Tabs, TabItem } from "../../components/tabs/Tabs";
import { useInteractionRegistry } from "./contexts/interaction-registry.context";
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
import { InteractionOutcome } from "./components/outcome/InteractionOutcome";
import { SpinnerWithLabel } from "../../components/spinner/SpinnerWithLabel";
import { InteractionLabel } from "./components/interaction-label/InteractionLabel";

export function InteractionsPage(): ReactElement {
  const { definitions, focusedDefinition, remove, setFocused, forkTemplate } =
    useInteractionRegistry();

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

  const openEditorTabs: TabItem[] = definitions.map((definition) => ({
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
      <Tabs
        className={classes.leftSideMenu}
        contentClassName={classes.content}
        currentTabId={currentSideMenuTabId}
        onChangeTab={(tab) => setCurrentSideMenuTabId(tab.id)}
        tabs={sideMenuTabs}
      />
      <SizedBox width={20} />
      <Tabs
        className={classes.mainContent}
        tabWrapperClassName={classes.interactionsTabWrapper}
        tabClassName={classes.interactionTab}
        tabLabelClassName={classes.label}
        currentTabId={focusedDefinition?.id}
        onChangeTab={(tab) => setFocused(tab.id)}
        tabs={openEditorTabs}
        onClose={(tab) => remove(tab.id)}
        onAddNew={() =>
          forkTemplate({
            id: crypto.randomUUID(),
            name: "New interaction",
            code: "",
            fclValuesByIdentifier: new Map(),
            transactionOptions: undefined,
            createdDate: new Date(),
            updatedDate: new Date(),
            // TODO(feature-interact-screen): This should be defined in the implemented function
            isMutable: true,
          })
        }
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

  return <InteractionOutcome />;
}
