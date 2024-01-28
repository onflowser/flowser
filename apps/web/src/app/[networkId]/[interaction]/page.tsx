import { RootLoader } from "@/common/root-loader";
import { Metadata } from "next";
import { InteractionsPageParams } from "@/common/use-interaction-page-params";
import { getInteractionPageMetadata } from "@/common/metadata";

type Props = {
  params: InteractionsPageParams
}

export async function generateMetadata(
  props: Props,
): Promise<Metadata> {
  return getInteractionPageMetadata(props.params)
}

export default function Page() {
  return <RootLoader />
}
