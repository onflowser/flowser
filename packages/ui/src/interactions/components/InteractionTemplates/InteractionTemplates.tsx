import React, { ReactElement, useMemo, useState } from "react";
import { useInteractionRegistry } from "../../contexts/interaction-registry.context";
import classes from "./InteractionTemplates.module.scss";
import { FlowserIcon } from "../../../common/icons/FlowserIcon";
import { PrimaryButton } from "../../../common/buttons/PrimaryButton/PrimaryButton";
import { Input } from "../../../common/inputs/Input/Input";
import { SearchInput } from "../../../common/inputs/SearchInput/SearchInput";
import { useConfirmDialog } from "../../../../../../frontend/src/contexts/confirm-dialog.context";
import classNames from "classnames";
import { InteractionLabel } from "../InteractionLabel/InteractionLabel";
import { useTemplatesRegistry } from "../../contexts/templates.context";
import { IdeLink } from "../../../common/links/IdeLink";

export function InteractionTemplates(): ReactElement {
  return (
    <div className={classes.root}>
      <StoredTemplates />
      <FocusedTemplateSettings />
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
    return templates.filter((template) => template.name.includes(searchTerm));
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
              [classes.focusedItem]: focusedDefinition?.id === template.id,
            })}
          >
            <InteractionLabel interaction={template} />
            {!template.filePath && (
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
                    onConfirm: () => removeTemplate(template),
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

function FocusedTemplateSettings() {
  const { focusedDefinition, update } = useInteractionRegistry();
  const { templates, saveTemplate } = useTemplatesRegistry();

  if (!focusedDefinition) {
    return null;
  }

  const correspondingTemplate = templates.find(
    (template) => template.id === focusedDefinition.id
  );

  if (correspondingTemplate && correspondingTemplate.filePath) {
    return (
      <div className={classes.focusedTemplate}>
        Open in:
        <div className={classes.actionButtons}>
          <IdeLink.VsCode filePath={correspondingTemplate.filePath} />
          <IdeLink.WebStorm filePath={correspondingTemplate.filePath} />
          <IdeLink.IntellijIdea filePath={correspondingTemplate.filePath} />
        </div>
      </div>
    );
  }

  return (
    <div className={classes.focusedTemplate}>
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
