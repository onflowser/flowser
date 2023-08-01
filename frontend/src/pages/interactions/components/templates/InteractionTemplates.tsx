import React, { ReactElement } from "react";
import { useInteractionRegistry } from "../../contexts/interaction-registry.context";

export function InteractionTemplates(): ReactElement {
  const { templates } = useInteractionRegistry();

  return (
    <div>
      {templates.map((template) => (
        <div key={template.id}>{template.name}</div>
      ))}
    </div>
  );
}
