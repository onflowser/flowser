import { ActionDialog } from "../../../common/overlays/dialogs/action/ActionDialog";
import Button from "../../../common/buttons/Button/Button";
import React, { useState } from "react";
import { Input } from "../../../common/inputs";
import { useTemplatesRegistry } from "../../contexts/templates.context";

type SaveSnippetDialogProps = {
  templateId: string;
  onClose: () => void;
}

export function EditTemplateNameDialog(props: SaveSnippetDialogProps) {
  const { templateId } = props;
  const templatesRegistry = useTemplatesRegistry();
  const template = templatesRegistry.templates.find(e => e.id === templateId);

  if (!template) {
    throw new Error("Invariant: Template not found in registry")
  }

  const [name, setName] = useState(template.name);

  return (
    <ActionDialog
      title="Rename template"
      onClose={props.onClose}
      footer={
        <>
          <Button outlined variant="middle" onClick={() => {
            props.onClose();
          }}>
            Cancel
          </Button>
          <Button variant="middle" onClick={() => {
            templatesRegistry.saveAsSessionTemplate({ ...template, name });
            props.onClose();
          }}>
            Save
          </Button>
        </>
      }
    >
      <Input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
    </ActionDialog>
  )
}
