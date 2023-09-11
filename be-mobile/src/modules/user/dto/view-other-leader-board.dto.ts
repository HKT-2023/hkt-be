import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, Max, Min } from "class-validator";
import { Type } from "class-transformer";
import { PointType } from "src/models/schemas/user-point.schema";

export class ViewOtherLeaderBoardDto {
  @IsEnum(PointType)
  @ApiProperty({
    description: "Point type",
    required: true,
    example: PointType.Client,
  })
  pointType: PointType;

  @IsNumber()
  @IsNotEmpty()
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
}
