import { ActionDialog } from "../../../common/overlays/dialogs/action/ActionDialog";
import Button from "../../../common/buttons/Button/Button";
import React from "react";
import { Input } from "../../../common/inputs";
import { useInteractionRegistry } from "../../contexts/interaction-registry.context";
import { useTemplatesRegistry } from "../../contexts/templates.context";
import { SizedBox } from "../../../common/misc/SizedBox/SizedBox";
import { InteractionDefinition } from "../../core/core-types";

type SaveSnippetDialogProps = {
  interactionId: string;
  onClose: () => void;
}

export function SaveSnippetDialog(props: SaveSnippetDialogProps) {
  const { interactionId } = props;
  const { definitions, update, remove } = useInteractionRegistry();
  const { saveAsSessionTemplate } = useTemplatesRegistry();
  const interaction = definitions.find(e => e.id === interactionId);

  if (!interaction) {
    throw new Error("Invariant: Interaction not found in registry")
  }

  return (
    <ActionDialog
      title="Save as Snippet?"
      onClose={props.onClose}
      footer={
        <>
          <Button outlined variant="middle" onClick={() => {
            remove(interaction.id);
            props.onClose();
          }}>
            Discard
          </Button>
          <Button variant="middle" onClick={() => {
            saveAsSessionTemplate(interaction);
            props.onClose();
          }}>
            Save
          </Button>
        </>
      }
    >
      <p style={{ textAlign: "center", maxWidth: "400px" }}>
        When saving your interaction as a snippet, it will appear under "Templates" tab on the left.
      </p>
      <SizedBox height={20} />
      <Input
        placeholder="Name"
        value={interaction.name}
        onChange={(e) => update({ ...interaction, name: e.target.value })}
      />
    </ActionDialog>
  )
}
