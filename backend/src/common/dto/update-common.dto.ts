import { PartialType } from '@nestjs/swagger';
import { CreateCommonDto } from './create-common.dto';

export class UpdateCommonDto extends PartialType(CreateCommonDto) {}
