import React, { createContext, ReactElement, useContext, useMemo } from "react";
import { InteractionDefinition } from "../core/core-types";
import { FclValue } from "@onflowser/core";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useGetWorkspaceInteractionTemplates } from "../../api";
import useSWR, { SWRResponse } from "swr";
import { InteractionTemplate } from "@onflowser/api";
import { useServiceRegistry } from "../../contexts/service-registry.context";

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
  const { data: workspaceTemplates } = useGetWorkspaceInteractionTemplates();
  const {data: flixTemplates} = useGetFlixInteractionTemplates();
  const [customTemplates, setRawTemplates] = useLocalStorage<
    RawInteractionDefinitionTemplate[]
  >("interactions", []);

  const randomId = () => String(Math.random() * 1000000);

  const templates = useMemo<InteractionDefinitionTemplate[]>(
    () => [
      ...customTemplates.map(
        (template): InteractionDefinitionTemplate => ({
          id: randomId(),
          name: template.name,
          code: template.code,
          transactionOptions: undefined,
          initialOutcome: undefined,
          createdDate: new Date(template.createdDate),
          updatedDate: new Date(template.updatedDate),
          fclValuesByIdentifier: new Map(
            Object.entries(template.fclValuesByIdentifier),
          ),
          filePath: undefined,
        }),
      ),
      ...(workspaceTemplates?.map(
        (template): InteractionDefinitionTemplate => ({
          id: randomId(),
          name: template.name,
          code: template.code,
          transactionOptions: undefined,
          initialOutcome: undefined,
          fclValuesByIdentifier: new Map(),
          createdDate: new Date(template.createdAt),
          updatedDate: new Date(template.updatedAt),
          filePath: template.source?.filePath,
        }),
      ) ?? []),
      ...(flixTemplates?.map((template): InteractionDefinitionTemplate => ({
        id: template.id,
        name: template?.data?.messages?.title?.i18n?.["en-US"] ?? "Unknown",
        code: template.data.cadence,
        transactionOptions: undefined,
        initialOutcome: undefined,
        fclValuesByIdentifier: new Map(),
        createdDate: new Date(),
        updatedDate: new Date(),
        filePath: undefined,
      })) ?? []),
    ],
    [customTemplates, workspaceTemplates],
  );

  function saveTemplate(interaction: InteractionDefinition) {
    const newTemplate: RawInteractionDefinitionTemplate = {
      name: interaction.name,
      code: interaction.code,
      fclValuesByIdentifier: Object.fromEntries(
        interaction.fclValuesByIdentifier,
      ),
      transactionOptions: interaction.transactionOptions,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
    };

    setRawTemplates([
      ...customTemplates.filter(
        (template) => template.name !== newTemplate.name,
      ),
      newTemplate,
    ]);
  }

  function removeTemplate(template: InteractionDefinitionTemplate) {
    setRawTemplates((rawTemplates) =>
      rawTemplates.filter(
        (existingTemplate) => existingTemplate.name !== template.name,
      ),
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

// https://github.com/onflow/flips/blob/main/application/20220503-interaction-templates.md#interaction-interfaces
type FlixTemplate = {
  id: string;
  f_type: "InteractionTemplate";
  f_version: string;
  data: {
    messages: {
      title?: FlixMessage;
      description?: FlixMessage;
    }
    cadence: string;
    // TODO: Add other fields
  }
}

type FlixMessage = {
  i18n: {
    "en-US"?: string
  }
}

function useGetFlixInteractionTemplates(): SWRResponse<
  FlixTemplate[]
> {
  return useSWR(`flix-interaction-templates`, () =>
    fetch("http://localhost:3333/v1/templates").then(res => res.json())
  );
}
