import { RootLoader } from "@/common/root-loader";
import { Metadata } from "next";
import { getInteractionPageMetadata } from "@/common/metadata";
import { InteractionsPageParams } from "@/common/interaction-page-params";

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
