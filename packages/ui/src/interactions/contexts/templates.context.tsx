import React, { createContext, ReactElement, useContext, useMemo } from "react";
import { InteractionDefinition } from "../core/core-types";
import { FclValue } from "@onflowser/core";
import { useLocalStorage } from "@uidotdev/usehooks";
import {
  useGetContracts,
  useGetWorkspaceInteractionTemplates,
} from "../../api";
import { WorkspaceTemplate } from "@onflowser/api";
import { FlixTemplate, useListFlixTemplates } from "../../hooks/flix";

type InteractionTemplatesRegistry = {
  templates: InteractionDefinitionTemplate[];
  saveTemplate: (definition: InteractionDefinition) => void;
  removeTemplate: (template: InteractionDefinitionTemplate) => void;
};

export type InteractionDefinitionTemplate = InteractionDefinition & {
  source: "workspace" | "flix" | "session";

  flix: FlixTemplate | undefined;
  workspace: WorkspaceTemplate | undefined;
};

// Internal structure that's persisted in local storage.
type SerializedSessionTemplate = {
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
  const { data: flixTemplates } = useListFlixTemplates();
  const { data: contracts } = useGetContracts();
  const [sessionTemplates, setSessionTemplates] = useLocalStorage<
    SerializedSessionTemplate[]
  >("interactions", []);

  const randomId = () => String(Math.random() * 1000000);

  const flowCoreContractNames = new Set([
    "FlowStorageFees",
    "MetadataViews",
    "NonFungibleToken",
    "ViewResolver",
    "FungibleToken",
    "FungibleTokenMetadataViews",
    "FlowToken",
    "FlowClusterQC",
    "FlowDKG",
    "FlowEpoch",
    "FlowIDTableStaking",
    "FlowServiceAccount",
    "FlowStakingCollection",
    "LockedTokens",
    "NFTStorefront",
    "NFTStorefrontV2",
    "StakingProxy",
    "FlowFees",
  ]);

  function isFlixTemplateUseful(template: FlixTemplate) {
    const importedContractNames = Object.values(template.data.dependencies)
      .map((dependency) => Object.keys(dependency))
      .flat();
    const nonCoreImportedContractNames = importedContractNames.filter(
      (name) => !flowCoreContractNames.has(name),
    );
    const nonCoreDeployedContractNamesLookup = new Set(
      contracts
        ?.filter((contract) => !flowCoreContractNames.has(contract.name))
        .map((contract) => contract.name),
    );

    // Interactions that only import core contracts are most likely generic ones,
    // not tailored specifically to some third party contract/project.
    const onlyImportsCoreContracts = nonCoreImportedContractNames.length === 0;
    const importsSomeNonCoreDeployedContract =
      nonCoreImportedContractNames.some((contractName) =>
        nonCoreDeployedContractNamesLookup.has(contractName),
      );

    return onlyImportsCoreContracts || importsSomeNonCoreDeployedContract;
  }

  const templates = useMemo<InteractionDefinitionTemplate[]>(
    () => [
      ...sessionTemplates.map(
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
          workspace: undefined,
          flix: undefined,
          source: "session"
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
          workspace: template,
          flix: undefined,
          source: "workspace"
        }),
      ) ?? []),
      ...(flixTemplates?.filter(isFlixTemplateUseful)?.map(
        (template): InteractionDefinitionTemplate => ({
          id: template.id,
          name: getFlixTemplateName(template),
          code: getCadenceWithNewImportSyntax(template),
          transactionOptions: undefined,
          initialOutcome: undefined,
          fclValuesByIdentifier: new Map(),
          createdDate: new Date(),
          updatedDate: new Date(),
          workspace: undefined,
          flix: template,
          source: "flix"
        }),
      ) ?? []),
    ],
    [sessionTemplates, workspaceTemplates],
  );

  function saveTemplate(interaction: InteractionDefinition) {
    const newTemplate: SerializedSessionTemplate = {
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
        (template) => template.name !== newTemplate.name,
      ),
      newTemplate,
    ]);
  }

  function removeTemplate(template: InteractionDefinitionTemplate) {
    setSessionTemplates((rawTemplates) =>
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

// Transform imports with replacement patterns to the new import syntax,
// since FLIX v1.0 doesn't support new import syntax yet.
// https://github.com/onflow/flow-interaction-template-tools/issues/12
function getCadenceWithNewImportSyntax(template: FlixTemplate) {
  const replacementPatterns = Object.keys(template.data.dependencies);
  return replacementPatterns.reduce(
    (cadence, pattern) => {
      const contractName = Object.keys(template.data.dependencies[pattern])[0];

      return cadence
        .replace(new RegExp(`from\\s+${pattern}`), "")
        .replace(new RegExp(`import\\s+${contractName}`), `import "${contractName}"`)
    },
    template.data.cadence,
  );
}

function getFlixTemplateName(template: FlixTemplate) {
  const englishTitle = template.data.messages?.title?.i18n?.["en-US"];
  if (englishTitle) {
    // Transactions generated with NFT catalog have this necessary prefix in titles.
    // https://github.com/onflow/nft-catalog
    return englishTitle.replace("This transaction ", "");
  } else {
    return "Unknown";
  }
}
