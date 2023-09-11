import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class EarlyEndAuctionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "Id of selling config",
    required: true,
    example: "63bd19ae801ebab8d9fdfe69",
  })
  sellingConfigId: string;
}
