import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";
import { NFTType } from "src/models/schemas/nft.schema";

export class MintNftDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  images: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  propertyAddress: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  salesPrice: number;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  salesDate: Date;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  theListDate: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  endDate: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  price: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  point: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  winningPrice: number;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  agentName: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  customer: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  tokenId: number;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  transactionId: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  nftType: NFTType;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  listingId: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  ownerName: string;
}
