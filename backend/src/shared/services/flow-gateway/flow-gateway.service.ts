import { Injectable } from '@nestjs/common';
import { GatewayConfiguration } from '../../../projects/dto/gateway-configuration';
import { CreateBlockDto } from '../../../blocks/dto/create-block.dto';
import { Block } from '../../../blocks/entities/block.entity';

@Injectable()
export class FlowGatewayService {
    private configuration: GatewayConfiguration;

    public configureDataSourceGateway(configuration: GatewayConfiguration) {
        console.info('FlowGatewayService configuration changed', configuration);
        this.configuration = configuration;
    }

    // TODO: Define what this method will return?
    // TODO: Continue here
    // TODO: Dummy
    public fetchBlocks(): CreateBlockDto | any {
        const block = new Block();
        block.id = "86674c24865aa6be9c2e77c23099703cdb74a76348d400c6422c239331539fbd";
        block.parentId = "789b8969c0f03b85037297ee49e05a96fe15ec35e5b7f73aa72e9cc825155d8e";
        block.height = Math.floor(Math.random() * 10);
        block.timestamp = "2021-09-27T22:09:22.732Z";
        block.collectionGuarantees = [
            {
                "collectionId": "18b34f06516c83f5655e6f1961635ba55d6278c6d9cdb90ed2bff9df37d2cf4c",
                "signatures": [
                    ""
                ]
            }
        ];
        block.blockSeals = [];
        block.signatures = [];
        return block;
    }

    private isConnectedToGateway(): boolean {
        return !!this.configuration;
    }
}
