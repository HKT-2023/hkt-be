import { Body, Controller, HttpStatus, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthService } from "src/modules/authentication/auth.service";
import { LoginDto } from "src/modules/authentication/dto/login.dto";
import { IResponseToClient } from "src/configs/response";
import {
  AuthMessageSuccess,
  Public,
} from "src/modules/authentication/auth.const";

@Controller("auth")
@ApiTags("Authentication")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
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
}
