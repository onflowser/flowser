import type { Metadata } from 'next'
import { InteractionsPageParams } from "./use-params";
import ClientContent from "./content";

type Props = {
  params: InteractionsPageParams
}

export async function generateMetadata(
  props: Props,
): Promise<Metadata> {

  return {
    title: JSON.stringify(props.params),
    openGraph: {},
  }
}

export default function Page({ params }: Props) {
  return <ClientContent />
}
