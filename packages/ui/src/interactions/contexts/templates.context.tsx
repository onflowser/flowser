import React, { createContext, ReactElement, useContext, useMemo } from "react";
import { InteractionDefinition } from "../core/core-types";
import { FclValue } from "@onflowser/core";
import { useLocalStorage } from "@uidotdev/usehooks";
import {
  useGetContracts,
  useGetWorkspaceInteractionTemplates,
} from "../../api";
import { WorkspaceTemplate } from "@onflowser/api";
import { useListFlixTemplates } from "../../hooks/use-flix";
import { useFlowNetworkId } from "../../contexts/flow-network.context";
import { SWRResponse } from "swr";
import { FlixV11Utils } from "@onflowser/core/src/flix-v11-utils";
import { FlixV11Template } from "@onflowser/core/src/flix-v11";

type InteractionTemplatesRegistry = {
  isLoading: boolean;
  error: string | undefined;
  templates: InteractionDefinitionTemplate[];
  saveAsSessionTemplate: (definition: InteractionDefinitionTemplate) => void;
  removeSessionTemplate: (template: InteractionDefinitionTemplate) => void;
};

export type InteractionSourceType = "workspace" | "flix" | "session";

export type InteractionDefinitionTemplate = Omit<InteractionDefinition, "forkedFromTemplateId"> & {
  source: InteractionSourceType;

  flix: FlixV11Template | undefined;
  workspace: WorkspaceTemplate | undefined;
};

// Internal structure that's persisted in local storage.
type SerializedSessionTemplate = {
  id: string;
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
  const workspaceTemplates = useGetWorkspaceInteractionTemplates();
  const flixTemplates = useListFlixTemplates();
  const networkId = useFlowNetworkId()
  const { data: contracts } = useGetContracts();
  const [sessionTemplates, setSessionTemplates] = useLocalStorage<
    SerializedSessionTemplate[]
  >("interactions", []);
  const flowNetworkId = useFlowNetworkId();
  const isLoading =
    getIsLoading(workspaceTemplates) ||
    getIsLoading(flixTemplates) ||
    !contracts;
  const error =
    getErrorMessage("Fail to load file templates", workspaceTemplates) ||
    getErrorMessage("Fail to load FLIX templates", flixTemplates);

  function isSupportedOnCurrentNetwork(template: FlixV11Template) {
    return FlixV11Utils.hasDependenciesForNetwork(template, networkId);
  }

  const randomId = () => String(Math.random() * 1000000);

  const templates = useMemo<InteractionDefinitionTemplate[]>(
    () => [
      ...sessionTemplates.map(
        (template): InteractionDefinitionTemplate => ({
          // Template ID was later at a later point, so it could be empty.
          id: template.id || randomId(),
          name: template.name,
          code: template.code,
          transactionOptions: undefined,
          initialOutcome: undefined,
          createdDate: new Date(template.createdDate),
          updatedDate: new Date(template.updatedDate),
          fclValuesByIdentifier: new Map(
            Object.entries(template.fclValuesByIdentifier),
          ),
          workspace: undefined,
          flix: undefined,
          source: "session"
        }),
      ),
      ...(workspaceTemplates.data?.map(
        (template): InteractionDefinitionTemplate => ({
          id: template.id,
          name: template.name,
          code: template.code,
          transactionOptions: undefined,
          initialOutcome: undefined,
          fclValuesByIdentifier: new Map(),
          createdDate: new Date(template.createdAt),
          updatedDate: new Date(template.updatedAt),
          workspace: template,
          flix: undefined,
          source: "workspace"
        }),
      ) ?? []),
      ...(flixTemplates.data?.filter(isSupportedOnCurrentNetwork)?.map(
        (template): InteractionDefinitionTemplate => ({
          id: template.id,
          name: FlixV11Utils.getName(template),
          code: FlixV11Utils.getCadenceSourceCode(template, networkId),
          transactionOptions: undefined,
          initialOutcome: undefined,
          fclValuesByIdentifier: new Map(),
          // Use the same date for all FLIX templates for consistent sorting.
          createdDate: new Date(0),
          updatedDate: new Date(0),
          workspace: undefined,
          flix: template,
          source: "flix"
        }),
      ) ?? []),
    ],
    [sessionTemplates, workspaceTemplates, flowNetworkId],
  );

  function saveAsSessionTemplate(interaction: InteractionDefinitionTemplate) {
    const newTemplate: SerializedSessionTemplate = {
      id: interaction.id,
      name: interaction.name,
      code: interaction.code,
      fclValuesByIdentifier: Object.fromEntries(
        interaction.fclValuesByIdentifier,
      ),
      transactionOptions: interaction.transactionOptions,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
    };

    setSessionTemplates([
      ...sessionTemplates.filter(
        (template) => template.id !== newTemplate.id,
      ),
      newTemplate,
    ]);
  }

  function removeSessionTemplate(template: InteractionDefinitionTemplate) {
    setSessionTemplates((rawTemplates) =>
      rawTemplates.filter(
        (existingTemplate) => existingTemplate.name !== template.name,
      ),
    );
  }

  return (
    <Context.Provider
      value={{
        error,
        isLoading,
        templates,
        removeSessionTemplate,
        saveAsSessionTemplate,
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

function getErrorMessage(label: string, swrResponse: SWRResponse) {
  if (swrResponse.error) {
    return `${label}: ${swrResponse.error?.message || swrResponse.error}`
  } else {
    return undefined;
  }
}

function getIsLoading(swrResponse: SWRResponse) {
  return !swrResponse.data && !swrResponse.error
}
