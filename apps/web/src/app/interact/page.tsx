"use client"
import { InteractionsPage } from "@onflowser/ui/src/interactions/InteractionsPage";
import { WorkspaceLayout } from "@onflowser/ui/src/common/layouts/ProjectLayout/WorkspaceLayout";
import { InteractionRegistryProvider } from "@onflowser/ui/src/interactions/contexts/interaction-registry.context";
import { TemplatesRegistryProvider } from "@onflowser/ui/src/interactions/contexts/templates.context";
import { NavigationProvider } from "@onflowser/ui/src/contexts/navigation.context";
import { ReactNode } from "react";
import { useParams, useSelectedLayoutSegments, usePathname, useSearchParams, useRouter } from "next/navigation";
import { ServiceRegistryProvider } from "@onflowser/ui/src/contexts/service-registry.context";

export default function Page() {
  return(
    <NextJsNavigationProvider>
      <ServiceRegistryProvider services={{} as never}>
          <InteractionRegistryProvider>
            <TemplatesRegistryProvider>
              <InteractionsPage />
            </TemplatesRegistryProvider>
          </InteractionRegistryProvider>
      </ServiceRegistryProvider>
    </NextJsNavigationProvider>
  )
}

function NextJsNavigationProvider(props: {children: ReactNode}) {
  const params = useParams();
  const matches = useSelectedLayoutSegments();
  const pathname = usePathname();
  const { } = useRouter();
  const search = useSearchParams();

  function navigate() {
    // TODO(web-mvp): Implement
  }


  console.log({ matches, pathname })
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
  )
}
