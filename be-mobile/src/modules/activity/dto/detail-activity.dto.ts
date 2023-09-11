import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class DetailActivityDto {
  @IsOptional()
  @ApiProperty({
    description: "Activity Id",
    required: false,
    example: "example Activity id",
  })
  id: string;
}
