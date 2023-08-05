import React, { ReactElement } from "react";
import { useInteractionRegistry } from "../../contexts/interaction-registry.context";
import classes from "./InteractionTemplates.module.scss";
import { FlowserIcon } from "../../../../components/icons/Icons";
import { PrimaryButton } from "../../../../components/buttons/primary-button/PrimaryButton";
import Input from "../../../../components/input/Input";

export function InteractionTemplates(): ReactElement {
  return (
    <div className={classes.root}>
      <StoredTemplates />
      <FocusedDefinitionSettings />
    </div>
  );
}

function StoredTemplates() {
  const { templates, forkTemplate, removeTemplate } = useInteractionRegistry();

  return (
    <div className={classes.storedTemplates}>
      {templates.map((template) => (
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
