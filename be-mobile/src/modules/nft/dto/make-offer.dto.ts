import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Type } from "class-transformer";
import { HttpStatus } from "@nestjs/common";
import { NftMessageError, NftMessageSuccess } from "src/modules/nft/nft.const";

export class MakeOfferDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "Id selling config",
    required: true,
    example: "63be6e0583b74596f33d81b5",
  })
  sellingConfigId: string;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  @ApiProperty({
    description: "Price want to offer",
    required: true,
    example: 10,
  })
  price: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "Description",
    required: true,
    example: "An example description",
  })
  description: string;
}

export class MakeOfferResponseSuccess {
  @ApiProperty({
    example: NftMessageSuccess.MakeOfferSuccess,
  })
  message: string;

  @ApiProperty({
    example: {
      createdAt: "2023-01-11T09:53:09.125Z",
      updatedAt: "2023-01-11T09:53:09.125Z",
      userId: "63b3f329ebb792e62c1b6354",
      nftId: "63bd19ae801ebab8d9fdfe69",
      price: 10,
      currency: "REAL",
      description: "An example description",
      status: "created",
      _id: "63be87084ae9656c5b808d1c",
      __v: 0,
    },
  })
  data: {};

  @ApiProperty({
    example: HttpStatus.CREATED,
  })
  statusCode: number;
}

export class MakeOfferResponseFailed {
  @ApiProperty({
    example: `${NftMessageError.SellingConfigNotActive} | ${NftMessageError.ConfigNotTypeOfOffer}`,
  })
  message: string;
}
