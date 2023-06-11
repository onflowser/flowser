import {
  Injectable,
  PreconditionFailedException,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MoreThan, Repository } from "typeorm";
import { SnapshotEntity } from "../entities/snapshot.entity";
import axios, { Method } from "axios";
import { randomUUID } from "crypto";
import { DataRemovalService } from "../../core/services/data-removal.service";
import {
  CreateEmulatorSnapshotRequest,
  GetPollingEmulatorSnapshotsRequest,
  RevertToEmulatorSnapshotRequest,
} from "@flowser/shared";
import { ProjectContextLifecycle } from "../utils/project-context";
import { ProjectEntity } from "src/projects/entities/project.entity";
import { computeEntitiesDiff } from "../../utils";

type CreateSnapshotRequest = {
  name: string;
};

type JumpToBlockHeightRequest = {
  height: number;
};

type JumpToSnapshotRequest = {
  name: string;
};

type ListSnapshotsResponse = {
  names: string[];
};

type SnapshotInfoResponse = {
  context: string;
  blockId: string;
  height: number;
};

@Injectable()
export class FlowSnapshotService implements ProjectContextLifecycle {
  private logger = new Logger(FlowSnapshotService.name);

  constructor(
    @InjectRepository(SnapshotEntity)
    private readonly snapshotRepository: Repository<SnapshotEntity>,
    private readonly commonService: DataRemovalService
  ) {}

  async onEnterProjectContext(project: ProjectEntity): Promise<void> {
    await this.syncSnapshotsCache(project);
  }

  async onExitProjectContext(): Promise<void> {
    // Do nothing
  }

  async create(request: CreateEmulatorSnapshotRequest) {
    const createdSnapshot = await this.createSnapshot({
      name: randomUUID(),
    });

    const existingSnapshot = await this.snapshotRepository.findOneBy({
      blockId: createdSnapshot.blockId,
      projectId: request.projectId,
    });

    if (existingSnapshot) {
      throw new PreconditionFailedException(
        "Snapshot already exists at this block"
      );
    }

    const snapshot = new SnapshotEntity();
    snapshot.id = createdSnapshot.context;
    snapshot.blockId = createdSnapshot.blockId;
    snapshot.projectId = request.projectId;
    snapshot.description = request.description;

    return this.snapshotRepository.save(snapshot);
  }

  async checkout(request: RevertToEmulatorSnapshotRequest) {
    const existingSnapshot = await this.snapshotRepository.findOneBy({
      projectId: request.projectId,
      blockId: request.blockId,
    });

    if (!existingSnapshot) {
      throw new NotFoundException("Snapshot not found");
    }

    await this.jumpToSnapshot({
      name: existingSnapshot.id,
    });

    // TODO(snapshots-revamp): How to handle cached managed accounts?
    // Reprocess all cached data
    await this.commonService.removeBlockchainData();

    return existingSnapshot;
  }

  findAll(request: { projectId: string }): Promise<SnapshotEntity[]> {
    return this.snapshotRepository.find({
      where: {
        projectId: request.projectId,
      },
      order: { createdAt: "DESC" },
    });
  }

  findAllByProjectNewerThanTimestamp(
    request: GetPollingEmulatorSnapshotsRequest
  ): Promise<SnapshotEntity[]> {
    return this.snapshotRepository.find({
      where: {
        createdAt: MoreThan(new Date(request.timestamp)),
        projectId: request.projectId,
      },
      order: { createdAt: "DESC" },
    });
  }

  private async syncSnapshotsCache(project: ProjectEntity) {
    const [emulatorSnapshots, cachedSnapshots] = await Promise.all([
      this.listSnapshots(),
      this.findAll({ projectId: project.id }),
    ]);

    const emulatorSnapshotIds = emulatorSnapshots.names.map((name) => ({
      id: name,
    }));
    const cachedSnapshotIds = cachedSnapshots.map((snapshot) => ({
      id: snapshot.id,
    }));

    const diff = computeEntitiesDiff<{ id: string }>({
      newEntities: emulatorSnapshotIds,
      oldEntities: cachedSnapshotIds,
      primaryKey: "id",
    });

    if (diff.created.length > 0) {
      this.logger.debug(
        `Found unseen snapshots on project startup: ${diff.created
          .map((e) => e.id)
          .join(", ")}`
      );
    }

    if (diff.deleted.length > 0) {
      this.logger.debug(
        `Removing ${diff.deleted.length} removed snapshots on startup`
      );
      await this.snapshotRepository.delete(diff.deleted.map((e) => e.id));
    }
  }

  private async createSnapshot(
    request: CreateSnapshotRequest
  ): Promise<SnapshotInfoResponse> {
    // https://github.com/onflow/flow-emulator/blob/0ca87170b7792b68941da368a839b9b74615d659/server/utils/emulator.go#L208-L233
    const response = await this.emulatorRequest<SnapshotInfoResponse>({
      method: "post",
      endpoint: `/snapshots?name=${request.name}`,
    });

    if (response.status !== 200) {
      throw new InternalServerErrorException("Failed creating snapshot");
    }

    return response.data;
  }

  public async jumpToHeight(request: JumpToBlockHeightRequest): Promise<void> {
    // https://github.com/onflow/flow-emulator/blob/0ca87170b7792b68941da368a839b9b74615d659/server/utils/emulator.go#L118-L136
    const response = await this.emulatorRequest({
      method: "post",
      endpoint: `/rollback?height=${request.height}`,
    });

    if (response.status !== 200) {
      throw new InternalServerErrorException("Failed to jump to height");
    }
  }

  private async jumpToSnapshot(
    request: JumpToSnapshotRequest
  ): Promise<SnapshotInfoResponse> {
    // https://github.com/onflow/flow-emulator/blob/0ca87170b7792b68941da368a839b9b74615d659/server/utils/emulator.go#L183-L206
    const response = await this.emulatorRequest<SnapshotInfoResponse>({
      method: "put",
      endpoint: `/snapshots/${request.name}`,
    });

    if (response.status === 404) {
      throw new NotFoundException("Snapshot not found");
    }

    if (response.status !== 200) {
      throw new InternalServerErrorException("Failed to jump to snapshot");
    }

    return response.data;
  }

  private async listSnapshots(): Promise<ListSnapshotsResponse> {
    // https://github.com/onflow/flow-emulator/blob/0ca87170b7792b68941da368a839b9b74615d659/server/utils/emulator.go#L138-L156
    const response = await this.emulatorRequest<ListSnapshotsResponse>({
      method: "get",
      endpoint: "/snapshots",
    });

    if (response.status !== 200) {
      throw new InternalServerErrorException("Failed to list snapshots");
    }

    const emptyResponse: ListSnapshotsResponse = {
      names: [],
    };

    // Emulator returns `null` when no snapshots exist.
    return response.data ?? emptyResponse;
  }

  private emulatorRequest<ResponseData>(options: {
    method: Method;
    endpoint: string;
  }) {
    return axios.request<ResponseData>({
      method: options.method,
      url: `http://localhost:8080/emulator${options.endpoint}`,
      // Prevent axios from throwing on certain http response codes
      // https://github.com/axios/axios/issues/41
      validateStatus: () => true,
    });
  }
}
