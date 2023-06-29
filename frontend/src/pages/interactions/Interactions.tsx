import React, { ReactElement, useState } from "react";
import { CadenceEditor } from "../../components/cadence-editor/CadenceEditor";
import classes from "./Interactions.module.scss";
import { TabList, TabItem } from "../../components/tab-list/TabList";
import { SimpleButton } from "../../components/simple-button/SimpleButton";
import {
  FlowInteraction,
  InteractionsProvider,
  useInteractions,
  useSingleInteractionCRUD,
} from "../../contexts/interactions.context";

export function Interactions(): ReactElement {
  return (
    <InteractionsProvider>
      <ContentWithProvider />
    </InteractionsProvider>
  );
}

function ContentWithProvider() {
  const sideMenuTabs: TabItem[] = [
    {
      id: "action-history",
      label: "Action History",
      content: <ActionHistoryTab />,
    },
    {
      id: "templates",
      label: "Templates",
      content: <TemplatesTab />,
    },
  ];
  const [currentTab, setCurrentTab] = useState(sideMenuTabs[0]);

  return (
    <div className={classes.pageRoot}>
      <TabList
        className={classes.leftSideMenu}
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        tabs={sideMenuTabs}
      />
      <div className={classes.mainContent}>
        <div className={classes.editorSection}>
          <CodeSection />
        </div>
        <div className={classes.detailsSection}>
          <DetailsSection />
        </div>
      </div>
      <div className={classes.rightSideBar}>
        <ArgumentsSidebar />
      </div>
    </div>
  );
}

function ActionHistoryTab() {
  return (
    <ul>
      <li>Action 1</li>
      <li>Action 2</li>
      <li>Action 3</li>
    </ul>
  );
}

function TemplatesTab() {
  return <div>Templates</div>;
}

function DetailsSection() {
  return <div>Details</div>;
}

function ArgumentsSidebar() {
  return (
    <div>
      <SimpleButton>Execute</SimpleButton>
    </div>
  );
}

function CodeSection() {
  const { openInteractions } = useInteractions();

  const openEditorTabs: TabItem[] = openInteractions.map((openInteraction) => ({
    id: openInteraction.id,
    label: openInteraction.name,
    content: <EditorTabContent interaction={openInteraction} />,
  }));
  const [currentTab, setCurrentTab] = useState<TabItem>(openEditorTabs[0]);

  if (!currentTab) {
    throw new Error("Assertion failed: Must always be an open code tab");
  }

  // TODO(feature-interact-screen): Add ability to add new tabs and switch between them
  return (
    <div>
      <TabList
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        tabs={openEditorTabs}
      />
    </div>
  );
}

type EditorTabContentProps = {
  interaction: FlowInteraction;
};

function EditorTabContent(props: EditorTabContentProps) {
  const { value, update } = useSingleInteractionCRUD(props.interaction.id);

  return (
    <CadenceEditor value={value.code} onChange={(code) => update({ code })} />
  );
}
