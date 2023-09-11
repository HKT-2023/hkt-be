import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { NftMessageError, NftMessageSuccess } from "src/modules/nft/nft.const";
import { HttpStatus } from "@nestjs/common";
import { Type } from "class-transformer";

export class ConfigOfferDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "Id of nft in nft tables",
    required: true,
    example: "63bd19ae801ebab8d9fdfe69",
  })
  nftId: string;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  @ApiProperty({
    description: "Price if user want to buy at time",
    required: true,
    example: 1000,
  })
  price: number;
}

export class ConfigOfferResponseSuccess {
  @ApiProperty({
    example: NftMessageSuccess.ConfigOfferSuccess,
  })
  message: string;

  @ApiProperty({
    example: {
      createdAt: "2023-01-11T08:09:28.116Z",
      updatedAt: "2023-01-11T08:09:28.117Z",
      nftId: "63bd19ae801ebab8d9fdfe69",
      type: "offer",
      currency: "REAL",
      status: "active",
      _id: "63be6ed625c1bbc7cfb5a179",
      __v: 0,
    },
  })
  data: {};

  @ApiProperty({
    example: HttpStatus.CREATED,
  })
  statusCode: number;
}

export class ConfigOfferResponseFailed {
  @ApiProperty({
    example: `${NftMessageError.NftNotFound} | ${NftMessageError.NftSellingConfigExist}`,
  })
  message: string;
}
