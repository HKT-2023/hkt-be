import { Body, Controller, HttpStatus, Post } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AuthService } from "src/modules/authentication/auth.service";
import {
  LoginDto,
  LoginResponseSuccess,
  LoginResponseWrongPassword,
} from "src/modules/authentication/dto/login.dto";
import { IResponseToClient } from "src/configs/response";
import {
  AuthMessageError,
  AuthMessageSuccess,
  Public,
} from "src/modules/authentication/auth.const";
import { LoginWithGoogleDto } from "src/modules/authentication/dto/login-with-google.dto";
import { LoginWithAppleDto } from "src/modules/authentication/dto/login-with-apple.dto";

@Controller("auth")
@ApiTags("Authentication")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @ApiOperation({
    summary: "Api for user to login.",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: AuthMessageSuccess.LoginSuccess,
    type: LoginResponseSuccess,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: AuthMessageError.WrongEmailOrPassword,
    type: LoginResponseWrongPassword,
  })
  @Public()
  async login(@Body() loginDto: LoginDto): Promise<IResponseToClient> {
    const result = await this.authService.login(
      loginDto.email,
      loginDto.password
    );
    return {
      message: AuthMessageSuccess.LoginSuccess,
      data: result,
      statusCode: HttpStatus.OK,
    };
  }

  @Post("/login-with-google")
  @Public()
  @ApiOperation({ summary: "Api for login with google" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: AuthMessageSuccess.LoginSuccess,
    type: LoginResponseSuccess,
  })
  async loginByGoogle(
    @Body() loginWithGoogleDto: LoginWithGoogleDto
  ): Promise<IResponseToClient> {
    const data = await this.authService.loginWithGoogle(
      loginWithGoogleDto.token,
      loginWithGoogleDto.clientId
    );
    return {
      message: AuthMessageSuccess.LoginSuccess,
      data,
      statusCode: HttpStatus.OK,
    };
  }

  @Post("/login-with-apple")
  @Public()
  @ApiOperation({ summary: "Api use for login with apple" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: AuthMessageSuccess.LoginSuccess,
    type: LoginResponseSuccess,
  })
  async loginWithApple(
    @Body() loginWithAppleDto: LoginWithAppleDto
  ): Promise<IResponseToClient> {
    const data = await this.authService.loginWithApple(
      loginWithAppleDto.token,
      loginWithAppleDto.nonce
    );
    return {
      message: AuthMessageSuccess.LoginSuccess,
      data,
      statusCode: HttpStatus.OK,
    };
  }
}
