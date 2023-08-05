import React, { ReactElement } from "react";
import { useInteractionRegistry } from "../../contexts/interaction-registry.context";
import classes from "./InteractionTemplates.module.scss";
import { FlowserIcon } from "../../../../components/icons/Icons";
import {
  SimpleButton
} from '../../../../components/buttons/simple-button/SimpleButton';

export function InteractionTemplates(): ReactElement {
  const { templates, forkTemplate, removeTemplate } = useInteractionRegistry();

  return (
    <div className={classes.root}>
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
      {/* TODO(feature-interact-screen): Enable */}
      {/*<SimpleButton*/}
      {/*  className={classes.button}*/}
      {/*  onClick={() => persist(definition.id)}*/}
      {/*>*/}
      {/*  Save*/}
      {/*</SimpleButton>*/}
    </div>
  );
}
