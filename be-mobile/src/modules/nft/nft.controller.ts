import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Put,
  Query,
  Request,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { NftService } from "src/modules/nft/nft.service";
import { IResponseToClient } from "src/configs/response";
import { NftMessageSuccess } from "src/modules/nft/nft.const";
import {
  ApproveOfferDto,
  ApproveOfferNotFoundResponse,
  ApproveOfferSuccess,
  CancelOfferDto,
  CancelOfferSuccess,
  CancelSellingConfigDto,
  CancelSellingConfigSuccess,
  ConfigBidDto,
  ConfigBidResponseFailed,
  ConfigBidResponseSuccess,
  ConfigOfferDto,
  ConfigOfferResponseFailed,
  ConfigOfferResponseSuccess,
  ConfigSellDto,
  ConfigSellResponseFailed,
  ConfigSellResponseSuccess,
  MakeOfferDto,
  MakeOfferResponseFailed,
  MakeOfferResponseSuccess,
  NoSellingConfigFoundResponse,
  NotOwnerOfferResponse,
  NotOwnerSellingConfigResponse,
  OfferNotFoundResponse,
  RejectOfferDto,
  RejectOfferNotFoundResponse,
  RejectOfferSuccess,
} from "src/modules/nft/dto";
import { BuyNFTAtFixedPrice } from "src/modules/nft/dto/buy-NFT-at-fixed-price";
import { NFTMarketPlaceDto } from "src/modules/nft/dto/NFT-market-place.dto";
import { MakeBidDto } from "src/modules/nft/dto/make-bid.dto";
import { ListOfferDto } from "src/modules/nft/dto/list-offer.dto";
import { ListBidDto } from "src/modules/nft/dto/list-bid.dto";
import { NFTSaleHistoryDto } from "src/modules/nft/dto/NFT-sale-history.dto";
import { EarlyEndAuctionDto } from "src/modules/nft/dto/early-end-auction.dto";
import { MintNftDto } from "src/modules/nft/dto/mint-nft.dto";

@Controller("nft")
@ApiTags("NFT")
@ApiBearerAuth()
export class NftController {
  constructor(private readonly nftService: NftService) {}

  @Get("NFT-market-place")
  async getNFTMarketPlace(
    @Query() nftMarketPlaceDto: NFTMarketPlaceDto,
    @Request() request
  ): Promise<IResponseToClient> {
    const data = await this.nftService.getNFTMarketPlace(
      nftMarketPlaceDto,
      request.user.id
    );
    return {
      message: NftMessageSuccess.GetNFTMarketPlaceSuccess,
      data: data.data,
      statusCode: HttpStatus.OK,
      metadata: {
        totalFiltered: data.data.length,
        limit: Number(nftMarketPlaceDto.limit),
        page: Number(nftMarketPlaceDto.page),
        currentPage: Number(nftMarketPlaceDto.page),
        total: data.total,
      },
    };
  }

  @Post("mint-nft")
  async mintNFT(
    @Request() request,
    @Body() mintNftDto: MintNftDto
  ): Promise<IResponseToClient> {
    const data = await this.nftService.mint(request.user, mintNftDto);
    return {
      message: "Mint success",
      data,
      statusCode: HttpStatus.CREATED,
    };
  }

  @Post("config-sell")
  @ApiOperation({ summary: "Api for setup sell NFT at fixed price." })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: ConfigSellResponseSuccess,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ConfigSellResponseFailed,
  })
  async sellFixPrice(
    @Body() configSellDto: ConfigSellDto,
    @Request() request: any
  ): Promise<IResponseToClient> {
    const result = await this.nftService.sellNftAtFixedPrice(
      configSellDto.nftId,
      configSellDto.price,
      request.user.id
    );
    return {
      message: NftMessageSuccess.SellingFixedSuccess,
      data: result,
      statusCode: HttpStatus.CREATED,
    };
  }

  @Post("buy-NFT-at-fixed-price")
  @ApiOperation({
    summary: "Api for buy NFT at fixed price.",
  })
  async buyNFTAtFixedPrice(
    @Body() buyNFTAtFixedPrice: BuyNFTAtFixedPrice,
    @Request() request
  ): Promise<IResponseToClient> {
    const result = await this.nftService.buyNFTAtFixedPrice(
      buyNFTAtFixedPrice.NFTSellingConfig,
      request.user.id
    );
    return {
      message: NftMessageSuccess.BuyNFTSuccess,
      data: result,
      statusCode: HttpStatus.CREATED,
    };
  }

  //===================================================================================================================/

  @Post("config-auction")
  @ApiOperation({
    summary: "Api for turn on bid NFT that allow other users can auction NFT.",
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: ConfigBidResponseSuccess,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ConfigBidResponseFailed,
  })
  async configAuction(
    @Body() configBidDto: ConfigBidDto,
    @Request() request: any
  ): Promise<IResponseToClient> {
    const result = await this.nftService.configAuction(
      configBidDto.nftId,
      configBidDto.endTime,
      request.user.id,
      configBidDto.winningPrice,
      configBidDto.startPrice
    );
    return {
      message: NftMessageSuccess.BidSuccess,
      data: result,
      statusCode: HttpStatus.CREATED,
    };
  }

  @Put("end-auction")
  @ApiOperation({
    summary: "Api for early end auction.",
  })
  async earlyEndAuction(
    @Body() earlyEndAuctionDto: EarlyEndAuctionDto,
    @Request() request
  ): Promise<IResponseToClient> {
    const data = await this.nftService.earlyEndAuction(
      request.user.id,
      earlyEndAuctionDto.sellingConfigId
    );
    return {
      message: NftMessageSuccess.EndAuctionSuccess,
      data,
      statusCode: HttpStatus.OK,
    };
  }

  @Put("cancel-config")
  @ApiOperation({
    summary: "Api for turn off NFT config selling.",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: CancelSellingConfigSuccess,
  })
  @ApiNotFoundResponse({
    status: HttpStatus.NOT_FOUND,
    type: NoSellingConfigFoundResponse,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    type: NotOwnerSellingConfigResponse,
  })
  async cancelConfig(
    @Body() cancelSellingConfigDto: CancelSellingConfigDto,
    @Request() request: any
  ): Promise<IResponseToClient> {
    const result = await this.nftService.cancelSellingConfig(
      cancelSellingConfigDto.sellingConfigId,
      request.user.id
    );
    return {
      message: NftMessageSuccess.CancelSellingConfigSuccess,
      data: result,
      statusCode: HttpStatus.OK,
    };
  }

  @Get("list-offer")
  @ApiOperation({
    summary: "Api to list offer belong to NFT.",
  })
  async listOfferBelongToNFT(
    @Query() listOfferDto: ListOfferDto
  ): Promise<IResponseToClient> {
    const data = await this.nftService.listOffer(
      listOfferDto.NFTId,
      listOfferDto.page,
      listOfferDto.limit
    );
    return {
      message: NftMessageSuccess.ListOfferSuccess,
      data: data.data,
      statusCode: HttpStatus.OK,
      metadata: {
        total: data.total,
        limit: Number(listOfferDto.limit),
        page: Number(listOfferDto.page),
        currentPage: Number(listOfferDto.page),
        totalFiltered: data.data.length,
      },
    };
  }

  //===================================================================================================================/

  @Post("config-offer")
  @ApiOperation({
    summary:
      "Api for turn on receive offer NFT that allow other users make offer to owner NFT.",
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: ConfigOfferResponseSuccess,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ConfigOfferResponseFailed,
  })
  async turnOnOffer(
    @Body() configOfferDto: ConfigOfferDto,
    @Request() request: any
  ): Promise<IResponseToClient> {
    const result = await this.nftService.turnOnOffer(
      configOfferDto.nftId,
      request.user.id,
      configOfferDto.price
    );
    return {
      message: NftMessageSuccess.ConfigOfferSuccess,
      data: result,
      statusCode: HttpStatus.CREATED,
    };
  }

  //===================================================================================================================/

  @Post("make-offer")
  @ApiOperation({
    summary: "Api to make offer",
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: MakeOfferResponseSuccess,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    type: MakeOfferResponseFailed,
  })
  @ApiNotFoundResponse({
    status: HttpStatus.NOT_FOUND,
    type: NoSellingConfigFoundResponse,
  })
  async makeOffer(
    @Body() makeOfferDto: MakeOfferDto,
    @Request() request: any
  ): Promise<IResponseToClient> {
    const result = await this.nftService.makeOffer(
      makeOfferDto.sellingConfigId,
      request.user.id,
      makeOfferDto.price,
      makeOfferDto.description
    );
    return {
      message: NftMessageSuccess.MakeOfferSuccess,
      data: result,
      statusCode: HttpStatus.CREATED,
    };
  }

  //===================================================================================================================/

  @Put("cancel-offer")
  @ApiOperation({
    summary: "Api for user to cancel their make offer",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: CancelOfferSuccess,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    type: NotOwnerOfferResponse,
  })
  @ApiNotFoundResponse({
    status: HttpStatus.NOT_FOUND,
    type: OfferNotFoundResponse,
  })
  async cancelOffer(
    @Body() cancelOfferDto: CancelOfferDto,
    @Request() request: any
  ): Promise<IResponseToClient> {
    const result = await this.nftService.cancelOffer(
      cancelOfferDto.offerId,
      request.user.id
    );
    return {
      message: NftMessageSuccess.CancelOfferSuccess,
      data: result,
      statusCode: HttpStatus.CREATED,
    };
  }

  //===================================================================================================================/

  @Put("approve-offer")
  @ApiOperation({
    summary: "Api for owner NFT to approved offer",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ApproveOfferSuccess,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    type: NotOwnerSellingConfigResponse,
  })
  @ApiNotFoundResponse({
    status: HttpStatus.NOT_FOUND,
    type: ApproveOfferNotFoundResponse,
  })
  async approveOffer(
    @Body() approveOfferDto: ApproveOfferDto,
    @Request() request: any
  ): Promise<IResponseToClient> {
    const result = await this.nftService.approveOffer(
      approveOfferDto.offerId,
      request.user.id
    );
    return {
      message: NftMessageSuccess.ApproveOfferSuccess,
      data: result,
      statusCode: HttpStatus.OK,
    };
  }

  //===================================================================================================================/

  @Put("reject-offer")
  @ApiOperation({
    summary: "Api for owner NFT to reject offer",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: RejectOfferSuccess,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    type: NotOwnerSellingConfigResponse,
  })
  @ApiNotFoundResponse({
    status: HttpStatus.NOT_FOUND,
    type: RejectOfferNotFoundResponse,
  })
  async rejectOffer(
    @Body() rejectOfferDto: RejectOfferDto,
    @Request() request: any
  ): Promise<IResponseToClient> {
    const result = await this.nftService.rejectOffer(
      rejectOfferDto.offerId,
      request.user.id
    );
    return {
      message: NftMessageSuccess.RejectOfferSuccess,
      data: result,
      statusCode: HttpStatus.OK,
    };
  }

  @Post("make-bid")
  @ApiOperation({
    summary: "Api for bid NFT",
  })
  async makeBid(
    @Body() makeBidDto: MakeBidDto,
    @Request() request
  ): Promise<IResponseToClient> {
    const data = await this.nftService.makeBid(makeBidDto, request.user.id);
    return {
      data,
      message: NftMessageSuccess.MakeBidNFTSuccess,
      statusCode: HttpStatus.CREATED,
    };
  }

  @Get("list-bid")
  @ApiOperation({
    summary: "Api list bid belong to NFT",
  })
  async listBid(@Query() listBidDto: ListBidDto): Promise<IResponseToClient> {
    const data = await this.nftService.listBid(
      listBidDto.NFTId,
      listBidDto.page,
      listBidDto.limit
    );
    return {
      data: data.data,
      message: NftMessageSuccess.ListBidSuccess,
      statusCode: HttpStatus.OK,
      metadata: {
        totalFiltered: data.data.length,
        limit: Number(listBidDto.limit),
        page: Number(listBidDto.page),
        currentPage: Number(listBidDto.page),
        total: data.total,
      },
    };
  }

  @Get("sale-history")
  @ApiOperation({
    summary: "Api to get sale history of NFT",
  })
  async getNFTSaleHistory(
    @Query() nftSaleHistoryDto: NFTSaleHistoryDto
  ): Promise<IResponseToClient> {
    const data = await this.nftService.getNFTSaleHistory(
      nftSaleHistoryDto.NFTId,
      nftSaleHistoryDto.page,
      nftSaleHistoryDto.limit
    );
    return {
      data: data.data,
      statusCode: HttpStatus.OK,
      message: NftMessageSuccess.GetSaleHistorySuccess,
      metadata: {
        total: data.total,
        limit: Number(nftSaleHistoryDto.limit),
        page: Number(nftSaleHistoryDto.page),
        totalFiltered: data.data.length,
        currentPage: Number(nftSaleHistoryDto.page),
      },
    };
  }

  @Get("estimate-fee")
  @ApiOperation({
    summary: "Api to get fee",
  })
  public async estimateFee(): Promise<IResponseToClient> {
    const data = await this.nftService.estimateFee();
    return {
      message: NftMessageSuccess.EstimateFeeSuccess,
      statusCode: HttpStatus.OK,
      data,
    };
  }
}
