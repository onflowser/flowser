import { useParams } from "react-router-dom";

export function useCurrentWorkspaceId(): string {
  const { workspaceId } = useParams();

  // if (!workspaceId) {
  //   throw new Error("Workspace ID not found in URL");
  // }

  return workspaceId ?? "";
}
