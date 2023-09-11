import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Type } from "class-transformer";

export class MakeBidDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "Id of selling config",
    required: true,
    example: "63bd19ae801ebab8d9fdfe69",
  })
  sellingConfigId: string;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  @ApiProperty({
    description: "Price want to bid",
    required: true,
    example: 100,
  })
  price: number;
}
