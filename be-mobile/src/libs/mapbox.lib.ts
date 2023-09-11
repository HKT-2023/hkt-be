import { HttpService } from "@nestjs/axios";
import { HttpException, HttpStatus } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import { ListingMessageError } from "src/modules/listing/listing.const";

export class MapboxLib {
  private readonly httpService: HttpService;
  constructor(httpService: HttpService) {
    this.httpService = httpService;
  }

  public async getLocationInformation(
    locationOrZipcode: string
  ): Promise<{}[]> {
    const responseResult = [];
    try {
      console.log(
        `${process.env.MAPBOX_HOST}/geocoding/v5/mapbox.places/${locationOrZipcode}.json?access_token=${process.env.MAPBOX_ACCESS_TOKEN}&country=US`
      );
      const response = await firstValueFrom(
        this.httpService.get(
          `${process.env.MAPBOX_HOST}/geocoding/v5/mapbox.places/${locationOrZipcode}.json?access_token=${process.env.MAPBOX_ACCESS_TOKEN}&country=US`,
          {
            headers: { "Content-Type": "application/json" },
          }
        )
      );
      if (!response || response.data.features.length === 0) {
        throw new HttpException(
          { message: ListingMessageError.InvalidZipCode },
          HttpStatus.BAD_REQUEST
        );
      }

      for (const data of response.data.features) {
        const contexts = data.context;
        let zipCode = null;
        let city = null;

        responseResult.push(data);
        for (const context of contexts) {
          if (context.id.includes("region")) {
            city = context.text;
          }
          if (context.id.includes("postcode")) {
            zipCode = context.text;
          }

          data["zipCode"] = zipCode;
          data["city"] = city;
        }
      }
    } catch (err) {
      throw new HttpException(
        { message: ListingMessageError.InvalidZipCode },
        HttpStatus.BAD_REQUEST
      );
    }
    return responseResult;
  }
}
