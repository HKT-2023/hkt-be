import * as bcrypt from "bcrypt";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { UserRepository } from "src/models/repositories/user.repository";
import { InjectModel } from "@nestjs/mongoose";
import {
  User,
  UserDocument,
  UserSource,
  UserStatus,
} from "src/models/schemas/user.schema";
import { Model } from "mongoose";
import {
  CreateUserDto,
  UpdateUserDto,
} from "src/modules/user/dto/create-user.dto";
import { UserMessageError, TypeOfUser } from "src/modules/user/user.const";
import {
  CreateAgentDto,
  UpdateAgentDto,
} from "src/modules/user/dto/create-agent.dto";
import {
  CreateVendorDto,
  UpdateVendorDto,
} from "src/modules/user/dto/create-vendor.dto";
import {
  ListUserDto,
  ListUserDtoSort,
} from "src/modules/user/dto/list-user.dto";
import { AuthService } from "src/modules/authentication/auth.service";
import { randomNumber, randomString } from "src/utils/helper";
import { SendgridLib } from "src/libs/sendgrid.lib";
import { AuthMessageError } from "src/modules/authentication/auth.const";
import {
  VendorCategory,
  VendorCategoryDocument,
} from "src/models/schemas/vendor-category.schema";
import { VendorCategoryRepository } from "src/models/repositories/vendor-category.repository";

@Injectable()
export class UserService {
  private userRepository: UserRepository;
  private vendorCategoryRepository: VendorCategoryRepository;

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(VendorCategory.name)
    private readonly vendorCategoryModel: Model<VendorCategoryDocument>,
    private readonly sendgridLib: SendgridLib
  ) {
    this.userRepository = new UserRepository(this.userModel);
    this.vendorCategoryRepository = new VendorCategoryRepository(
      this.vendorCategoryModel
    );
  }

  private static async validateConfirmPassword(
    password: string,
    reEnterPassword: string
  ): Promise<void> {
    if (password !== reEnterPassword) {
      throw new HttpException(
        { message: UserMessageError.ReEnterPasswordNotMatch },
        HttpStatus.BAD_REQUEST
      );
    }

    const isAtLeastOneNumber = password.match(/^(?=.*\d).+$/);
    const isAtLeastOneUppercase = password.match(/^(?=.*[A-Z])/);
    const isAtLeastOneSpecial = password.match(
      /(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/
    );

    if (!isAtLeastOneNumber) {
      throw new HttpException(
        { message: UserMessageError.AtLeastOneNumber },
        HttpStatus.BAD_REQUEST
      );
    }

    if (password.length < 8) {
      throw new HttpException(
        { message: UserMessageError.WrongLengthPassword },
        HttpStatus.BAD_REQUEST
      );
    }

    if (!isAtLeastOneUppercase) {
      throw new HttpException(
        { message: UserMessageError.AtLeastOneUppercase },
        HttpStatus.BAD_REQUEST
      );
    }

    if (!isAtLeastOneSpecial) {
      throw new HttpException(
        { message: UserMessageError.AtLeastOneSpecial },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  private async getUserOrFailedByEmail(email: string): Promise<User> {
    const user = await this.userRepository.getUserByEmail(email);
    if (!user) {
      throw new HttpException(
        { message: UserMessageError.InvalidEmail },
        HttpStatus.BAD_REQUEST
      );
    }
    return user;
  }

  private async validateLicense(license: string): Promise<void> {
    const existLicense = await this.userRepository.getUserByLicense(license);
    if (existLicense) {
      throw new HttpException(
        { message: UserMessageError.LicenseHasExist },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  public async forgotPassword(email: string): Promise<boolean> {
    const user = await this.getUserOrFailedByEmail(email);
    if (user.status === UserStatus.InActive) {
      throw new HttpException(
        { message: AuthMessageError.AccountInactive },
        HttpStatus.BAD_REQUEST
      );
    }
    if (user.typeOfUser !== TypeOfUser.Admin) {
      throw new HttpException(
        { message: UserMessageError.InvalidEmail },
        HttpStatus.BAD_REQUEST
      );
    }
    user.code = randomNumber(Number(process.env.DEFAULT_CODE_LENGTH));
    user.invalidCodeTime = 0;
    user.expireCode =
      new Date().getTime() + Number(process.env.CODE_EXPIRE_TIME);
    user.updatedAt = new Date();
    await this.sendgridLib.sendMailResetPassword(
      `${user.firstName} ${user.lastName}`,
      user.email,
      user.code
    );
    await this.userRepository.save(user);
    return true;
  }

  public async validateCode(email: string, code: string): Promise<boolean> {
    const user = await this.getUserOrFailedByEmail(email);

    if (
      user.code !== code ||
      new Date().getTime() > user.expireCode ||
      user.invalidCodeTime > Number(process.env.CODE_INVALID_TIME)
    ) {
      user.invalidCodeTime += 1;
      await this.userRepository.save(user);
      throw new HttpException(
        { message: UserMessageError.InvalidCode },
        HttpStatus.BAD_REQUEST
      );
    }

    // Validate code success, so the code never expire util it used for reset password
    const addMoreTimeExpire = 111111111111; // add more 5 years
    user.expireCode = new Date().getTime() + addMoreTimeExpire;
    await this.userRepository.save(user);

    return true;
  }

  public async resetPassword(
    email: string,
    newPassword: string,
    confirmPassword: string,
    code: string
  ): Promise<boolean> {
    await UserService.validateConfirmPassword(newPassword, confirmPassword);
    await this.validateCode(email, code);
    const user = await this.getUserOrFailedByEmail(email);
    user.password = await bcrypt.hash(
      newPassword,
      Number(process.env.SALT_OR_ROUNDS)
    );
    user.expireCode = new Date().getTime() - 1;
    user.updatedAt = new Date();
    await this.userRepository.save(user);
    return true;
  }

  public async updateUser(
    updateUserDto: UpdateUserDto | UpdateAgentDto | UpdateVendorDto
  ): Promise<User> {
    const currentUser = await this.userRepository.getUserById(
      updateUserDto["userId"]
    );

    // check unique listAgentMlsId
    if (updateUserDto.listAgentMlsId) {
      const agentMlsId = await this.userRepository.getUserBylistAgentMlsId(
        updateUserDto.listAgentMlsId
      );

      if (agentMlsId && updateUserDto.userId !== agentMlsId?._id.toString()) {
        throw new HttpException(
          { message: UserMessageError.DuplicateListAgentMlsId },
          HttpStatus.BAD_REQUEST
        );
      }
    }

    if (!currentUser) {
      throw new HttpException(
        { message: UserMessageError.InvalidEmail },
        HttpStatus.BAD_REQUEST
      );
    }

    console.log(currentUser);

    if (
      currentUser.typeOfUser !== TypeOfUser.Admin &&
      currentUser.typeOfUser !== TypeOfUser.User &&
      updateUserDto["license"] &&
      updateUserDto["license"] !== currentUser.license
    ) {
      await this.validateLicense(updateUserDto["license"]);
    }

    const userUpdate = Object.assign(currentUser, updateUserDto);
    console.log(userUpdate);
    const userUpdated = await this.userRepository.save(userUpdate);
    userUpdated.password = "";
    return userUpdated;
  }

  public async createUser(
    createUserDto: CreateUserDto | CreateAgentDto | CreateVendorDto,
    typeOfUser: TypeOfUser
  ): Promise<User> {
    await UserService.validateConfirmPassword(
      createUserDto.password,
      createUserDto.password
    );
    const existUser = await this.userRepository.getUserByEmail(
      createUserDto.email
    );

    if (existUser) {
      throw new HttpException(
        { message: UserMessageError.UserHasExist },
        HttpStatus.BAD_REQUEST
      );
    }

    // check unique listAgentMlsId
    if (createUserDto.listAgentMlsId) {
      const agentMlsId = await this.userRepository.getUserBylistAgentMlsId(
        createUserDto.listAgentMlsId
      );

      if (agentMlsId) {
        throw new HttpException(
          { message: UserMessageError.DuplicateListAgentMlsId },
          HttpStatus.BAD_REQUEST
        );
      }
    }

    if (
      typeOfUser !== TypeOfUser.Admin &&
      typeOfUser !== TypeOfUser.User &&
      createUserDto["license"]
    ) {
      await this.validateLicense(createUserDto["license"]);
    }

    if (typeOfUser != TypeOfUser.KlaytnAgent && createUserDto["commission"]) {
      delete createUserDto["commission"];
    }

    const newUser = Object.assign(new User(), createUserDto);
    newUser.typeOfUser = typeOfUser;
    newUser.password = await bcrypt.hash(
      newUser.password,
      Number(process.env.SALT_OR_ROUNDS)
    );
    newUser.source = UserSource.CreatedByAdmin;
    const customerName =
      newUser.typeOfUser === TypeOfUser.Vendor
        ? newUser.businessName
        : `${newUser.firstName} ${newUser.lastName}`;
    const isMailSent = await this.sendgridLib.sendMailCreateAccount(
      customerName,
      newUser.email,
      createUserDto.password
    );
    if (!isMailSent) {
      throw new HttpException(
        { message: `There something error. Please try later.` },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    const userCreated = await this.userRepository.save(newUser);
    userCreated.password = "";
    return userCreated;
  }

  public async getListUser(
    listUserDto: ListUserDto,
    listUserDtoSort: ListUserDtoSort
  ): Promise<{ totalUser: number; users: User[] }> {
    const usersByConditions = await this.userRepository.getListUserByCondition(
      listUserDto,
      listUserDtoSort
    );
    const totalUserByConditions =
      await this.userRepository.countAllUserByCondition(listUserDto);
    return {
      users: usersByConditions,
      totalUser: totalUserByConditions,
    };
  }

  public async changeUserPassword(
    email: string,
    oldPass: string,
    newPassword: string,
    confirmPass: string
  ): Promise<boolean> {
    await UserService.validateConfirmPassword(newPassword, confirmPass);
    const user = await this.getUserOrFailedByEmail(email);

    await AuthService.checkPasswordMatch(
      oldPass,
      user.password,
      AuthMessageError.WrongPassword
    );
    user.password = await bcrypt.hash(
      newPassword,
      Number(process.env.SALT_OR_ROUNDS)
    );
    user.updatedAt = new Date();
    await this.userRepository.save(user);
    return true;
  }

  public async resetUserPassword(email: string): Promise<boolean> {
    const user = await this.getUserOrFailedByEmail(email);
    const passwordGenerated = randomString(
      Number(process.env.DEFAULT_PASSWORD_LENGTH)
    );
    user.password = await bcrypt.hash(
      passwordGenerated,
      Number(process.env.SALT_OR_ROUNDS)
    );
    user.updatedAt = new Date();
    await this.sendgridLib.sendMailResetPassword(
      `${user.firstName} ${user.lastName}`,
      email,
      passwordGenerated
    );
    await this.userRepository.save(user);
    return true;
  }

  public async getUserInformation(email: string): Promise<User> {
    return this.userRepository.getUserByEmail(email, ["-password", "-code"]);
  }

  public async getUserInformationByUserId(userId: string): Promise<User> {
    const user = await this.userRepository.getUserById(userId, [
      "-password",
      "-code",
    ]);

    const dateResult = [];
    const vendorTypes = user.vendorType;
    for (const vendorCateId of vendorTypes) {
      // get vendor category
      const vendorCategory =
        await this.vendorCategoryRepository.getVendorCategoryById(vendorCateId);
      if (!vendorCategory) continue;
      dateResult.push({
        _id: vendorCateId,
        name: vendorCategory.name,
      });
    }

    user.vendorType = dateResult;
    return user;
  }

  public async deleteUser(userId: string): Promise<boolean> {
    await this.userRepository.deleteUser(userId);
    return true;
  }

  public async getUserbyAttribute(
    attribute: string,
    value: any
  ): Promise<User[]> {
    return this.userModel.find({ listAgentMlsId: value });
  }
}
