import React, { createContext, ReactElement, useContext } from "react";
import toast from "react-hot-toast";
import { useConfirmDialog } from "./confirm-dialog.context";
import { AnalyticEvent, useAnalytics } from "../hooks/use-analytics";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useErrorHandler } from "../hooks/use-error-handler";
import { useCurrentWorkspaceId } from "../hooks/use-current-project-id";
import { FlowserWorkspace } from "@onflowser/api";
import { useServiceRegistry } from "./service-registry.context";
import { useGetWorkspace } from "../api";

export type WorkspaceManager = {
  currentWorkspace: FlowserWorkspace | undefined;
  closeWorkspace: () => Promise<void>;
  openWorkspace: (
    workspace: FlowserWorkspace,
    options?: OpenWorkspaceOptions
  ) => Promise<void>;
  removeWorkspace: (workspace: FlowserWorkspace) => void;
  updateWorkspace: (workspace: FlowserWorkspace) => Promise<FlowserWorkspace>;
  createWorkspace: (workspace: FlowserWorkspace) => Promise<FlowserWorkspace>;
};

type OpenWorkspaceOptions = { replaceCurrentPage: boolean };

const WorkspaceManagerContext = createContext<WorkspaceManager>(
  {} as WorkspaceManager
);

export function WorkspaceManagerProvider({
  children,
}: {
  children: ReactElement;
}): ReactElement {
  const { workspaceService } = useServiceRegistry();

  const { track } = useAnalytics();
  const navigate = useNavigate();
  const { handleError } = useErrorHandler(WorkspaceManagerProvider.name);
  const { showDialog, hideDialog } = useConfirmDialog();
  const currentWorkspaceId = useCurrentWorkspaceId();
  const { data: currentWorkspace, mutate: refetchCurrentWorkspace } =
    useGetWorkspace(currentWorkspaceId);

  const confirmProjectRemove = async (project: FlowserWorkspace) => {
    track(AnalyticEvent.PROJECT_REMOVED, { projectName: project.name });

    try {
      await toast.promise(workspaceService.remove(project.id), {
        loading: "Deleting project",
        error: `Failed to delete project "${project.name}"`,
        success: `Project "${project.name}" deleted!`,
      });
      refetchCurrentWorkspace();
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
      onConfirm: () => confirmProjectRemove(project),
      confirmButtonLabel: "DELETE",
      cancelButtonLabel: "CANCEL",
    });
  }

  async function closeWorkspace() {
    const execute = async () => {
      try {
        await workspaceService.close(currentWorkspaceId);
        refetchCurrentWorkspace();
      } catch (e) {
        // nothing critical happened, ignore the error
        console.warn("Couldn't stop the emulator: ", e);
      }
      // TODO(restructure): Do we need to clear the local cache?
      navigate("/projects", {
        replace: true,
      });
    };
    await toast.promise(execute(), {
      loading: "Closing project...",
      success: "Project closed!",
      error: "Something went wrong, please try again!",
    });
  }

  async function openWorkspace(
    project: FlowserWorkspace,
    options?: OpenWorkspaceOptions
  ) {
    try {
      await toast.promise(workspaceService.open(project.id), {
        loading: "Starting project...",
        success: "Project started!",
        error: "Something went wrong, please try again!",
      });
      refetchCurrentWorkspace();
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
    workspace: FlowserWorkspace
  ): Promise<FlowserWorkspace> {
    await workspaceService.create(workspace)
    return workspace;
  }

  async function updateWorkspace(
    workspace: FlowserWorkspace
  ): Promise<FlowserWorkspace> {
    await workspaceService.update(workspace)
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

export function useProjectManager(): WorkspaceManager {
  return useContext(WorkspaceManagerContext);
}