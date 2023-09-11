import { Model } from "mongoose";
import { Nft, NftDocument, NFTType } from "src/models/schemas/nft.schema";
import { NFTMarketPlaceDto } from "src/modules/nft/dto/NFT-market-place.dto";
import { NftSellingConfigStatus } from "src/models/schemas/nft-selling-configs.schema";
import { ListMyNftDto } from "src/modules/wallet/dto/list-my-nft.dto";

export class NftRepository {
  constructor(private readonly model: Model<NftDocument>) {}

  public async save(nft: Nft): Promise<Nft> {
    const newNft = new this.model(nft);
    return this.model.create(newNft);
  }

  public async getNFTByTokenId(tokenId: number): Promise<Nft> {
    return this.model.findOne({
      tokenId,
    });
  }

  public async getNFTById(nftId: string, filter = []): Promise<Nft> {
    return this.model
      .findOne({
        _id: nftId,
      })
      .select(filter);
  }

  public async getLatestNFT(): Promise<Nft> {
    return this.model.findOne().sort({ tokenId: "desc" });
  }

  public async getListNFTByWallet(
    walletAddress: string,
    listMyNftDto: ListMyNftDto,
    filter = []
  ): Promise<Nft[]> {
    const condition = {
      ownerAddress: walletAddress,
    };
    if (!listMyNftDto.isContainMKP)
      condition["saleStatus"] = { $ne: NftSellingConfigStatus.Active };

    if (listMyNftDto.search) {
      condition["name"] = {
        $regex: ".*" + listMyNftDto.search + ".*",
        $options: "i",
      };
    }
    return this.model
      .find(condition)
      .skip((listMyNftDto.page - 1) * listMyNftDto.limit)
      .limit(listMyNftDto.limit)
      .sort({ createdAt: "desc" })
      .select(filter);
  }

  public async countNFTByWallet(
    walletAddress: string,
    listMyNftDto: ListMyNftDto
  ): Promise<number> {
    const condition = {
      ownerAddress: walletAddress,
    };
    if (!listMyNftDto.isContainMKP)
      condition["saleStatus"] = NftSellingConfigStatus.InActive;

    if (listMyNftDto.search) {
      condition["name"] = {
        $regex: ".*" + listMyNftDto.search + ".*",
        $options: "i",
      };
    }
    return this.model.count(condition);
  }

  public async getListTotalPointByNFTType(): Promise<
    { nftType: NFTType; totalPoint: number }[]
  > {
    const groupData = await this.model.aggregate([
      {
        $group: {
          _id: "$nftType",
          totalPoint: { $sum: "$point" },
        },
      },
    ]);
    return groupData.map((data) => {
      return { nftType: data._id, totalPoint: data.totalPoint };
    });
  }

  public async getListTotalPointByUserType(): Promise<
    { userId: string; nftType: NFTType; totalPoint: number }[]
  > {
    const groupData = await this.model.aggregate([
      {
        $group: {
          _id: { nftType: "$nftType", userId: "$userId" },
          totalPoint: { $sum: "$point" },
        },
      },
    ]);
    return groupData.map((data) => {
      return {
        userId: data._id.userId,
        totalPoint: data.totalPoint,
        nftType: data._id.nftType,
      };
    });
  }

  public async getListClientTotalPointByUser(): Promise<
    { userId: string; totalPoint: number }[]
  > {
    const groupData = await this.model.aggregate([
      {
        $match: {
          $or: [{ nftType: NFTType.Seller }, { nftType: NFTType.Buyer }],
        },
      },
      {
        $group: {
          _id: { userId: "$userId" },
          totalPoint: { $sum: "$point" },
        },
      },
    ]);

    return groupData.map((data) => {
      return {
        userId: data._id.userId,
        totalPoint: data.totalPoint,
      };
    });
  }

  public async getUserPointByNFTType(userId: string): Promise<Nft[]> {
    return this.model.find({ userId }).select(["point", "nftType"]);
  }

  public async getTotalPointByUser(userId: string): Promise<number> {
    const NFTs = await this.model.find({ userId }).select(["point"]);
    let totalPoint = 0;
    for (const NFT of NFTs) {
      totalPoint += NFT.point;
    }
    return totalPoint;
  }

  private static extractCondition(conditions: any | any): {} {
    const conditionQuery = {};
    for (const key in conditions) {
      if (key === "search") {
        conditionQuery["name"] = {
          $regex: ".*" + conditions[key] + ".*",
          $options: "i",
        };
        continue;
      }
    }
    return conditionQuery;
  }

  private static extractSort(sort: any): {} {
    const sortExtracted = {};
    if (sort.sortListed) sortExtracted["putSaleTime"] = sort.sortListed;

    return sortExtracted;
  }

  public async getNFTs(
    page: number,
    limit: number,
    conditions?: any,
    sort = {}
  ): Promise<Nft[]> {
    const conditionQuery = NftRepository.extractCondition(conditions);
    const extractSort = NftRepository.extractSort(sort);

    return this.model
      .find({
        ...conditionQuery,
      })
      .sort(extractSort)
      .skip((page - 1) * limit)
      .limit(limit);
  }

  public async getNFTMarketPlace(
    nftMarketPlaceDto: NFTMarketPlaceDto,
    userId: string
  ): Promise<{ data: Nft[]; total: number }> {
    const conditions = [
      { saleStatus: NftSellingConfigStatus.Active },
      { saleStatus: NftSellingConfigStatus.Active },
    ];
    const sortExtracted = {};

    if (nftMarketPlaceDto.sellTypes) {
      conditions[0]["putSaleType"] = { $in: nftMarketPlaceDto.sellTypes };
      conditions[1]["putSaleType"] = { $in: nftMarketPlaceDto.sellTypes };
    }
    if (nftMarketPlaceDto.search) {
      conditions[0]["name"] = {
        $regex: ".*" + nftMarketPlaceDto.search + ".*",
        $options: "i",
      };
      conditions[1]["ownerName"] = {
        $regex: ".*" + nftMarketPlaceDto.search + ".*",
        $options: "i",
      };
    }
    if (nftMarketPlaceDto.fromPrice) {
      conditions[0]["price"] = { $gte: nftMarketPlaceDto.fromPrice };
      conditions[1]["price"] = { $gte: nftMarketPlaceDto.fromPrice };
    }
    if (nftMarketPlaceDto.toPrice) {
      conditions[0]["price"] = { $lte: nftMarketPlaceDto.toPrice };
      conditions[1]["price"] = { $lte: nftMarketPlaceDto.toPrice };
    }
    if (nftMarketPlaceDto.fromPrice && nftMarketPlaceDto.toPrice) {
      conditions[0]["price"] = {
        $gte: nftMarketPlaceDto.fromPrice,
        $lte: nftMarketPlaceDto.toPrice,
      };
      conditions[1]["price"] = {
        $gte: nftMarketPlaceDto.fromPrice,
        $lte: nftMarketPlaceDto.toPrice,
      };
    }

    if (nftMarketPlaceDto.isMyNFT) {
      conditions[0]["userId"] = userId;
      conditions[1]["userId"] = userId;
    }

    if (nftMarketPlaceDto.sortByCreatedAt) {
      sortExtracted["putSaleTime"] = nftMarketPlaceDto.sortByCreatedAt;
    }
    if (nftMarketPlaceDto.sortByPrice) {
      sortExtracted["price"] = nftMarketPlaceDto.sortByPrice;
    }
    if (nftMarketPlaceDto.sortByEndTime) {
      sortExtracted["putSaleType"] = "ASC";
      sortExtracted["endDate"] = nftMarketPlaceDto.sortByEndTime;
    }
    if (nftMarketPlaceDto.sortByPoint) {
      sortExtracted["point"] = nftMarketPlaceDto.sortByPoint;
    }

    const data = await this.model
      .find({
        $or: conditions,
      })
      .sort(sortExtracted)
      .skip((nftMarketPlaceDto.page - 1) * nftMarketPlaceDto.limit)
      .limit(nftMarketPlaceDto.limit);
    const total = await this.model.count({ $or: conditions });
    return {
      data,
      total,
    };
  }
}
