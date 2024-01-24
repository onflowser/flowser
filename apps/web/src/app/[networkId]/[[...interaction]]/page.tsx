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
  const {interaction, networkId} = props.params;

  if (interaction) {
    return getFlixMetadata(networkId, interaction);
  } else {
    return getDefaultMetadata();
  }
}

async function getFlixMetadata(networkId: string, flixId: string): Promise<Metadata> {
  const httpService = new HttpService({
    ...console,
    verbose: console.debug
  });
  const flixConfig = {
    flixServerUrl: "https://flowser-flix-368a32c94da2.herokuapp.com"
  };
  const flixService = new FlowFlixService(flixConfig, httpService);

  const template = await flixService.getById(flixId);

  if (template) {
    const title = `Interaction: ${FlixUtils.getName(template)}`;
    const description = FlixUtils.getDescription(template)

    return {
      title,
      description,
      openGraph: {
        images: [
          `/og?flixId=${flixId}&networkId=${networkId}`
        ]
      },
    }
  } else {
    return getDefaultMetadata()
  }
}

function getDefaultMetadata(): Metadata {
  return {
    title: "Flowser - Interact on Flow ⚡",
    description: "Supercharged interactions #onFlow blockchain.",
    openGraph: {
      images: [
        "https://flowser.dev/social.png"
      ]
    }
  }
}

export default function Page({ params }: Props) {
  return <ClientContent />
}
