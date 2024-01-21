import React, { createContext, ReactElement, useContext } from "react";
import toast from "react-hot-toast";
import { useConfirmDialog } from "./confirm-dialog.context";
import { AnalyticEvent, useAnalytics } from "../hooks/use-analytics";
import { Helmet } from "react-helmet";
import { useErrorHandler } from "../hooks/use-error-handler";
import { useCurrentWorkspaceId } from "../hooks/use-current-project-id";
import { FlowserWorkspace } from "@onflowser/api";
import { useServiceRegistry } from "./service-registry.context";
import { useGetWorkspace } from "../api";
import { useNavigate } from "./navigation.context";

export type WorkspaceManager = {
  currentWorkspace: FlowserWorkspace | undefined;
  closeWorkspace: () => Promise<void>;
  openWorkspace: (
    workspace: FlowserWorkspace,
    options?: OpenWorkspaceOptions,
  ) => Promise<void>;
  removeWorkspace: (workspace: FlowserWorkspace) => void;
  updateWorkspace: (workspace: FlowserWorkspace) => Promise<FlowserWorkspace>;
  createWorkspace: (workspace: FlowserWorkspace) => Promise<FlowserWorkspace>;
};

type OpenWorkspaceOptions = { replaceCurrentPage: boolean };

const WorkspaceManagerContext = createContext<WorkspaceManager>(
  {} as WorkspaceManager,
);

export function WorkspaceManagerProvider({
  children,
}: {
  children: ReactElement;
}): ReactElement {
  const workspaceService = useRequiredWorkspaceService();

  const { track } = useAnalytics();
  const navigate = useNavigate();
  const { handleError } = useErrorHandler(WorkspaceManagerProvider.name);
  const { showDialog, hideDialog } = useConfirmDialog();
  const currentWorkspaceId = useCurrentWorkspaceId();
  const { data: currentWorkspace, mutate: refetchCurrentWorkspace } =
    useGetWorkspace(currentWorkspaceId);

  const confirmWorkspaceRemove = async (project: FlowserWorkspace) => {
    track(AnalyticEvent.PROJECT_REMOVED, { projectName: project.name });

    try {
      await toast.promise(workspaceService.remove(project.id), {
        loading: "Deleting project",
        error: `Failed to delete project "${project.name}"`,
        success: `Project "${project.name}" removed!`,
      });
      await refetchCurrentWorkspace();
      navigate("/projects", {
        replace: true,
      });
    } catch (e) {
      toast.error("Something went wrong: can not delete custom emulator");
    } finally {
      hideDialog();
    }
  };

  function removeWorkspace(project: FlowserWorkspace) {
    showDialog({
      title: "Delete project",
      body: <span>Are you sure you want to delete this project?</span>,
      onConfirm: () => confirmWorkspaceRemove(project),
      confirmButtonLabel: "DELETE",
      cancelButtonLabel: "CANCEL",
    });
  }

  async function closeWorkspace() {
    try {
      await workspaceService.close(currentWorkspaceId);
      await refetchCurrentWorkspace();
      navigate("/projects", {
        replace: true,
      });
    } catch (e) {
      handleError(e);
    }
  }

  async function openWorkspace(
    project: FlowserWorkspace,
    options?: OpenWorkspaceOptions,
  ) {
    try {
      await workspaceService.open(project.id);
      await refetchCurrentWorkspace();
      track(AnalyticEvent.PROJECT_STARTED);
      navigate(`/projects/${project.id}`, {
        replace: options?.replaceCurrentPage,
      });
    } catch (e: unknown) {
      handleError(e);
      navigate(`/projects/${project.id}/settings`, {
        replace: true,
      });
    }
  }

  async function createWorkspace(
    workspace: FlowserWorkspace,
  ): Promise<FlowserWorkspace> {
    await workspaceService.create(workspace);
    return workspace;
  }

  async function updateWorkspace(
    workspace: FlowserWorkspace,
  ): Promise<FlowserWorkspace> {
    await workspaceService.update(workspace);
    return workspace;
  }

  return (
    <WorkspaceManagerContext.Provider
      value={{
        currentWorkspace: currentWorkspace,
        createWorkspace: createWorkspace,
        updateWorkspace: updateWorkspace,
        closeWorkspace: closeWorkspace,
        openWorkspace: openWorkspace,
        removeWorkspace: removeWorkspace,
      }}
    >
      <Helmet>
        <title>
          {currentWorkspace ? `Flowser - ${currentWorkspace?.name}` : "Flowser"}
        </title>
      </Helmet>
      {children}
    </WorkspaceManagerContext.Provider>
  );
}

export function useWorkspaceManager(): WorkspaceManager {
  return useContext(WorkspaceManagerContext);
}

function useRequiredWorkspaceService() {
  const { workspaceService } = useServiceRegistry();

  if (!workspaceService) {
    throw new Error("Workspace service not found")
  }

  return workspaceService;
}
