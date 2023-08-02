import React, { ReactElement } from "react";
import { useInteractionRegistry } from "../../contexts/interaction-registry.context";
import classes from "./InteractionTemplates.module.scss";
import { FlowserIcon } from "../../../../components/icons/Icons";

export function InteractionTemplates(): ReactElement {
  const { templates, forkTemplate, removeTemplate } = useInteractionRegistry();

  return (
    <div className={classes.root}>
      {templates.map((template) => (
        <div
          key={template.id}
          onClick={() => forkTemplate(template)}
          className={classes.item}
        >
          <span>{template.name}</span>
          <FlowserIcon.Trash
            className={classes.trash}
            onClick={(e) => {
              e.stopPropagation();
              removeTemplate(template.id);
            }}
          />
        </div>
      ))}
    </div>
  );
}
