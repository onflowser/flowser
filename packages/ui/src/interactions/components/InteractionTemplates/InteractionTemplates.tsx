import React, { ReactElement, useMemo, useState } from "react";
import { useInteractionRegistry } from "../../contexts/interaction-registry.context";
import classes from "./InteractionTemplates.module.scss";
import { FlowserIcon } from "../../../common/icons/FlowserIcon";
import { PrimaryButton } from "../../../common/buttons/PrimaryButton/PrimaryButton";
import { Input } from "../../../common/inputs";
import { SearchInput } from "../../../common/inputs";
import { useConfirmDialog } from "../../../contexts/confirm-dialog.context";
import classNames from "classnames";
import { InteractionLabel } from "../InteractionLabel/InteractionLabel";
import { useTemplatesRegistry } from "../../contexts/templates.context";
import { IdeLink } from "../../../common/links/IdeLink";
import { WorkspaceTemplate } from "@onflowser/api";
import { FLOW_FLIX_URL, useFlixSearch } from "../../../hooks/flix";
import { ExternalLink } from "../../../common/links/ExternalLink/ExternalLink";
import { LineSeparator } from "../../../common/misc/LineSeparator/LineSeparator";
import { Shimmer } from "../../../common/loaders/Shimmer/Shimmer";

export function InteractionTemplates(): ReactElement {
  return (
    <div className={classes.root}>
      <StoredTemplates />
      <FocusedInteraction />
    </div>
  );
}

function StoredTemplates() {
  const { showDialog } = useConfirmDialog();
  const [searchTerm, setSearchTerm] = useState("");
  const { create, focusedDefinition, setFocused } = useInteractionRegistry();
  const { templates, removeTemplate } = useTemplatesRegistry();
  const filteredTemplates = useMemo(() => {
    if (searchTerm === "") {
      return templates;
    }
    return templates.filter((template) => template.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, templates]);
  const filteredAndSortedTemplates = useMemo(
    () =>
      filteredTemplates.sort(
        (a, b) => b.updatedDate.getTime() - a.updatedDate.getTime()
      ),
    [filteredTemplates]
  );

  return (
    <div>
      <div className={classes.header}>
        <SearchInput
          placeholder="Search interactions ..."
          searchTerm={searchTerm}
          onChangeSearchTerm={setSearchTerm}
        />
      </div>
      <div className={classes.storedTemplates}>
        {filteredAndSortedTemplates.map((template) => (
          <div
            key={template.id}
            onClick={() => {
              const createdInteraction = create(template);
              setFocused(createdInteraction.id);
            }}
            className={classNames(classes.item, {
              [classes.focusedItem]: focusedDefinition?.id === template.id
            })}
          >
            <InteractionLabel interaction={template} />
            {template.source === "session" && (
              <FlowserIcon.Trash
                className={classes.trash}
                onClick={(e) => {
                  e.stopPropagation();
                  showDialog({
                    title: "Remove template",
                    body: (
                      <span style={{ textAlign: "center" }}>
                        Do you wanna permanently remove stored template
                        {`"${template.name}"`}?
                      </span>
                    ),
                    confirmButtonLabel: "REMOVE",
                    cancelButtonLabel: "CANCEL",
                    onConfirm: () => removeTemplate(template)
                  });
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function FocusedInteraction() {
  const { focusedDefinition } = useInteractionRegistry();
  const { templates } = useTemplatesRegistry();

  const correspondingTemplate = templates.find(
    (template) => template.id === focusedDefinition?.id
  );

  if (!correspondingTemplate) {
    return <SessionTemplateSettings />;
  }

  switch (correspondingTemplate.source) {
    case "workspace":
      return <WorkspaceTemplateInfo workspaceTemplate={correspondingTemplate.workspace!} />;
    case "flix":
      return (
        <div className={classes.focusedTemplate}>
          <FlixInfo sourceCode={correspondingTemplate.code} />
        </div>
      )
    case "session":
      return <SessionTemplateSettings />;
  }
}

function SessionTemplateSettings() {
  const { focusedDefinition, update } = useInteractionRegistry();
  const { saveTemplate } = useTemplatesRegistry();

  if (!focusedDefinition) {
    return null;
  }

  return (
    <div className={classes.focusedTemplate}>
      <FlixInfo sourceCode={focusedDefinition.code} />
      <Input
        placeholder="Name"
        value={focusedDefinition.name}
        onChange={(e) => update({ ...focusedDefinition, name: e.target.value })}
      />
      <PrimaryButton onClick={() => saveTemplate(focusedDefinition)}>
        Save
      </PrimaryButton>
    </div>
  );
}

function WorkspaceTemplateInfo(props: { workspaceTemplate: WorkspaceTemplate }) {
  const { workspaceTemplate } = props;

  return (
    <div className={classes.focusedTemplate}>
      <FlixInfo sourceCode={workspaceTemplate.code} />
      <div className={classes.workspaceInfo}>
        Open in:
        <div className={classes.actionButtons}>
          <IdeLink.VsCode filePath={workspaceTemplate.filePath} />
          <IdeLink.WebStorm filePath={workspaceTemplate.filePath} />
          <IdeLink.IntellijIdea filePath={workspaceTemplate.filePath} />
        </div>
      </div>
    </div>
  );
}

function FlixInfo(props: { sourceCode: string }) {
  const { data, isLoading } = useFlixSearch({
    sourceCode: props.sourceCode,
    network: "any"
  });

  if (isLoading) {
    return <Shimmer height={150} />
  }

  if (!data) {
    return (
      <div className={classes.flixInfo}>
        <div className={classes.title}>
          Unverified
          <FlowserIcon.CircleCross />
        </div>
        <LineSeparator horizontal />
        <div className={classes.body}>
          <p>
            This interaction is not yet verified by FLIX.
          </p>
          <ExternalLink inline href="https://github.com/onflow/flow-interaction-template-service#-propose-interaction-template">
            Submit for verification
          </ExternalLink>
        </div>
      </div>
    )
  }

  return (
    <div className={classes.flixInfo}>
      <div className={classes.title}>
        <ExternalLink className={classes.link} inline href="https://developers.flow.com/build/advanced-concepts/flix">
          Verified by
          <div className={classes.nameAndLogo}>
            <span>FLIX</span>
            <FlowserIcon.VerifiedCheck />
          </div>
        </ExternalLink>
      </div>
      <LineSeparator horizontal />
      <div className={classes.body}>
        <p>{data.data.messages.description?.i18n["en-US"]}</p>
        <ExternalLink inline href={`${FLOW_FLIX_URL}/v1/templates/${data.id}`} />
      </div>
    </div>
  );
}
