import { OAuth2Client } from "google-auth-library";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { JwtService } from "@nestjs/jwt";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { UserRepository } from "src/models/repositories/user.repository";
import { InjectModel } from "@nestjs/mongoose";
import {
  User,
  UserDocument,
  UserSource,
  UserStatus,
} from "src/models/schemas/user.schema";
import { TypeOfUser } from "src/modules/user/user.const";
import { Model } from "mongoose";
import { AuthMessageError } from "src/modules/authentication/auth.const";
import { ILoginResponse } from "src/modules/authentication/auth.interface";
import appleSignin, { AppleIdTokenType } from "apple-signin-auth";
import { TokenPayload } from "google-auth-library/build/src/auth/loginticket";

@Injectable()
export class AuthService {
  private userRepository: UserRepository;

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private jwtService: JwtService
  ) {
    this.userRepository = new UserRepository(this.userModel);
  }

  public async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userRepository.getUserByEmail(email);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  public static async checkPasswordMatch(
    password: string,
    hashPassword: string,
    errorMessage: string
  ): Promise<void> {
    const isMatchPassword = await bcrypt.compare(password, hashPassword);
    if (!isMatchPassword) {
      throw new HttpException(
        { message: errorMessage },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  private static async getUserInfoFromGoogleToken(
    token: string,
    clientId: string
  ): Promise<TokenPayload> {
    try {
      const client: OAuth2Client = new OAuth2Client(clientId);
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: clientId,
      });
      return ticket.getPayload();
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  private static async getUserInfoFromAppleToken(
    token: string,
    nonce: string
  ): Promise<AppleIdTokenType> {
    try {
      return await appleSignin.verifyIdToken(token, {
        // NOSONAR
        nonce: nonce
          ? crypto.createHash("sha256").update(nonce).digest("hex") // NOSONAR
          : undefined,
      });
    } catch (error) {
      return undefined;
    }
  }

  public async login(email: string, password: string): Promise<ILoginResponse> {
    const user = await this.userRepository.getUserByEmail(email);

    if (!user || user.typeOfUser === TypeOfUser.Admin) {
      throw new HttpException(
        { message: AuthMessageError.WrongEmailOrPassword },
        HttpStatus.BAD_REQUEST
      );
    }

    if (user.status === UserStatus.InActive) {
      throw new HttpException(
        { message: AuthMessageError.AccountInactive },
        HttpStatus.BAD_REQUEST
      );
    }

    await AuthService.checkPasswordMatch(
      password,
      user.password,
      AuthMessageError.WrongEmailOrPassword
    );
    const accessToken = this.jwtService.sign({
      id: user._id,
      email: user.email,
      typeOfUser: user.typeOfUser,
    });

    return {
      accessToken,
      role: user.typeOfUser,
      userId: user._id,
      source: UserSource.CreatedByAdmin,
    };
  }

  public async loginWithGoogle(
    googleToken: string,
    clientId: string
  ): Promise<ILoginResponse> {
    const userInfoFromGoogleToken =
      await AuthService.getUserInfoFromGoogleToken(googleToken, clientId);

    if (!userInfoFromGoogleToken) {
      throw new HttpException(
        { message: AuthMessageError.InvalidToken },
        HttpStatus.BAD_REQUEST
      );
    }

    const user = await this.userRepository.getUserByEmail(
      userInfoFromGoogleToken.email
    );

    if (user) {
      if (user.status === UserStatus.InActive) {
        throw new HttpException(
          { message: AuthMessageError.AccountInactive },
          HttpStatus.BAD_REQUEST
        );
      }

      return {
        accessToken: this.jwtService.sign({
          id: user._id,
          email: user.email,
          typeOfUser: user.typeOfUser,
        }),
        role: user.typeOfUser,
        userId: user._id,
        source: UserSource.Google,
      };
    }

    const newUser = new User();
    newUser.typeOfUser = TypeOfUser.User;
    newUser.email = userInfoFromGoogleToken.email;
    newUser.firstName = userInfoFromGoogleToken.given_name;
    newUser.lastName = userInfoFromGoogleToken.family_name;
    newUser.avatarUrl = userInfoFromGoogleToken.picture;
    newUser.status = UserStatus.Active;
    newUser.source = UserSource.Google;

    const newUserCreated = await this.userRepository.save(newUser);

    const accessToken = this.jwtService.sign({
      id: newUserCreated._id,
      email: newUserCreated.email,
      typeOfUser: newUserCreated.typeOfUser,
    });
    return {
      userId: newUserCreated._id,
      role: newUserCreated.typeOfUser,
      accessToken,
      source: UserSource.Google,
    };
  }

  public async loginWithApple(
    token: string,
    nonce: string
  ): Promise<ILoginResponse> {
    const userInfoFromApple = await AuthService.getUserInfoFromAppleToken(
      token,
      nonce
    );

    if (!userInfoFromApple) {
      throw new HttpException(
        { message: AuthMessageError.InvalidToken },
        HttpStatus.BAD_REQUEST
      );
    }

    const user = await this.userRepository.getUserByEmail(
      userInfoFromApple.email
    );

    if (user) {
      if (user.status === UserStatus.InActive) {
        throw new HttpException(
          { message: AuthMessageError.AccountInactive },
          HttpStatus.BAD_REQUEST
        );
      }

      return {
        userId: user._id,
        role: user.typeOfUser,
        accessToken: this.jwtService.sign({
          id: user._id,
          email: user.email,
          typeOfUser: user.typeOfUser,
        }),
        source: UserSource.Apple,
      };
    }

    const newUser = new User();
    newUser.typeOfUser = TypeOfUser.User;
    newUser.email = userInfoFromApple.email;
    newUser.status = UserStatus.Active;
    newUser.source = UserSource.Apple;

    const newUserCreated = await this.userRepository.save(newUser);
    const accessToken = this.jwtService.sign({
      id: newUserCreated._id,
      email: newUserCreated.email,
      typeOfUser: newUserCreated.typeOfUser,
    });

    return {
      userId: newUserCreated._id,
      role: newUserCreated.typeOfUser,
      accessToken: accessToken,
      source: UserSource.Apple,
    };
  }
}
