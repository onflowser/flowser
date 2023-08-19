import React, {
  createContext,
  ReactElement,
  useCallback,
  useContext,
  useState,
  useMemo,
  useEffect,
} from "react";
import { routes } from "../constants/routes";
import { useHistory } from "react-router-dom";
import toast from "react-hot-toast";
import { Block, EmulatorSnapshot, Project } from "@flowser/shared";
import { useConfirmDialog } from "./confirm-dialog.context";
import { ServiceRegistry } from "../services/service-registry";
import {
  useGetCurrentProject,
  useGetFlowConfig,
  useGetPollingBlocks,
  useGetPollingEmulatorSnapshots,
} from "../hooks/use-api";
import { useErrorHandler } from "../hooks/use-error-handler";
import { useQueryClient } from "react-query";
import { useAnalytics } from "../hooks/use-analytics";
import { AnalyticEvent } from "../services/analytics.service";
import { FlowUtils } from "../utils/flow-utils";
import fcl from "@onflow/fcl";
import { SnapshotDialog } from "components/dialogs/snapshot/SnapshotDialog";

export type ProjectActionsContextState = {
  switchProject: () => Promise<void>;

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
  const { data: flowConfigData } = useGetFlowConfig();
  const { data: blocks, refresh } = useGetPollingBlocks();
  const { data: emulatorSnapshots } = useGetPollingEmulatorSnapshots();
  const snapshotLookupByBlockId = useMemo(
    () =>
      new Map(
        emulatorSnapshots.map((snapshot) => [snapshot.blockId, snapshot])
      ),
    [emulatorSnapshots]
  );
  const [showSnapshotModal, setShowSnapshotModal] = useState(false);

  useEffect(() => {
    if (currentProject?.project) {
      const accessNodePort =
        currentProject.project.emulator?.restServerPort ?? 8888;
      fcl
        .config()
        // flowser app details
        .put("app.detail.icon", `http://localhost:6061/icon.png`)
        .put("app.detail.title", "Flowser")
        // Point App at Emulator
        .put("accessNode.api", `http://localhost:${accessNodePort}`);

      if (flowConfigData) {
        fcl.config().load({
          flowJSON: JSON.parse(flowConfigData.flowJson),
        });
      }
    }
  }, [currentProject, flowConfigData]);

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
      confirmButtonLabel: "DELETE",
      cancelButtonLabel: "BACK",
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

  function checkoutSnapshot(snapshot: EmulatorSnapshot) {
    const isSnapshotEnabled = currentProject?.project?.emulator?.snapshot;
    if (!isSnapshotEnabled) {
      toast.error(
        "Can't jump to block, because 'snapshot' option is not enabled in project settings"
      );
      return;
    }

    const latestBlock = blocks[0];

    if (snapshot.blockId === latestBlock.id) {
      toast("Blockchain state is already at this block, doing nothing.");
      return;
    }

    const onConfirm = async () => {
      track(AnalyticEvent.CHECKOUT_SNAPSHOT);

      if (!currentProject?.project) {
        throw new Error("Expected project to be defined");
      }

      try {
        await snapshotService.checkoutBlock({
          blockId: snapshot.blockId,
          projectId: currentProject.project.id,
        });
        refresh();
        toast.success(
          `Moved to block: ${FlowUtils.getShortedBlockId(snapshot.blockId)}`
        );
      } catch (e) {
        handleError(e);
      }
    };

    showDialog({
      title: "Jump to snapshot",
      body: (
        <span style={{ textAlign: "center" }}>
          Do you want to move the emulator blockchain state to the snapshot{" "}
          <code>{snapshot.description}</code>?
        </span>
      ),
      confirmButtonLabel: "JUMP",
      cancelButtonLabel: "CANCEL",
      onConfirm,
    });
  }

  function rollbackToBlock(targetBlock: Block) {
    const onConfirm = async () => {
      track(AnalyticEvent.CHECKOUT_SNAPSHOT);

      const latestBlock = blocks[0];

      if (targetBlock.id === latestBlock.id) {
        toast("Blockchain state is already at this block, doing nothing.");
        return;
      }
      if (!currentProject?.project) {
        throw new Error("Expected project to be defined");
      }

      try {
        await snapshotService.rollback({
          blockHeight: targetBlock.height,
        });
        refresh();
        toast.success(
          `Moved to block: ${FlowUtils.getShortedBlockId(targetBlock.id)}`
        );
      } catch (e) {
        handleError(e);
      }
    };

    showDialog({
      title: "Rollback to block",
      body: (
        <span style={{ textAlign: "center" }}>
          Do you want to move the emulator blockchain state to the block with
          height <code>{targetBlock.height}</code>?
        </span>
      ),
      confirmButtonLabel: "JUMP",
      cancelButtonLabel: "CANCEL",
      onConfirm,
    });
  }

  const checkoutBlock = useCallback(
    (targetBlockId: string) => {
      track(AnalyticEvent.CLICK_CHECKOUT_SNAPSHOT);

      const snapshot = snapshotLookupByBlockId.get(targetBlockId);

      if (snapshot) {
        return checkoutSnapshot(snapshot);
      }

      const targetBlock = blocks.find((block) => block.id === targetBlockId);

      if (!targetBlock) {
        throw new Error(`Expected to find block with ID: ${targetBlockId}`);
      }

      rollbackToBlock(targetBlock);
    },
    [currentProject, blocks, snapshotLookupByBlockId]
  );

  return (
    <ProjectContext.Provider
      value={{
        switchProject,
        createSnapshot,
        checkoutBlock,
        removeProject,
      }}
    >
      <SnapshotDialog show={showSnapshotModal} setShow={setShowSnapshotModal} />
      {children}
    </ProjectContext.Provider>
  );
}
