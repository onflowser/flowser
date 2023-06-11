import React, {
  createContext,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { routes } from "../constants/routes";
import { useHistory } from "react-router-dom";
import { useFlow } from "../hooks/use-flow";
import toast from "react-hot-toast";
import { Project } from "@flowser/shared";
import { useConfirmDialog } from "./confirm-dialog.context";
import { ServiceRegistry } from "../services/service-registry";
import {
  useCurrentProjectId,
  useGetCurrentProject,
  useGetPollingBlocks,
} from "../hooks/use-api";
import { SnapshotDialog } from "../components/snapshot-dialog/SnapshotDialog";
import TransactionDialog from "../components/transaction-dialog/TransactionDialog";
import { useErrorHandler } from "../hooks/use-error-handler";
import { useQueryClient } from "react-query";
import { useAnalytics } from "../hooks/use-analytics";
import { AnalyticEvent } from "../services/analytics.service";

export type ProjectActionsContextState = {
  switchProject: () => Promise<void>;

  sendTransaction: () => void;
  createSnapshot: () => void;
  checkoutBlock: (blockId: string) => void;

  removeProject: (project: Project) => void;
};

const ProjectContext = createContext<ProjectActionsContextState>(
  {} as ProjectActionsContextState
);

export function useProjectActions(): ProjectActionsContextState {
  return useContext(ProjectContext);
}

export function ProjectProvider({
  children,
}: {
  children: ReactElement;
}): ReactElement {
  const { projectsService, snapshotService } = ServiceRegistry.getInstance();

  const { track } = useAnalytics();
  const queryClient = useQueryClient();
  const history = useHistory();
  const { handleError } = useErrorHandler(ProjectProvider.name);
  const { showDialog, hideDialog } = useConfirmDialog();
  const { data: currentProject, refetch: refetchCurrentProject } =
    useGetCurrentProject();
  const { isLoggedIn, logout } = useFlow();
  const { data: blocks, refetchBlocks } = useGetPollingBlocks();

  const [showTxDialog, setShowTxDialog] = useState(false);
  const [showSnapshotModal, setShowSnapshotModal] = useState(false);

  const confirmProjectRemove = async (project: Project) => {
    track(AnalyticEvent.PROJECT_REMOVED, { projectName: project.name });

    try {
      await toast.promise(projectsService.removeProject(project.id), {
        loading: "Deleting project",
        error: `Failed to delete project "${project.name}"`,
        success: `Project "${project.name}" deleted!`,
      });
      history.replace(routes.start);
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
      confirmBtnLabel: "DELETE",
      cancelBtnLabel: "BACK",
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
      await logout(); // logout from dev-wallet, because config may change
      // Clear the entire cache,
      // so that previous data isn't there when using another project
      queryClient.clear();
      history.replace(routes.start);
    };
    await toast.promise(execute(), {
      loading: "Closing project...",
      success: "Project closed!",
      error: "Something went wrong, try again!",
    });
  }

  function createSnapshot() {
    track(AnalyticEvent.CREATE_SNAPSHOT);

    const { snapshot } = currentProject?.project?.emulator ?? {};
    if (!snapshot) {
      toast(
        "Snapshots can only be created when enabling the 'snapshot' option in settings",
        {
          duration: 5000,
        }
      );
    } else {
      setShowSnapshotModal(true);
    }
  }

  function sendTransaction() {
    track(AnalyticEvent.CLICK_SEND_TRANSACTION);

    if (!isLoggedIn) {
      toast("You need to login with wallet to send transactions", {
        duration: 5000,
      });
    } else {
      setShowTxDialog(true);
    }
  }

  const checkoutBlock = useCallback(
    (blockId: string) => {
      track(AnalyticEvent.CLICK_CHECKOUT_SNAPSHOT);

      const isSnapshotEnabled = currentProject?.project?.emulator?.snapshot;
      if (!isSnapshotEnabled) {
        toast.error(
          "Can't jump to block, because 'snapshot' option is not enabled in settings"
        );
        return;
      }
      const block = blocks.find((block) => block.id === blockId);

      if (!block) {
        throw new Error(`Expected to find block with ID: ${blockId}`);
      }

      showDialog({
        title: "Jump to snapshot",
        body: (
          <span style={{ textAlign: "center" }}>
            Do you want to move to the emulator blockchain state to the block
            with height <code>{block.height}</code>?
          </span>
        ),
        confirmBtnLabel: "JUMP",
        cancelBtnLabel: "CANCEL",
        onConfirm: async () => {
          track(AnalyticEvent.CHECKOUT_SNAPSHOT);

          try {
            // TODO(snapshots-revamp): Should we remove the old createSnapshot/jumpToSnapshot functionality entirely?
            await snapshotService.rollback({
              blockHeight: block.height,
            });
            refetchBlocks();
            toast.success(`Moved to block height: ${block.height}`);
          } catch (e) {
            handleError(e);
          }
        },
      });
    },
    [currentProject, blocks]
  );

  useEffect(() => {
    console.log("checkoutBlock rebuild");
  }, [checkoutBlock]);

  return (
    <ProjectContext.Provider
      value={{
        switchProject,
        createSnapshot,
        sendTransaction,
        checkoutBlock,
        removeProject,
      }}
    >
      <TransactionDialog show={showTxDialog} setShow={setShowTxDialog} />
      <SnapshotDialog show={showSnapshotModal} setShow={setShowSnapshotModal} />
      {children}
    </ProjectContext.Provider>
  );
}
