import React, { ReactElement, useMemo, useState } from "react";
import { useInteractionRegistry } from "../../contexts/interaction-registry.context";
import classes from "./InteractionTemplates.module.scss";
import { FlowserIcon } from "../../../../components/icons/Icons";
import { PrimaryButton } from "../../../../components/buttons/primary-button/PrimaryButton";
import Input from "../../../../components/inputs/input/Input";
import { SearchInput } from "../../../../components/inputs/search-input/SearchInput";
import { useConfirmDialog } from "../../../../contexts/confirm-dialog.context";
import classNames from "classnames";
import { InteractionLabel } from "../InteractionLabel/InteractionLabel";

export function InteractionTemplates(): ReactElement {
  return (
    <div className={classes.root}>
      <StoredTemplates />
      <FocusedDefinitionSettings />
    </div>
  );
}

function StoredTemplates() {
  const { showDialog } = useConfirmDialog();
  const [searchTerm, setSearchTerm] = useState("");
  const { templates, forkTemplate, removeTemplate, focusedDefinition } =
    useInteractionRegistry();
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
            onClick={() => forkTemplate(template)}
            className={classNames(classes.item, {
              [classes.focusedItem]: focusedDefinition?.id === template.id,
            })}
          >
            <InteractionLabel interaction={template} />
            {template.isMutable && (
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

function FocusedDefinitionSettings() {
  const { focusedDefinition, update, persist } = useInteractionRegistry();

  if (!focusedDefinition) {
    return null;
  }

  return (
    <div className={classes.focusedTemplate}>
      <Input
        placeholder="Name"
        value={focusedDefinition.name}
        onChange={(e) => update({ ...focusedDefinition, name: e.target.value })}
      />
      <PrimaryButton onClick={() => persist(focusedDefinition.id)}>
        Save
      </PrimaryButton>
    </div>
  );
}
