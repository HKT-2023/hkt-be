import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Query,
  Request,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { IResponseToClient } from "src/configs/response";
import { ActivityMessageSuccess } from "src/modules/activity/activity.const";
import { ActivityService } from "src/modules/activity/activity.service";
import { GetActivitiesDto } from "src/modules/activity/dto";
import { DetailActivityDto } from "src/modules/activity/dto/detail-activity.dto";

@Controller("activity")
@ApiTags("Activity Management")
@ApiBearerAuth()
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get("")
  @ApiOperation({ summary: "Api for get list activities." })
  @ApiResponse({
    status: HttpStatus.OK,
    type: "",
  })
  async getListTransaction(
    @Request() request,
    @Query() getActivitiesDto: GetActivitiesDto
  ): Promise<IResponseToClient> {
    const data = await this.activityService.getListTransaction(
      request.user.id,
      getActivitiesDto
    );
    return {
      message: ActivityMessageSuccess.GetListActivity,
      data: data.activities,
      statusCode: HttpStatus.OK,
      metadata: {
        page: Number(getActivitiesDto.page),
        limit: Number(getActivitiesDto.limit),
        currentPage: Number(getActivitiesDto.page),
        totalFiltered: data.activities.length,
        total: data.totalActivities,
      },
    };
  }

  @Get("/:id")
  @ApiOperation({ summary: "Api for get detail activity." })
  async getDetailListing(
    @Param() detailListingDto: DetailActivityDto
  ): Promise<IResponseToClient> {
    const result = await this.activityService.getDetailActivity(
      detailListingDto.id
    );
    return {
      message: ActivityMessageSuccess.GetDetailActivity,
      data: result,
      statusCode: HttpStatus.OK,
    };
  }
}
