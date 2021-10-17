import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectDto } from './create-project.dto';
import { IsNotEmpty } from "class-validator";

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
    @IsNotEmpty()
    id: string;
}
