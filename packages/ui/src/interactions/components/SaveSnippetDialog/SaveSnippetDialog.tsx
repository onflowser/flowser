import { ActionDialog } from "../../../common/overlays/dialogs/action/ActionDialog";
import Button from "../../../common/buttons/Button/Button";
import React from "react";
import { Input } from "../../../common/inputs";
import { useInteractionRegistry } from "../../contexts/interaction-registry.context";
import { useTemplatesRegistry } from "../../contexts/templates.context";
import { SizedBox } from "../../../common/misc/SizedBox/SizedBox";

type SaveSnippetDialogProps = {
  onClose: () => void;
}

export function SaveSnippetDialog(props: SaveSnippetDialogProps) {
  const { focusedDefinition, update, remove } = useInteractionRegistry();
  const { saveTemplate } = useTemplatesRegistry();

  if (!focusedDefinition) {
    throw new Error("Expected focused interaction definition")
  }

  return (
    <ActionDialog
      title="Save as Snippet?"
      onClose={props.onClose}
      footer={
        <>
          <Button outlined={true} variant="middle" onClick={props.onClose}>
            Cancel
          </Button>
          <Button variant="middle" onClick={() => {
            remove(focusedDefinition.id);
            props.onClose();
          }}>
            Discard
          </Button>
          <Button variant="middle" onClick={() => {
            saveTemplate(focusedDefinition);
            props.onClose();
          }}>
            Save
          </Button>
        </>
      }
    >
      <p style={{ textAlign: "center" }}>
        When saving your interaction as a snippet, it will appear under "Templates" tab on the left.
      </p>
      <SizedBox height={20} />
      <Input
        placeholder="Name"
        value={focusedDefinition.name}
        onChange={(e) => update({ ...focusedDefinition, name: e.target.value })}
      />
    </ActionDialog>
  )
}
