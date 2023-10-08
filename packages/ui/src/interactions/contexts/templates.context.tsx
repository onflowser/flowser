import React, { createContext, ReactElement, useContext, useMemo } from "react";
import { useFlowserHooksApi } from "../../contexts/flowser-api.context";
import { InteractionDefinition } from "../core/core-types";
import { FclValue } from "@onflowser/core";
import { useLocalStorage } from "@uidotdev/usehooks";
import * as crypto from "crypto";

type InteractionTemplatesRegistry = {
  templates: InteractionDefinitionTemplate[];
  saveTemplate: (definition: InteractionDefinition) => void;
  removeTemplate: (template: InteractionDefinitionTemplate) => void;
};

export type InteractionDefinitionTemplate = InteractionDefinition & {
  // Specified for project-based interaction templates.
  // These templates can't be updated,
  // since that would require making changes to the file system,
  // which is not implemented yet.
  filePath: string | undefined;
};

// Internal structure that's persisted in local storage.
type RawInteractionDefinitionTemplate = {
  name: string;
  code: string;
  fclValuesByIdentifier: Record<string, FclValue>;
  transactionOptions: TransactionOptions | undefined;
  createdDate: string;
  updatedDate: string;
};

export type TransactionOptions = {
  authorizerAddresses: string[];
  proposerAddress: string;
  payerAddress: string;
};

const Context = createContext<InteractionTemplatesRegistry>(undefined as never);

export function TemplatesRegistryProvider(props: {
  children: React.ReactNode;
}): ReactElement {
  const api = useFlowserHooksApi();
  const { data: projectTemplatesData } = api.useGetInteractionTemplates();
  const [customTemplates, setRawTemplates] = useLocalStorage<
    RawInteractionDefinitionTemplate[]
  >("interactions", []);
  const templates = useMemo<InteractionDefinitionTemplate[]>(
    () => [
      ...customTemplates.map(
        (template): InteractionDefinitionTemplate => ({
          id: crypto.randomUUID(),
          name: template.name,
          code: template.code,
          transactionOptions: undefined,
          initialOutcome: undefined,
          createdDate: new Date(template.createdDate),
          updatedDate: new Date(template.updatedDate),
          fclValuesByIdentifier: new Map(
            Object.entries(template.fclValuesByIdentifier)
          ),
          filePath: undefined,
        })
      ),
      ...(projectTemplatesData?.map(
        (template): InteractionDefinitionTemplate => ({
          id: crypto.randomUUID(),
          name: template.name,
          code: template.code,
          transactionOptions: undefined,
          initialOutcome: undefined,
          fclValuesByIdentifier: new Map(),
          createdDate: new Date(template.createdDate),
          updatedDate: new Date(template.updatedDate),
          filePath: template.source?.filePath,
        })
      ) ?? []),
    ],
    [customTemplates, projectTemplatesData]
  );

  function saveTemplate(interaction: InteractionDefinition) {
    const newTemplate: RawInteractionDefinitionTemplate = {
      name: interaction.name,
      code: interaction.code,
      fclValuesByIdentifier: Object.fromEntries(
        interaction.fclValuesByIdentifier
      ),
      transactionOptions: interaction.transactionOptions,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
    };

    setRawTemplates([
      ...customTemplates.filter(
        (template) => template.name !== newTemplate.name
      ),
      newTemplate,
    ]);
  }

  function removeTemplate(template: InteractionDefinitionTemplate) {
    setRawTemplates((rawTemplates) =>
      rawTemplates.filter(
        (existingTemplate) => existingTemplate.name !== template.name
      )
    );
  }

  return (
    <Context.Provider
      value={{
        templates,
        removeTemplate,
        saveTemplate,
      }}
    >
      {props.children}
    </Context.Provider>
  );
}

export function useTemplatesRegistry(): InteractionTemplatesRegistry {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error("Interaction templates registry provider not found");
  }

  return context;
}
