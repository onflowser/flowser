import { useParams } from "../contexts/navigation.context";

export function useCurrentWorkspaceId(): string {
  const { workspaceId } = useParams();

  // if (!workspaceId) {
  //   throw new Error("Workspace ID not found in URL");
  // }

  return workspaceId ?? "";
}
