import { PartialType } from "@nestjs/mapped-types";
import { CreateProjectDto } from "./create-project.dto";
import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @ApiProperty()
  @IsNotEmpty()
  id: string;
}
