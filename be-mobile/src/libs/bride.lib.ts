import { HttpService } from "@nestjs/axios";
import { HttpException, HttpStatus } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import { BRIDGE_CONFIG } from "src/configs/bridge.config";
import {
  FIELDS,
  IListingDetailResponse,
  mappingListing,
  mappingListings,
} from "src/modules/listing/data/mapping-data";
import { ListingMessageError } from "src/modules/listing/listing.const";

export class BrideLib {
  private readonly httpService: HttpService;

  constructor(httpService: HttpService) {
    this.httpService = httpService;
  }

  private listApi = {
    Listing: "listings",
  };

  public async getListingCoordinateByListingId(
    listingId: string
  ): Promise<number[]> {
    const response = await firstValueFrom(
      this.httpService.get(
        `${process.env.BRIDGE_URL}/${process.env.BRIDGE_DATA_SET}/${this.listApi.Listing}/${listingId}?access_token=${process.env.BRIDGE_ACCESS_TOKEN}`,
        {
          headers: { "Content-Type": "application/json" },
        }
      )
    );
    return response.data.bundle.Coordinates;
  }

  public async getListingByQueryParams(queryParams: string): Promise<{
    totalListings: number;
    listings: any[];
  }> {
    let listings = [];
    let totalListings = 0;

    console.log(
      `${BRIDGE_CONFIG.bridgeUrl}/${BRIDGE_CONFIG.bridgeDataSet}/listings?access_token=${BRIDGE_CONFIG.bridgeAccessToken}${queryParams}`
    );

    const response = await firstValueFrom(
      this.httpService.get(
        `${BRIDGE_CONFIG.bridgeUrl}/${BRIDGE_CONFIG.bridgeDataSet}/listings?access_token=${BRIDGE_CONFIG.bridgeAccessToken}${queryParams}`
      )
    );

    if (!response["data"].success) {
      throw new HttpException(
        { message: ListingMessageError.GetListingFailed },
        HttpStatus.BAD_REQUEST
      );
    }

    listings = mappingListings(response["data"].bundle || []);
    totalListings = response["data"].total;

    return {
      totalListings,
      listings,
    };
  }

  public async getDetailListing(
    listingId: string
  ): Promise<IListingDetailResponse> {
    const fields = FIELDS.join(",");

    const response = await firstValueFrom(
      this.httpService.get(
        `${BRIDGE_CONFIG.bridgeUrl}/${BRIDGE_CONFIG.bridgeDataSet}/listings/${listingId}?access_token=${BRIDGE_CONFIG.bridgeAccessToken}&fields=${fields}`
      )
    );
    if (!response["data"].success) {
      throw new HttpException(
        { message: ListingMessageError.ListingNotFound },
        HttpStatus.BAD_REQUEST
      );
    }

    return mappingListing(response["data"].bundle || {});
  }
}
