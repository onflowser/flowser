import { useParams } from "../contexts/navigation.context";

export function useCurrentWorkspaceId(): string {
  const params = useParams();
  const workspaceId = params.workspaceId as string | undefined;


  // if (!workspaceId) {
  //   throw new Error("Workspace ID not found in URL");
  // }

  return workspaceId ?? "";
}
