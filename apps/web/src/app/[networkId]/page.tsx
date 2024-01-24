import type { Metadata } from 'next'
import { getInteractionPageMetadata } from "@/common/metadata";
import { InteractionsPageParams } from "@/common/use-params";
import { RootLoader } from '@/common/root-loader';

type Props = {
  params: InteractionsPageParams
}

export async function generateMetadata(
  props: Props,
): Promise<Metadata> {
  return getInteractionPageMetadata(props.params)
}

export default function Page({ params }: Props) {
  return <RootLoader />
}
