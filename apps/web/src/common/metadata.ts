import { Metadata } from "next";
import { HttpService } from "@onflowser/core/src/http.service";
import { FlixUtils, FlowFlixService } from "@onflowser/core";
import { InteractionsPageParams } from "@/common/interaction-page-params";

export async function getInteractionPageMetadata(
  params: InteractionsPageParams
): Promise<Metadata> {
  const {interaction} = params;

  if (interaction) {
    return getFlixMetadata(interaction);
  } else {
    return getDefaultMetadata();
  }
}

async function getFlixMetadata(flixId: string): Promise<Metadata> {
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
