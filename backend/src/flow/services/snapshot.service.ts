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
import axios from "axios";
import { randomUUID } from "crypto";
import { CommonService } from "../../core/services/common.service";
import {
  CreateEmulatorSnapshotRequest,
  GetPollingEmulatorSnapshotsRequest,
  RevertToEmulatorSnapshotRequest,
} from "@flowser/shared";

type SnapshotResponse = {
  blockId: string;
  context: string;
  height: number;
};

@Injectable()
export class FlowSnapshotService {
  private logger = new Logger(FlowSnapshotService.name);

  constructor(
    @InjectRepository(SnapshotEntity)
    private readonly snapshotRepository: Repository<SnapshotEntity>,
    private readonly commonService: CommonService
  ) {}

  async create(request: CreateEmulatorSnapshotRequest) {
    // TODO(milestone-3): use value from emulator config object
    const snapshotId = randomUUID();
    const response = await this.createOrRevertSnapshotRequest(snapshotId);

    if (response.status !== 200) {
      this.logger.error(
        `Got ${response.status} response from emulator`,
        response.data
      );
      // Most likely reason for failure is that emulator wasn't started with "persist" flag
      throw new InternalServerErrorException("Failed to create snapshot");
    }

    const snapshotData = response.data as SnapshotResponse;

    const existingSnapshot = await this.snapshotRepository.findOneBy({
      blockId: snapshotData.blockId,
      projectId: request.projectId,
    });

    if (existingSnapshot) {
      throw new PreconditionFailedException(
        "Snapshot already exists at this block"
      );
    }

    const snapshot = new SnapshotEntity();
    snapshot.id = snapshotId;
    snapshot.blockId = snapshotData.blockId;
    snapshot.projectId = request.projectId;
    snapshot.description = request.description;

    return this.snapshotRepository.save(snapshot);
  }

  async revertTo(request: RevertToEmulatorSnapshotRequest) {
    const existingSnapshot = await this.snapshotRepository.findOneBy({
      projectId: request.projectId,
      blockId: request.blockId,
    });

    if (!existingSnapshot) {
      throw new NotFoundException("Snapshot not found");
    }

    const response = await this.createOrRevertSnapshotRequest(
      existingSnapshot.id
    );

    // TODO(milestone-x): Handle snapshot data deleted by user
    // What happens if the user removes snapshot data (in ./flowdb)
    // and tries to revert to the stored snapshot?
    // We could check whether the returned snapshot blockId
    // matches the blockId in our stored snapshot entity
    if (response.status !== 200) {
      this.logger.error(
        `Got ${response.status} response from emulator`,
        response.data
      );
      throw new InternalServerErrorException("Failed to revert to snapshot");
    }

    await this.commonService.removeBlockchainData();

    return existingSnapshot;
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

  private async createOrRevertSnapshotRequest(snapshotId: string) {
    // Docs: https://github.com/onflow/flow-emulator#managing-emulator-state
    return axios.get<SnapshotResponse>(
      `http://localhost:8080/emulator/snapshot/${snapshotId}`,
      // Prevent axios from throwing on certain http response codes
      // https://github.com/axios/axios/issues/41
      { validateStatus: () => true }
    );
  }
}
