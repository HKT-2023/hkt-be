import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { NftMessageError, NftMessageSuccess } from "src/modules/nft/nft.const";
import { HttpStatus } from "@nestjs/common";

export class ApproveOfferDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "Id of offer",
    required: true,
    example: "63bd19ae801ebab8d9fdfe69",
  })
  offerId: string;
}

export class ApproveOfferSuccess {
  @ApiProperty({
    example: NftMessageSuccess.ApproveOfferSuccess,
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
      status: "approved",
      _id: "63be87084ae9656c5b808d1c",
      __v: 0,
    },
  })
  data: any;

  @ApiProperty({
    example: HttpStatus.OK,
  })
  statusCode: number;
}

export class ApproveOfferNotFoundResponse {
  @ApiProperty({
    example: `${NftMessageError.OfferNotFound} | ${NftMessageError.NoSellingConfigFound}`,
  })
  message: string;
}
