import { Metadata } from "next";
import { HttpService } from "@onflowser/core/src/http.service";
import { InteractionsPageParams } from "@/common/interaction-page-params";
import { FlowFlixV11Service } from "@onflowser/core/src/flow-flix-v11.service";
import { FlixV11Utils } from "@onflowser/core/src/flix-v11-utils";

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
    flixServerUrl: "https://flix-indexer.fly.dev"
  };
  const flixService = new FlowFlixV11Service(flixConfig, httpService);

  const template = await flixService.getById(flixId);

  if (template) {
    const title = `Interaction: ${FlixV11Utils.getName(template)}`;
    const description = FlixV11Utils.getDescription(template)

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
