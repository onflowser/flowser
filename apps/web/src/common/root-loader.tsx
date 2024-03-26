"use client";

import dynamic from "next/dynamic";
import FullScreenLoading from "@onflowser/ui/src/common/loaders/FullScreenLoading/FullScreenLoading";

export function RootLoader() {
  // If we load Root component directly,
  // it will complain that window/document is not defined.
  // This is a temporary workaround for now,
  // see if we can avoid that in the first place.
  // Also see: https://github.com/mac-s-g/react-json-view/issues/296
  const Root = dynamic(() => import("./root"), {
    ssr: false,
    loading: () => <FullScreenLoading />,
  });

  return <Root />
}
