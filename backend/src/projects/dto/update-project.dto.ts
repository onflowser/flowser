import { PartialType } from "@nestjs/mapped-types";
import { CreateProjectDto } from "./create-project.dto";
import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @ApiProperty()
  @IsNotEmpty()
  // @ts-ignore As this is always set automatically by the framework.
  id: string;
}
