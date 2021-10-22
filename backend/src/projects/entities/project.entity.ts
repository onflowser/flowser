import { Column, Entity, Index, ObjectIdColumn } from 'typeorm';
import { GatewayConfigurationEntity } from './gateway-configuration.entity';
import { toKebabCase } from "../../utils";
import { CreateProjectDto } from "../dto/create-project.dto";
import { EmulatorConfigurationEntity } from "./emulator-configuration.entity";
import { PollingEntity } from "../../shared/entities/polling.entity";

@Entity({name: 'projects'})
export class Project extends PollingEntity {
    @ObjectIdColumn()
    _id: string;

    @Column()
    @Index({unique: true})
    id: string;

    @Column()
    @Index({unique: true})
    name: string;

    @Column()
    pingable: boolean;

    @Column()
    gateway: GatewayConfigurationEntity;

    @Column()
    emulator: EmulatorConfigurationEntity;

    @Column('boolean', {default: false})
    isCustom: boolean = false;

    // data will be fetched from this block height
    // set this undefined to start fetching from latest block
    @Column()
    startBlockHeight?: number | undefined = 0;

    static init (dto: CreateProjectDto) {
        return Object.assign(new Project(), {
            id: toKebabCase(dto.name),
            ...dto
        })
    }

}
