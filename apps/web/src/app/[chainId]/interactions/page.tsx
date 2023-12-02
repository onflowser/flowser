"use client";
import { InteractionsPage } from "@onflowser/ui/src/interactions/InteractionsPage";
import { InteractionRegistryProvider } from "@onflowser/ui/src/interactions/contexts/interaction-registry.context";
import { TemplatesRegistryProvider } from "@onflowser/ui/src/interactions/contexts/templates.context";
import { NavigationProvider } from "@onflowser/ui/src/contexts/navigation.context";
import { ReactNode } from "react";
import { useParams, useSelectedLayoutSegments, usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  ExecuteScriptRequest,
  IInteractionService, SendTransactionRequest,
  ServiceRegistryProvider
} from "@onflowser/ui/src/contexts/service-registry.context";
import { InteractionTemplate, ParsedInteractionOrError } from "@onflowser/api";


class InteractionsService implements IInteractionService {
  executeScript(request: ExecuteScriptRequest): Promise<any> {
    return Promise.resolve(undefined);
  }

  getTemplates(): Promise<InteractionTemplate[]> {
    return Promise.resolve([]);
  }

  async parse(sourceCode: string): Promise<ParsedInteractionOrError> {
    const url = new URL("http://localhost:3000/flow-emulator/interactions/parsed");
    url.searchParams.append("sourceCode", sourceCode);
    return fetch(url).then(res => res.json())
  }

  sendTransaction(request: SendTransactionRequest): Promise<{ transactionId: string }> {
    return Promise.resolve({ transactionId: "" });
  }

}


export default function Page() {
  return (
    <NextJsNavigationProvider>
      <ServiceRegistryProvider
        // @ts-ignore
        services={{
          interactionsService: new InteractionsService()
        }}
      >
        <InteractionRegistryProvider>
          <TemplatesRegistryProvider>
            <InteractionsPage />
          </TemplatesRegistryProvider>
        </InteractionRegistryProvider>
      </ServiceRegistryProvider>
    </NextJsNavigationProvider>
  );
}

function NextJsNavigationProvider(props: { children: ReactNode }) {
  const params = useParams();
  const matches = useSelectedLayoutSegments();
  const pathname = usePathname();
  const {} = useRouter();
  const search = useSearchParams();

  function navigate() {
    // TODO(web-mvp): Implement
  }


  console.log({ matches, pathname });
  return (
    <NavigationProvider controller={{
      params,
      // TODO(web-mvp): Implement matches
      matches: [],
      navigate,
      location: {
        search,
        pathname,
        // TODO(web-mvp): Implement hash
        hash: ""
      }
    }}>
      {props.children}
    </NavigationProvider>
  );
}
