import React, { createContext, ReactElement, useContext } from "react";
import toast from "react-hot-toast";
import { Project } from "@flowser/shared";
import { useConfirmDialog } from "./confirm-dialog.context";
import { ServiceRegistry } from "../services/service-registry";
import { useGetCurrentProject } from "../hooks/use-api";
import { useQueryClient } from "react-query";
import { useAnalytics } from "../hooks/use-analytics";
import { AnalyticEvent } from "../services/analytics.service";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useErrorHandler } from "hooks/use-error-handler";

export type ProjectsManager = {
  currentProject: Project | undefined;
  switchProject: () => Promise<void>;
  startProject: (project: Project, options?: StartProjectOptions) => Promise<void>;
  removeProject: (project: Project) => void;
};

type StartProjectOptions = {replaceCurrentPage: boolean;}

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
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { handleError } = useErrorHandler(ProjectsManagerProvider.name);
  const { showDialog, hideDialog } = useConfirmDialog();
  const { data: currentProject, refetch: refetchCurrentProject } =
    useGetCurrentProject();

  const confirmProjectRemove = async (project: Project) => {
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

  function removeProject(project: Project) {
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
      // Clear the entire cache,
      // so that previous data isn't there when using another project
      queryClient.clear();
      navigate("/projects", {
        replace: true,
      });
    };
    await toast.promise(execute(), {
      loading: "Closing project...",
      success: "Project closed!",
      error: "Something went wrong, try again!",
    });
  }

  async function startProject(project: Project, options?: StartProjectOptions) {
    try {
      await projectsService.useProject(project.id);
      refetchCurrentProject();
      track(AnalyticEvent.PROJECT_STARTED);
      navigate(`/projects/${project.id}`, {
        replace: options?.replaceCurrentPage
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
