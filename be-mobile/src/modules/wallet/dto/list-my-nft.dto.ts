import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export class ListMyNftDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: "Search by NFT name",
    required: false,
    example: "NFT",
  })
  search: string;

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

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  @ApiProperty({
    description:
      "Option to get all or just on wallet, not include on market place",
    required: false,
    example: true,
  })
  isContainMKP?: boolean;
}
