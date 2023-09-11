import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Type } from "class-transformer";

export class NFTSaleHistoryDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "Id of NFT",
    required: true,
    example: "63bd19ae801ebab8d9fdfe69",
  })
  NFTId: string;

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
  @Type(() => Number)
  @ApiProperty({
    description: "Page",
    required: true,
    example: 10,
  })
  limit: number;
}
