import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, Max, Min } from "class-validator";

export class GetActivitiesDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({
    description: "Page",
    required: true,
    example: 1,
  })
  page: number;

  @IsNotEmpty()
  @IsNumber()
  @Max(100)
  @Min(1)
  @Type(() => Number)
  @ApiProperty({
    description: "Limit",
    required: true,
    example: 10,
  })
  limit: number;

  @IsOptional()
  @ApiProperty({
    description: "type",
    required: false,
    example: "NFTMinted",
  })
  type: string;

  types: string[];
}
