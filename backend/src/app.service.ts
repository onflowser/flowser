import { Injectable } from '@nestjs/common';
const packageJsonFile = require("../package.json");

@Injectable()
export class AppService {

    flowserVersion() {
        return {
            version: `v${packageJsonFile.version}`
        };
    }
}
