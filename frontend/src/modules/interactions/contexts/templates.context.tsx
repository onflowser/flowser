import React, { createContext, ReactElement, useContext, useMemo } from "react";
import { useLocalStorage } from "usehooks-ts";
import { FclValue } from "@flowser/shared";
import { useGetPollingFlowInteractionTemplates } from "../../../hooks/use-api";
import { InteractionDefinition } from "../core/core-types";

type InteractionTemplatesRegistry = {
  templates: InteractionDefinitionTemplate[];
  saveTemplate: (definition: InteractionDefinition) => void;
  removeTemplate: (template: InteractionDefinitionTemplate) => void;
};

export type InteractionDefinitionTemplate = InteractionDefinition & {
  isMutable: boolean;
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
  const { data: projectTemplatesData } =
    useGetPollingFlowInteractionTemplates();
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
          isMutable: true,
        })
      ),
      ...(projectTemplatesData?.templates?.map(
        (template): InteractionDefinitionTemplate => ({
          id: crypto.randomUUID(),
          name: template.name,
          code: template.code,
          transactionOptions: undefined,
          initialOutcome: undefined,
          fclValuesByIdentifier: new Map(),
          createdDate: new Date(template.createdDate),
          updatedDate: new Date(template.updatedDate),
          isMutable: false,
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