import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { Type } from "class-transformer";
import { NftSellingConfigType } from "src/models/schemas/nft-selling-configs.schema";

export class NFTMarketPlaceDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: "Search by NFT name or seller name",
    required: false,
    example: "NFT",
  })
  search: string;

  @IsEnum(NftSellingConfigType)
  @IsOptional()
  @ApiProperty({
    description: `Type of selling. ${NftSellingConfigType.Bid},${NftSellingConfigType.SellFixedPrice},${NftSellingConfigType.Offer}`,
    required: false,
    example: NftSellingConfigType.SellFixedPrice,
  })
  sellType: string;
  sellTypes: string[];

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  @ApiProperty({
    description: "From price",
    required: false,
    example: 1,
  })
  fromPrice: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  @ApiProperty({
    description: "To price",
    required: false,
    example: 100,
  })
  toPrice: number;

  @IsOptional()
  @ApiProperty({
    description: "Sort by price",
    required: false,
    example: "-1 for DESC | 1 for ASC",
  })
  sortByPrice: string;

  @IsOptional()
  @ApiProperty({
    description: "Sort by price",
    required: false,
    example: "-1 for DESC | 1 for ASC",
  })
  sortByPoint: string;

  @IsOptional()
  @ApiProperty({
    description: "Sort by time created",
    required: false,
    example: "-1 for DESC | 1 for ASC",
  })
  sortByCreatedAt: string;

  @IsOptional()
  @ApiProperty({
    description: "Sort by end time",
    required: false,
    example: "-1 for DESC | 1 for ASC",
  })
  sortByEndTime: string;

  @IsNumber()
  @Type(() => Number)
  @ApiProperty({
    description: "Page",
    required: true,
    example: 1,
  })
  page: number;

  @IsNumber()
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
    description: "Option to get my NFT",
    required: false,
    example: true,
  })
  isMyNFT?: boolean;
}
