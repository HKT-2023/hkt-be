import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Request,
} from "@nestjs/common";
import { IResponseToClient } from "src/configs/response";
import { WalletService } from "src/modules/wallet/wallet.service";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { WalletMessageSuccess } from "src/modules/wallet/wallet.const";
import { ListMyNftDto } from "src/modules/wallet/dto/list-my-nft.dto";
import { ViewNftDetailDto } from "src/modules/wallet/dto/view-nft-detail.dto";
import { SendTokenDto } from "src/modules/wallet/dto/send-token.dto";
import { SendNFTDto } from "src/modules/wallet/dto/send-NFT.dto";

@Controller("wallet")
@ApiTags("Wallet management")
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post("sent-token")
  async sendToken(
    @Body() sendTokenDto: SendTokenDto,
    @Request() request
  ): Promise<IResponseToClient> {
    const data = await this.walletService.sendToken(
      request.user.id,
      sendTokenDto
    );
    return {
      message: WalletMessageSuccess.SendTokenSuccess,
      data,
      statusCode: HttpStatus.CREATED,
    };
  }

  @Post("sent-NFT")
  async sendNFT(
    @Body() sendNFTDto: SendNFTDto,
    @Request() request
  ): Promise<IResponseToClient> {
    const data = await this.walletService.sendNFT(request.user.id, sendNFTDto);
    return {
      message: WalletMessageSuccess.SendNFTSuccess,
      data,
      statusCode: HttpStatus.CREATED,
    };
  }

  @Get("my-wallet")
  async getMyWallet(@Request() request): Promise<IResponseToClient> {
    const userWallet = await this.walletService.getOrCreateWallet(
      request.user.id
    );
    return {
      message: WalletMessageSuccess.GetWalletSuccess,
      data: userWallet,
      statusCode: HttpStatus.OK,
    };
  }

  @Get("view-NFT")
  async viewNFTInWallet(
    @Request() request,
    @Query() listMyNftDto: ListMyNftDto
  ): Promise<IResponseToClient> {
    const data = await this.walletService.viewNFTInWallet(
      request.user.id,
      listMyNftDto
    );
    return {
      message: "List NFT success",
      data: data.NFTs,
      metadata: {
        page: Number(listMyNftDto.page),
        limit: Number(listMyNftDto.limit),
        total: data.total,
        currentPage: Number(listMyNftDto.page),
        totalFiltered: data.NFTs.length,
      },
      statusCode: HttpStatus.OK,
    };
  }

  @Get("view-NFT-detail")
  async viewDetailNFT(
    @Request() request,
    @Query() viewNftDetailDto: ViewNftDetailDto
  ): Promise<IResponseToClient> {
    const NFT = await this.walletService.viewDetailNFT(
      request.user.id,
      viewNftDetailDto.NFTId
    );
    return {
      message: "List NFT success",
      data: NFT,
      statusCode: HttpStatus.OK,
    };
  }
}
