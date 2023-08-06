import React, { ReactElement, useMemo, useState } from "react";
import { useInteractionRegistry } from "../../contexts/interaction-registry.context";
import classes from "./InteractionTemplates.module.scss";
import { FlowserIcon } from "../../../../components/icons/Icons";
import { PrimaryButton } from "../../../../components/buttons/primary-button/PrimaryButton";
import Input from "../../../../components/input/Input";
import { SearchInput } from "../../../../components/search-input/SearchInput";

export function InteractionTemplates(): ReactElement {
  return (
    <div className={classes.root}>
      <StoredTemplates />
      <FocusedDefinitionSettings />
    </div>
  );
}

function StoredTemplates() {
  const [searchTerm, setSearchTerm] = useState("");
  const { templates, forkTemplate, removeTemplate } = useInteractionRegistry();
  const filteredTemplates = useMemo(() => {
    if (searchTerm === "") {
      return templates;
    }
    return templates.filter((template) => template.name.includes(searchTerm));
  }, [searchTerm, templates]);

  return (
    <div className={classes.storedTemplates}>
      <SearchInput
        placeholder="Search templates..."
        searchTerm={searchTerm}
        onChangeSearchTerm={setSearchTerm}
      />
      {filteredTemplates.map((template) => (
        <div
          key={template.name}
          onClick={() => forkTemplate(template)}
          className={classes.item}
        >
          <span>{template.name}</span>
          <FlowserIcon.Trash
            className={classes.trash}
            onClick={(e) => {
              e.stopPropagation();
              removeTemplate(template);
            }}
          />
        </div>
      ))}
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
