import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, Max, Min } from "class-validator";
import { Type } from "class-transformer";
import { PointType } from "src/models/schemas/user-point.schema";

export class ViewLeaderBoardDto {
  @IsEnum(PointType)
  @ApiProperty({
    description: "Point type",
    required: true,
    example: PointType.Client,
  })
  pointType: PointType;
}
