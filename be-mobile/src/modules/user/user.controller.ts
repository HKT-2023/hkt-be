import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
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
import { UserService } from "src/modules/user/user.service";
import { IResponseToClient } from "src/configs/response";
import { TypeOfUser, UserMessageSuccess } from "src/modules/user/user.const";
import {
  ChangePasswordDto,
  ChangePasswordDtoResponseFailed,
  ChangePasswordDtoResponseSuccess,
} from "src/modules/user/dto/change-password.dto";
import { Public, Roles } from "src/modules/authentication/auth.const";
import {
  ForgotPasswordDto,
  ForgotPasswordDtoResponseFailed,
  ForgotPasswordDtoResponseSuccess,
} from "src/modules/user/dto/forgot-password.dto";
import {
  ResetPasswordDto,
  ResetPasswordDtoResponseFailed1,
  ResetPasswordDtoResponseFailed2,
  ResetPasswordDtoResponseSuccess,
} from "src/modules/user/dto/reset-password.dto";
import {
  UserInfoDtoResponseFailed,
  UserInfoDtoResponseSuccess,
} from "src/modules/user/dto/user-info.dto";
import {
  HashAuthDto,
  HashAuthSuccess,
} from "src/modules/user/dto/hash-auth.dto";
import {
  ValidateCodeDto,
  ValidateCodeInvalid,
  ValidateCodeSuccess,
} from "src/modules/user/dto/validate-code.dto";
import { UpdateUserDto } from "src/modules/user/dto/update-user.dto";
import { UpdateAgentDto } from "src/modules/user/dto/update-agent.dto";
import { UpdateVendorDto } from "src/modules/user/dto/update-vendor.dto";
import { ViewOtherLeaderBoardDto } from "src/modules/user/dto/view-other-leader-board.dto";
import { VerifyPhoneDto } from "src/modules/user/dto/verify-phone.dto";
import { ValidateSMSDto } from "src/modules/user/dto/verify-sms.dto";
import { VerifyOTPDto } from "src/modules/user/dto/validate-otp.dto";
import { UserHomePageDto } from "src/modules/user/dto/user-homepage.dto";
import { AgentHomePageDto } from "src/modules/user/dto/agent-homepage.dto";
import { VendorHomePageDto } from "src/modules/user/dto/vendor-homepage.dto";
import { ViewLeaderBoardDto } from "src/modules/user/dto/view-leader-board.dto";

@Controller("user")
@ApiTags("User Management")
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("information")
  @ApiOperation({
    summary: "Api to get user information through JWT when user have login.",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: UserInfoDtoResponseSuccess,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    type: UserInfoDtoResponseFailed,
  })
  async viewUserInformation(@Request() request): Promise<IResponseToClient> {
    const result = await this.userService.getUserInformation(
      request.user.email
    );
    return {
      message: UserMessageSuccess.GetUserInfoSuccessfully,
      data: result,
      statusCode: HttpStatus.OK,
    };
  }

  //===================================================================================================================/

  @ApiOperation({
    summary: "Api to for user to change their account password.",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ChangePasswordDtoResponseSuccess,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ChangePasswordDtoResponseFailed,
  })
  @Put("change-password")
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Request() request: any
  ): Promise<IResponseToClient> {
    const result = await this.userService.changeUserPassword(
      request.user.email,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
      changePasswordDto.confirmPassword
    );
    return {
      message: UserMessageSuccess.ChangePasswordSuccessfully,
      data: result,
      statusCode: HttpStatus.OK,
    };
  }

  //===================================================================================================================/

  @ApiOperation({
    summary:
      "Api for user forgot password, the code to reset password will be sent to user through their email.",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ForgotPasswordDtoResponseSuccess,
  })
  @ApiNotFoundResponse({
    status: HttpStatus.NOT_FOUND,
    type: ForgotPasswordDtoResponseFailed,
  })
  @Put("forgot-password/:email")
  @Public()
  async forgotPassword(
    @Param() forgotPasswordDto: ForgotPasswordDto
  ): Promise<IResponseToClient> {
    const result = await this.userService.forgotPassword(
      forgotPasswordDto.email
    );
    return {
      message: UserMessageSuccess.SendEmailSetPasswordSuccessfully,
      data: result,
      statusCode: HttpStatus.OK,
    };
  }

  @ApiOperation({
    summary: "Api for set up 2fa.",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: "",
  })
  @ApiNotFoundResponse({
    status: HttpStatus.NOT_FOUND,
    type: "",
  })
  @Put("set-up-2fa")
  async setup2fa(
    @Request() request,
    @Body() verifyPhoneDto: VerifyPhoneDto
  ): Promise<IResponseToClient> {
    const result = await this.userService.setup2fa(
      request.user.id,
      verifyPhoneDto.phone
    );
    return {
      message: UserMessageSuccess.SendPhoneCodeSuccessfully,
      data: result,
      statusCode: HttpStatus.OK,
    };
  }

  @ApiOperation({
    summary: "Api for checking the code of reset password is valid.",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ValidateCodeSuccess,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ValidateCodeInvalid,
  })
  @Post("validate-phone-code")
  async validatePhoneCode(
    @Request() request,
    @Body() validateSMSDto: ValidateSMSDto
  ): Promise<IResponseToClient> {
    const result = await this.userService.validatePhoneCode(
      request.user.id,
      validateSMSDto.phone,
      validateSMSDto.code
    );
    return {
      message: UserMessageSuccess.ValidatePhoneCodeSuccess,
      data: result,
      statusCode: HttpStatus.OK,
    };
  }

  //===================================================================================================================/

  @ApiOperation({
    summary: "Api for checking the code of reset password is valid.",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ValidateCodeSuccess,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ValidateCodeInvalid,
  })
  @Post("validate-code")
  @Public()
  async validateCode(
    @Body() validateCodeDto: ValidateCodeDto
  ): Promise<IResponseToClient> {
    const result = await this.userService.validateCode(
      validateCodeDto.email,
      validateCodeDto.code
    );
    return {
      message: UserMessageSuccess.ForgotPasswordCodeValid,
      data: result,
      statusCode: HttpStatus.OK,
    };
  }

  //===================================================================================================================/

  @ApiOperation({
    summary:
      "Api to reset user password, this step after forgot password, use the code the system have sent to email",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ResetPasswordDtoResponseSuccess,
  })
  @ApiNotFoundResponse({
    status: HttpStatus.NOT_FOUND,
    type: ResetPasswordDtoResponseFailed1,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.NOT_FOUND,
    type: ResetPasswordDtoResponseFailed2,
  })
  @Put("reset-password")
  @Public()
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto
  ): Promise<IResponseToClient> {
    const result = await this.userService.resetPassword(
      resetPasswordDto.email,
      resetPasswordDto.newPassword,
      resetPasswordDto.confirmPassword,
      resetPasswordDto.code
    );
    return {
      message: UserMessageSuccess.ChangePasswordSuccessfully,
      data: result,
      statusCode: HttpStatus.OK,
    };
  }

  //===================================================================================================================/

  @Post("/auth-hash")
  @ApiOperation({
    summary: "Use for encrypt user id and verify on mobile for notification",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: HashAuthSuccess,
  })
  async getAuthHash(
    @Body() hashAuthDto: HashAuthDto
  ): Promise<IResponseToClient> {
    const data = await this.userService.getAuthHash(hashAuthDto.userId);
    return {
      message: UserMessageSuccess.AuthHashSuccessfully,
      data: data,
      statusCode: HttpStatus.OK,
    };
  }

  //===================================================================================================================/

  @Put("/update-user")
  @ApiOperation({
    summary: "Api for update normal user information",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: HashAuthSuccess,
  })
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @Request() request
  ): Promise<IResponseToClient> {
    const data = await this.userService.updateUser(updateUserDto, request.user);
    return {
      message: UserMessageSuccess.UpdateUserSuccess,
      data: data,
      statusCode: HttpStatus.OK,
    };
  }

  //===================================================================================================================/

  @Put("/update-agent-user")
  @ApiOperation({
    summary: "Api for update agent user information",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: HashAuthSuccess,
  })
  async updateAgentUser(
    @Body() updateAgentDto: UpdateAgentDto,
    @Request() request
  ): Promise<IResponseToClient> {
    const data = await this.userService.updateUser(
      updateAgentDto,
      request.user
    );
    return {
      message: UserMessageSuccess.UpdateUserSuccess,
      data: data,
      statusCode: HttpStatus.OK,
    };
  }
  //===================================================================================================================/

  @Put("/update-vendor-user")
  @ApiOperation({
    summary: "Api for update vendor user information",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: HashAuthSuccess,
  })
  async updateVendorUser(
    @Body() updateVendorDto: UpdateVendorDto,
    @Request() request
  ): Promise<IResponseToClient> {
    const data = await this.userService.updateUser(
      updateVendorDto,
      request.user
    );
    return {
      message: UserMessageSuccess.UpdateUserSuccess,
      data: data,
      statusCode: HttpStatus.OK,
    };
  }

  //===================================================================================================================/

  @Get("/user-view-point")
  @ApiOperation({
    summary: "Api for user to view point",
  })
  async userViewPoint(@Request() request): Promise<IResponseToClient> {
    const data = await this.userService.userViewPoint(request.user.id);
    return {
      message: "Get point successfully",
      data: data,
      statusCode: HttpStatus.OK,
    };
  }

  //===================================================================================================================/

  @Get("/view-leaderboard")
  @ApiOperation({
    summary: "Api for view leaderboard",
  })
  async viewLeaderBoard(
    @Request() request,
    @Query() viewLeaderBoardDto: ViewLeaderBoardDto
  ): Promise<IResponseToClient> {
    const data = await this.userService.viewLeaderBoard(
      request.user.id,
      viewLeaderBoardDto.pointType
    );
    return {
      message: "Get leaderboard success",
      data: data,
      statusCode: HttpStatus.OK,
    };
  }

  //===================================================================================================================/

  @Get("/view-other-leaderboard")
  @ApiOperation({
    summary: "Api for view other leaderboard, out of top three",
  })
  async viewOtherLeaderboard(
    @Request() request,
    @Query() viewOtherLeaderBoardDto: ViewOtherLeaderBoardDto
  ): Promise<IResponseToClient> {
    const data = await this.userService.viewOtherLeaderBoard(
      Number(viewOtherLeaderBoardDto.page),
      Number(viewOtherLeaderBoardDto.limit),
      viewOtherLeaderBoardDto.pointType
    );
    return {
      message: "Get other leaderboard success",
      data: data.data,
      metadata: {
        total: data.total,
        limit: Number(viewOtherLeaderBoardDto.limit),
        page: Number(viewOtherLeaderBoardDto.page),
        currentPage: Number(viewOtherLeaderBoardDto.page),
        totalFiltered: data.data.length,
      },
      statusCode: HttpStatus.OK,
    };
  }

  //===================================================================================================================/

  @Get("view-my-point")
  @Roles(TypeOfUser.User)
  @ApiOperation({
    summary: "Api for view my point",
  })
  async viewPoint(@Request() request): Promise<IResponseToClient> {
    const point = await this.userService.viewUserPoint(request.user.id);
    return {
      message: "",
      data: {
        point: point,
      },
      statusCode: HttpStatus.OK,
    };
  }

  @ApiOperation({
    summary: "Api for send otp.",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: "",
  })
  @ApiNotFoundResponse({
    status: HttpStatus.NOT_FOUND,
    type: "",
  })
  @Post("send-otp")
  async sendOtp(@Request() request): Promise<IResponseToClient> {
    const result = await this.userService.sendOtp(request.user.id);
    return {
      message: UserMessageSuccess.SendPhoneCodeSuccessfully,
      data: result,
      statusCode: HttpStatus.OK,
    };
  }

  @ApiOperation({
    summary: "Api for verify otp.",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: "",
  })
  @ApiNotFoundResponse({
    status: HttpStatus.NOT_FOUND,
    type: "",
  })
  @Post("verify-otp")
  async verifyOtp(
    @Request() request,
    @Body() verifyOTPDto: VerifyOTPDto
  ): Promise<IResponseToClient> {
    const result = await this.userService.verifyOtp(
      request.user.id,
      verifyOTPDto
    );
    return {
      message: UserMessageSuccess.verifyOtpSuccessfully,
      data: result,
      statusCode: HttpStatus.OK,
    };
  }

  @Get("/user-home-page")
  @ApiOperation({ summary: "Api for get course/listing/vendor homepage." })
  @ApiResponse({
    status: HttpStatus.OK,
    type: "",
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    type: "",
  })
  async getUserHomePage(
    @Request() request,
    @Query() userHomePageDto: UserHomePageDto
  ): Promise<IResponseToClient> {
    const data = await this.userService.getUserHomePage(
      request.user,
      userHomePageDto
    );
    return {
      message: UserMessageSuccess.HomePageSuccessfully,
      data,
      statusCode: HttpStatus.OK,
    };
  }

  @Get("/agent-home-page")
  @ApiOperation({ summary: "Api for get course/listing/vendor homepage." })
  @ApiResponse({
    status: HttpStatus.OK,
    type: "",
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    type: "",
  })
  async getAgentHomePage(
    @Request() request,
    @Query() agentHomePageDto: AgentHomePageDto
  ): Promise<IResponseToClient> {
    const data = await this.userService.getAgentHomePage(
      request.user,
      agentHomePageDto
    );
    return {
      message: UserMessageSuccess.HomePageSuccessfully,
      data,
      statusCode: HttpStatus.OK,
    };
  }

  @Get("/vendor-home-page")
  @ApiOperation({ summary: "Api for get course/listing/vendor homepage." })
  @ApiResponse({
    status: HttpStatus.OK,
    type: "",
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    type: "",
  })
  async getVendorHomePage(
    @Request() request,
    @Query() vendorHomePageDto: VendorHomePageDto
  ): Promise<IResponseToClient> {
    const data = await this.userService.getVendorHomePage(
      request.user,
      vendorHomePageDto
    );
    return {
      message: UserMessageSuccess.HomePageSuccessfully,
      data,
      statusCode: HttpStatus.OK,
    };
  }
}
