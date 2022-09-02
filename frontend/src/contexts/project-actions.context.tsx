import React, { ReactElement, useCallback, useState } from "react";
import { createContext, useContext } from "react";
import { routes } from "../constants/routes";
import { useHistory } from "react-router-dom";
import { ProjectsService } from "../services/projects.service";
import { SnapshotService } from "../services/snapshots.service";
import { useFlow } from "../hooks/use-flow";
import toast from "react-hot-toast";
import { Project } from "@flowser/shared";
import { useConfirmDialog } from "./confirm-dialog.context";

export type ProjectActionsContextState = {
  isSwitching: boolean;
  switchProject: () => Promise<void>;

  isCreatingSnapshot: boolean;
  createSnapshot: () => Promise<void>;

  isRemovingProject: boolean;
  removeProject: (project: Project) => void;
};

const ProjectActionsContext = createContext<ProjectActionsContextState>(
  {} as ProjectActionsContextState
);

export function useProjectActions(): ProjectActionsContextState {
  return useContext(ProjectActionsContext);
}

export function ProjectActionsProvider({
  children,
}: {
  children: ReactElement;
}): ReactElement {
  const projectService = ProjectsService.getInstance();
  const snapshotService = SnapshotService.getInstance();

  const history = useHistory();
  const { showDialog, hideDialog } = useConfirmDialog();
  const { logout } = useFlow();

  const [isSwitching, setIsSwitching] = useState(false);
  const [isRemovingProject, setIsRemovingProject] = useState(false);
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);

  const confirmProjectRemove = async (project: Project) => {
    setIsRemovingProject(true);
    try {
      await projectService.removeProject(project.id);
      toast(`Project "${project.name}" deleted!`);
      history.replace(`/${routes.start}`);
    } catch (e) {
      toast.error("Something went wrong: can not delete custom emulator");
    } finally {
      hideDialog();
      setIsRemovingProject(false);
    }
  };

  function removeProject(project: Project) {
    showDialog({
      body: (
        <>
          <h3>Delete project</h3>
          <span>Are you sure you want to delete this project?</span>
        </>
      ),
      onConfirm: () => confirmProjectRemove(project),
      confirmBtnLabel: "DELETE",
      cancelBtnLabel: "BACK",
    });
  }

  const switchProject = useCallback(async () => {
    setIsSwitching(true);
    try {
      await projectService.unUseCurrentProject();
    } catch (e) {
      // nothing critical happened, ignore the error
      console.warn("Couldn't stop the emulator: ", e);
    }
    history.replace(`/${routes.start}`);
    try {
      await logout(); // logout from dev-wallet, because config may change
    } finally {
      setIsSwitching(false);
    }
  }, []);

  const createSnapshot = useCallback(async () => {
    try {
      // TODO(milestone-5): provide a way to input a custom description
      setIsCreatingSnapshot(true);
      await snapshotService.create({
        description: "Test",
      });
      toast.success("Snapshot created");
    } catch (e) {
      console.error(e);
      toast.error("Failed to create snapshot");
    } finally {
      setIsCreatingSnapshot(false);
    }
  }, []);

  return (
    <ProjectActionsContext.Provider
      value={{
        isSwitching,
        switchProject,
        isCreatingSnapshot,
        createSnapshot,
        isRemovingProject,
        removeProject,
      }}
    >
      {children}
    </ProjectActionsContext.Provider>
  );
}
