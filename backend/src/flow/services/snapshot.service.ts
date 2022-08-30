import {
  Injectable,
  PreconditionFailedException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SnapshotEntity } from "../entities/snapshot.entity";
import axios from "axios";
import { randomUUID } from "crypto";

type SnapshotResponse = {
  blockId: string;
  context: string;
  height: number;
};

@Injectable()
export class FlowSnapshotService {
  constructor(
    @InjectRepository(SnapshotEntity)
    private readonly snapshotRepository: Repository<SnapshotEntity>
  ) {}

  async create(description: string) {
    // TODO(milestone-3): use value from emulator config object
    const snapshotId = randomUUID();
    const response = await this.createOrRevertSnapshotRequest(snapshotId);

    if (response.status !== 200) {
      // Most likely reason for failure is that emulator wasn't started with "persist" flag
      throw new InternalServerErrorException("Failed to create snapshot");
    }

    const snapshotData = response.data as SnapshotResponse;

    const existingSnapshot = this.snapshotRepository.findOneBy({
      blockId: snapshotData.blockId,
    });

    if (existingSnapshot) {
      throw new PreconditionFailedException(
        "Snapshot already exists at this block"
      );
    }

    const snapshot = new SnapshotEntity();
    snapshot.id = snapshotId;
    snapshot.blockId = snapshotData.blockId;
    snapshot.description = description;

    return this.snapshotRepository.insert(snapshot);
  }

  async revertTo(blockId: string) {
    const existingSnapshot = await this.snapshotRepository.findOneBy({
      blockId,
    });

    if (!existingSnapshot) {
      throw new NotFoundException("Snapshot not found");
    }

    const response = await this.createOrRevertSnapshotRequest(
      existingSnapshot.id
    );

    if (response.status !== 200) {
      throw new InternalServerErrorException("Failed to revert to snapshot");
    }

    return existingSnapshot;
  }

  async findAll() {
    return this.snapshotRepository.find({
      order: { createdAt: "DESC" },
    });
  }

  private async createOrRevertSnapshotRequest(snapshotId: string) {
    // Docs: https://github.com/onflow/flow-emulator#managing-emulator-state
    return axios.get<SnapshotResponse>(
      `http://localhost:8080/emulator/snapshot/${snapshotId}`
    );
  }
}
