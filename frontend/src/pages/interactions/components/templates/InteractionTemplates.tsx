import React, { ReactElement } from "react";
import { useInteractionRegistry } from "../../contexts/interaction-registry.context";

export function InteractionTemplates(): ReactElement {
  const { templates, forkTemplate } = useInteractionRegistry();

  return (
    <div>
      {templates.map((template) => (
        <div key={template.id} onClick={() => forkTemplate(template)}>
          {template.name}
        </div>
      ))}
    </div>
  );
}
