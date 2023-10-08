import React, { createContext, ReactElement, useContext } from "react";
import toast from "react-hot-toast";
import { useConfirmDialog } from "./confirm-dialog.context";
import { ServiceRegistry } from "../../../../frontend/src/services/service-registry";
import { useFlowserHooksApi } from "./flowser-api.context";
import { useAnalytics } from "../hooks/use-analytics";
import { AnalyticEvent } from "../../../../frontend/src/services/analytics.service";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useErrorHandler } from "../hooks/use-error-handler";
import { useCurrentProjectId } from "../hooks/use-current-project-id";
import { FlowserProject } from "@onflowser/api";

export type ProjectsManager = {
  currentProject: FlowserProject | undefined;
  switchProject: () => Promise<void>;
  startProject: (
    project: FlowserProject,
    options?: StartProjectOptions
  ) => Promise<void>;
  removeProject: (project: FlowserProject) => void;
};

type StartProjectOptions = { replaceCurrentPage: boolean };

const ProjectsManagerContext = createContext<ProjectsManager>(
  {} as ProjectsManager
);

export function ProjectsManagerProvider({
  children,
}: {
  children: ReactElement;
}): ReactElement {
  const { projectsService } = ServiceRegistry.getInstance();

  const { track } = useAnalytics();
  const navigate = useNavigate();
  const { handleError } = useErrorHandler(ProjectsManagerProvider.name);
  const { showDialog, hideDialog } = useConfirmDialog();
  const api = useFlowserHooksApi();
  const currentProjectId = useCurrentProjectId();
  const { data: currentProject, mutate: refetchCurrentProject } =
    api.useGetFlowserProject(currentProjectId);

  const confirmProjectRemove = async (project: FlowserProject) => {
    track(AnalyticEvent.PROJECT_REMOVED, { projectName: project.name });

    try {
      await toast.promise(projectsService.removeProject(project.id), {
        loading: "Deleting project",
        error: `Failed to delete project "${project.name}"`,
        success: `Project "${project.name}" deleted!`,
      });
      refetchCurrentProject();
      navigate("/projects", {
        replace: true,
      });
    } catch (e) {
      toast.error("Something went wrong: can not delete custom emulator");
    } finally {
      hideDialog();
    }
  };

  function removeProject(project: FlowserProject) {
    showDialog({
      title: "Delete project",
      body: <span>Are you sure you want to delete this project?</span>,
      onConfirm: () => confirmProjectRemove(project),
      confirmButtonLabel: "DELETE",
      cancelButtonLabel: "CANCEL",
    });
  }

  async function switchProject() {
    const execute = async () => {
      try {
        await projectsService.unUseCurrentProject();
        refetchCurrentProject();
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

  async function startProject(
    project: FlowserProject,
    options?: StartProjectOptions
  ) {
    try {
      await toast.promise(projectsService.useProject(project.id), {
        loading: "Starting project...",
        success: "Project started!",
        error: "Something went wrong, please try again!",
      });
      refetchCurrentProject();
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

  return (
    <ProjectsManagerContext.Provider
      value={{
        currentProject: currentProject?.project,
        switchProject,
        startProject,
        removeProject,
      }}
    >
      <Helmet>
        <title>
          {currentProject?.project
            ? `Flowser - ${currentProject?.project?.name}`
            : "Flowser"}
        </title>
      </Helmet>
      {children}
    </ProjectsManagerContext.Provider>
  );
}

export function useProjectManager(): ProjectsManager {
  return useContext(ProjectsManagerContext);
}
