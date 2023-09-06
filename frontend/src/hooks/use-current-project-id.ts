import { useParams } from "react-router-dom";

export function useCurrentProjectId(): string {
  const { projectId } = useParams();

  // if (!projectId) {
  //   throw new Error("Project ID not found in URL");
  // }

  return projectId ?? "";
}
