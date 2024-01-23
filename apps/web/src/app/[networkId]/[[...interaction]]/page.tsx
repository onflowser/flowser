import type { Metadata } from 'next'
import { InteractionsPageParams } from "./use-params";
import ClientContent from "./content";
import { FlixUtils, FlowFlixService } from "@onflowser/core";
import { HttpService } from "@onflowser/core/src/http.service";

type Props = {
  params: InteractionsPageParams
}

export async function generateMetadata(
  props: Props,
): Promise<Metadata> {
  const httpService = new HttpService({
    ...console,
    verbose: console.debug
  });
  const flixConfig = {
    flixServerUrl: "https://flowser-flix-368a32c94da2.herokuapp.com"
  };
  const flixService = new FlowFlixService(flixConfig, httpService);

  const flix = await flixService.getById(props.params.interaction ?? "");

  const title = flix ? FlixUtils.getFlixTemplateName(flix) : "Unknown interaction"

  return {
    title,
    openGraph: {
      title
    },
  }
}

export default function Page({ params }: Props) {
  return <ClientContent />
}
