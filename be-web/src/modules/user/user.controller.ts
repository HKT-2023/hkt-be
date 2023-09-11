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
import {
  CreateUserDto,
  CreateUserSuccess,
  DeleteUserDto,
  UpdateUserDto,
  UserHasExistResponse,
} from "src/modules/user/dto/create-user.dto";
import { IResponseToClient } from "src/configs/response";
import { UserMessageSuccess, TypeOfUser } from "src/modules/user/user.const";
import {
  CreateAgentDto,
  CreateAgentSuccess,
  UpdateAgentDto,
} from "src/modules/user/dto/create-agent.dto";
import {
  CreateVendorDto,
  CreateVendorSuccess,
  UpdateVendorDto,
} from "src/modules/user/dto/create-vendor.dto";
import {
  ListUserDto,
  ListUserDtoSort,
  ListUserSuccess,
} from "src/modules/user/dto/list-user.dto";
import { Public, Roles } from "src/modules/authentication/auth.const";
import {
  ChangePasswordDto,
  ChangePasswordFailed,
  ChangePasswordSuccess,
} from "src/modules/user/dto/change-password.dto";
import {
  ResetUserPasswordDto,
  ResetUserPasswordSuccess,
} from "src/modules/user/dto/reset-user-password.dto";
import {
  ForgotPasswordDto,
  ForgotPasswordDtoResponseFailed,
  ForgotPasswordDtoResponseSuccess,
} from "src/modules/user/dto/forgot-password.dto";
import {
  ValidateCodeDto,
  ValidateCodeInvalid,
  ValidateCodeSuccess,
} from "src/modules/user/dto/validate-code.dto";
import {
  ResetPasswordDto,
  ResetPasswordDtoResponseFailed1,
  ResetPasswordDtoResponseFailed2,
  ResetPasswordDtoResponseSuccess,
} from "src/modules/user/dto/reset-password.dto";
import { DetailUserDto } from "src/modules/user/dto/detail-user.dto";

@Controller("user")
@ApiTags("User Management")
@ApiBearerAuth()
@Roles(TypeOfUser.Admin)
export class UserController {
  constructor(private readonly userService: UserService) {}

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

  @Post("create-user")
  @ApiOperation({ summary: "Api for create normal user." })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateUserSuccess,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    type: UserHasExistResponse,
  })
  async createUser(
    @Body() createUserDto: CreateUserDto
  ): Promise<IResponseToClient> {
    const userCreated = await this.userService.createUser(
      createUserDto,
      createUserDto.typeOfUser
    );
    return {
      message: UserMessageSuccess.UserCreated,
      data: userCreated,
      statusCode: HttpStatus.CREATED,
    };
  }

  @Put("update-user")
  @ApiOperation({ summary: "Api for update normal user." })
  @ApiResponse({
    status: HttpStatus.OK,
    type: CreateUserSuccess,
  })
  async updateUser(
    @Body() updateUserDto: UpdateUserDto
  ): Promise<IResponseToClient> {
    const userUpdated = await this.userService.updateUser(updateUserDto);
    return {
      message: UserMessageSuccess.UpdateUserSuccess,
      data: userUpdated,
      statusCode: HttpStatus.OK,
    };
  }

  @Post("create-user-agent")
  @ApiOperation({ summary: "Api for create agent user." })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateAgentSuccess,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    type: UserHasExistResponse,
  })
  async createUserAgent(
    @Body() createAgentDto: CreateAgentDto
  ): Promise<IResponseToClient> {
    const userCreated = await this.userService.createUser(
      createAgentDto,
      createAgentDto.typeOfUser
    );
    return {
      message: UserMessageSuccess.UserCreated,
      data: userCreated,
      statusCode: HttpStatus.CREATED,
    };
  }

  @Put("update-user-agent")
  @ApiOperation({ summary: "Api for update agent user." })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateAgentSuccess,
  })
  async updateUserAgent(
    @Body() updateAgentDto: UpdateAgentDto
  ): Promise<IResponseToClient> {
    const userUpdated = await this.userService.updateUser(updateAgentDto);
    return {
      message: UserMessageSuccess.UpdateUserSuccess,
      data: userUpdated,
      statusCode: HttpStatus.OK,
    };
  }

  @Post("create-user-vendor")
  @ApiOperation({ summary: "Api for create vendor user." })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateVendorSuccess,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    type: UserHasExistResponse,
  })
  async createUserVendor(
    @Body() createVendorDto: CreateVendorDto
  ): Promise<IResponseToClient> {
    const userCreated = await this.userService.createUser(
      createVendorDto,
      TypeOfUser.Vendor
    );
    return {
      message: UserMessageSuccess.UserCreated,
      data: userCreated,
      statusCode: HttpStatus.CREATED,
    };
  }

  @Put("update-user-vendor")
  @ApiOperation({ summary: "Api for update vendor user." })
  @ApiResponse({
    status: HttpStatus.OK,
    type: CreateVendorSuccess,
  })
  async updateUserVendor(
    @Body() updateVendorDto: UpdateVendorDto
  ): Promise<IResponseToClient> {
    const userUpdated = await this.userService.updateUser(updateVendorDto);
    return {
      message: UserMessageSuccess.UpdateUserSuccess,
      data: userUpdated,
      statusCode: HttpStatus.OK,
    };
  }

  @Get("list-user")
  @ApiOperation({ summary: "Api for get list of user." })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ListUserSuccess,
  })
  async listUser(
    @Query() listUserDto: ListUserDto,
    @Query() listUserDtoSort: ListUserDtoSort
  ): Promise<IResponseToClient> {
    const data = await this.userService.getListUser(
      listUserDto,
      listUserDtoSort
    );
    return {
      message: UserMessageSuccess.ListUserSuccessfully,
      data: data.users,
      statusCode: HttpStatus.OK,
      metadata: {
        page: listUserDto.page,
        limit: listUserDto.limit,
        currentPage: listUserDto.page,
        count: data.users.length,
        total: data.totalUser,
      },
    };
  }

  @Put("change-password")
  @ApiOperation({ summary: "Api for change password." })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ChangePasswordSuccess,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ChangePasswordFailed,
  })
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

  @Put("reset-user-password/:userEmail")
  @ApiOperation({ summary: "Api for admin to reset user password." })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ResetUserPasswordSuccess,
  })
  async resetUserPassword(
    @Param() resetPasswordDto: ResetUserPasswordDto
  ): Promise<IResponseToClient> {
    const result = await this.userService.resetUserPassword(
      resetPasswordDto.userEmail
    );
    return {
      message: UserMessageSuccess.ResetPasswordSuccessfully,
      data: result,
      statusCode: HttpStatus.OK,
    };
  }

  @Get("information")
  @ApiOperation({ summary: "Api for get information." })
  async viewUserInformation(
    @Request() request,
    @Query() detailUserDto: DetailUserDto
  ): Promise<IResponseToClient> {
    const result = detailUserDto.userId
      ? await this.userService.getUserInformationByUserId(detailUserDto.userId)
      : await this.userService.getUserInformation(request.user.email);
    return {
      message: UserMessageSuccess.GetUserInfoSuccessfully,
      data: result,
      statusCode: HttpStatus.OK,
    };
  }

  @Post("/delete-user")
  async deleteUser(@Body() deleteUserDto: DeleteUserDto): Promise<boolean> {
    return this.userService.deleteUser(deleteUserDto.userId);
  }
}
