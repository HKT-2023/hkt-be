import * as crypto from "crypto";
import * as bcrypt from "bcrypt";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { UserRepository } from "src/models/repositories/user.repository";
import {
  User,
  UserDocument,
  UserSource,
  UserStatus,
} from "src/models/schemas/user.schema";
import {
  UserMessageError,
  TypeOfUser,
  PAGE,
  LIMIT,
} from "src/modules/user/user.const";
import { AuthService } from "src/modules/authentication/auth.service";
import { SendgridLib } from "src/libs/sendgrid.lib";
import { isDevelopment, isProduction, randomNumber } from "src/utils/helper";
import { UpdateUserDto } from "src/modules/user/dto/update-user.dto";
import { UpdateAgentDto } from "src/modules/user/dto/update-agent.dto";
import { UpdateVendorDto } from "src/modules/user/dto/update-vendor.dto";
import { AuthMessageError } from "src/modules/authentication/auth.const";
import {
  PointType,
  UserPoint,
  UserPointDocument,
} from "src/models/schemas/user-point.schema";
import { UserPointRepository } from "src/models/repositories/user-point.repository";
import {
  IRankingPoint,
  IUserRankingPoint,
} from "src/modules/user/user.interface";
import {
  UserAccuracyEstimations,
  UserAccuracyEstimationsDocument,
} from "src/models/schemas/user-accuracy-estimations.schema";
import { UserAccuracyEstimationsRepository } from "src/models/repositories/user-accuracy-estimations.repository";
import { TwilioLib } from "src/libs/twilio.lib";
import { VerifyOTPDto } from "src/modules/user/dto/validate-otp.dto";
import { Course, CourseDocument } from "src/models/schemas/course.schema";
import { mappingParams } from "src/modules/listing/data/mapping-data";
import { CourseRepository } from "src/models/repositories/course.repository";
import { BrideLib } from "src/libs/bride.lib";
import { VendorHomePageDto } from "src/modules/user/dto/vendor-homepage.dto";
import { AgentHomePageDto } from "src/modules/user/dto/agent-homepage.dto";
import { UserHomePageDto } from "src/modules/user/dto/user-homepage.dto";
import { NftRepository } from "src/models/repositories/nft.repository";
import { Nft, NftDocument, NFTType } from "src/models/schemas/nft.schema";
import { UserCourseRepository } from "src/models/repositories/user-course.repository";
import {
  UserCourse,
  UserCourseDocument,
} from "src/models/schemas/user-course.schema";
import { VendorCategoryRepository } from "src/models/repositories/vendor-category.repository";
import {
  VendorCategory,
  VendorCategoryDocument,
} from "src/models/schemas/vendor-category.schema";
import { ReviewRepository } from "src/models/repositories/review.repository";
import { Review, ReviewDocument } from "src/models/schemas/review.schema";
import { Favorite, FavoriteDocument } from "src/models/schemas/favorite.schema";
import { FavoriteRepository } from "src/models/repositories/favorite.repository";
import {
  MappingSellingConfigType,
  NftSellingConfig,
  NftSellingConfigDocument,
} from "src/models/schemas/nft-selling-configs.schema";
import { NftSellingConfigsRepository } from "src/models/repositories/nft-selling-configs.repository";

@Injectable()
export class UserService {
  private userRepository: UserRepository;
  private courseRepository: CourseRepository;
  private userCourseRepository: UserCourseRepository;
  private userPointRepository: UserPointRepository;
  private nftRepository: NftRepository;
  private vendorCategoryRepository: VendorCategoryRepository;
  private userAccuracyEstimationsRepository: UserAccuracyEstimationsRepository;
  private readonly brideLib: BrideLib;
  private reviewRepository: ReviewRepository;
  private readonly favoriteRepository: FavoriteRepository;
  private readonly nftSellingConfigsRepository: NftSellingConfigsRepository;

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(UserPoint.name)
    private readonly userPointModel: Model<UserPointDocument>,
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
    @InjectModel(UserCourse.name)
    private readonly userCourseModel: Model<UserCourseDocument>,
    @InjectModel(Nft.name)
    private readonly nftModel: Model<NftDocument>,
    @InjectModel(VendorCategory.name)
    private readonly vendorCategoryModel: Model<VendorCategoryDocument>,
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
    @InjectModel(Favorite.name)
    private readonly favoriteModel: Model<FavoriteDocument>,
    @InjectModel(UserAccuracyEstimations.name)
    private readonly userAccuracyEstimationsModel: Model<UserAccuracyEstimationsDocument>,
    @InjectModel(NftSellingConfig.name)
    private readonly nftSellingConfigModel: Model<NftSellingConfigDocument>,
    private readonly sendgridLib: SendgridLib,
    private readonly twilioLib: TwilioLib,
    private readonly httpService: HttpService
  ) {
    this.userRepository = new UserRepository(this.userModel);
    this.nftRepository = new NftRepository(this.nftModel);
    this.userPointRepository = new UserPointRepository(this.userPointModel);
    this.userAccuracyEstimationsRepository =
      new UserAccuracyEstimationsRepository(this.userAccuracyEstimationsModel);
    this.courseRepository = new CourseRepository(this.courseModel);
    this.userCourseRepository = new UserCourseRepository(this.userCourseModel);
    this.vendorCategoryRepository = new VendorCategoryRepository(
      this.vendorCategoryModel
    );
    this.reviewRepository = new ReviewRepository(this.reviewModel);
    this.favoriteRepository = new FavoriteRepository(this.favoriteModel);
    this.brideLib = new BrideLib(this.httpService);
    this.nftSellingConfigsRepository = new NftSellingConfigsRepository(
      this.nftSellingConfigModel
    );
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
        HttpStatus.NOT_FOUND
      );
    }

    return user;
  }

  private async mappingRankingPointToUser(
    rankingPoints: IRankingPoint[]
  ): Promise<IUserRankingPoint[]> {
    const mappingResult = [];
    if (!rankingPoints || rankingPoints.length === 0) return mappingResult;

    const listUserId = rankingPoints.map((ranking) => ranking.userId);
    const listUserByIds = await this.userRepository.getListUserByIds(
      listUserId
    );

    for (const ranking of rankingPoints) {
      const matchingUser = listUserByIds.find(
        (user) => user._id.toString() === ranking.userId
      );
      if (!matchingUser) continue;
      mappingResult.push({
        ...ranking,
        userImage: matchingUser.avatarUrl,
        userName: `${matchingUser.firstName} ${matchingUser.lastName}`,
      });
    }

    return mappingResult;
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
      UserMessageError.WrongPassword
    );
    user.password = await bcrypt.hash(
      newPassword,
      Number(process.env.SALT_OR_ROUNDS)
    );
    user.updatedAt = new Date();
    await this.userRepository.save(user);
    return true;
  }

  public async getUserInformation(email: string): Promise<User> {
    return this.getUserOrFailedByEmail(email);
  }

  public async forgotPassword(email: string): Promise<boolean> {
    const user = await this.getUserOrFailedByEmail(email);
    if (user.source === UserSource.Google || user.source === UserSource.Apple) {
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
      email,
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
      user.invalidCodeTime >= Number(process.env.CODE_INVALID_TIME)
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

  public async getAuthHash(userId: string): Promise<{ hex: string }> {
    const hmac = crypto.createHmac(
      process.env.ONESIGNAL_ALGORITHM,
      process.env.ONESIGNAL_APP_KEY
    );
    hmac.update(userId);
    return { hex: hmac.digest("hex") };
  }

  public async updateUser(
    updateUser: UpdateUserDto | UpdateAgentDto | UpdateVendorDto,
    user: User
  ): Promise<User> {
    const existUser = await this.userRepository.getUserByEmail(user.email);
    if (existUser.typeOfUser === TypeOfUser.Admin) {
      throw new HttpException(
        { message: UserMessageError.AdminCanNotUserThisApi },
        HttpStatus.NOT_ACCEPTABLE
      );
    }
    if (updateUser["license"] && updateUser["license"] !== existUser.license) {
      await this.validateLicense(updateUser["license"]);
    }
    const userUpdated = Object.assign(existUser, updateUser);
    return this.userRepository.save(userUpdated);
  }

  public async viewUserPoint(userId: string): Promise<number> {
    const userPoint = await this.userPointRepository.getPointByUserId(userId);
    return userPoint ? userPoint.point : 0;
  }

  public async userViewPoint(
    userId: string
  ): Promise<{ client: number; referral: number; agent: number }> {
    const userNFTPointByNFTType =
      await this.nftRepository.getUserPointByNFTType(userId);
    const dataReturn = {
      client: 0,
      referral: 0,
      agent: 0,
    };

    for (const nftPoint of userNFTPointByNFTType) {
      if (nftPoint.nftType === NFTType.Agent) {
        dataReturn.agent += nftPoint.point;
        continue;
      }
      if (nftPoint.nftType === NFTType.Referral) {
        dataReturn.referral += nftPoint.point;
        continue;
      }
      dataReturn.client += nftPoint.point;
    }
    return dataReturn;
  }

  public async viewLeaderBoard(
    userId: string,
    pointType: PointType
  ): Promise<{
    myRanking: number;
    myEstimateAccuracy: number;
    myTotalPoints: number;
    totalUser: number;
  }> {
    const userPointRanking =
      await this.userPointRepository.getRankingPointByUserId(userId, pointType);
    const userAccuracy =
      await this.userAccuracyEstimationsRepository.getUserAccuracyByUserId(
        userId
      );

    const totalUser = await this.userPointRepository.countTotalRankPoint(
      pointType
    );

    return {
      myRanking: userPointRanking.length > 0 ? userPointRanking[0].rank : null,
      myTotalPoints:
        userPointRanking.length > 0 ? userPointRanking[0].point : 0,
      myEstimateAccuracy: userAccuracy ? userAccuracy.currentPercent : 0,
      totalUser: totalUser,
    };
  }

  public async viewOtherLeaderBoard(
    page: number,
    limit: number,
    pointType: PointType
  ): Promise<{
    data: IUserRankingPoint[];
    total: number;
  }> {
    const otherRankingPoint =
      await this.userPointRepository.getOtherLeaderBoard(
        page,
        limit,
        pointType
      );
    const userRankingMapped = await this.mappingRankingPointToUser(
      otherRankingPoint
    );
    const totalRankingPoint =
      await this.userPointRepository.countTotalRankPoint(pointType);

    return {
      data: userRankingMapped,
      total: totalRankingPoint,
    };
  }

  public async setup2fa(userId: string, phone: string): Promise<boolean> {
    const existsUser = await this.userRepository.getUserByPhone(phone);

    if (existsUser) {
      throw new HttpException(
        { message: UserMessageError.ExistPhone },
        HttpStatus.BAD_REQUEST
      );
    }

    const user = await this.userRepository.getUserById(userId);

    if (user.typeOfUser === TypeOfUser.Admin) {
      throw new HttpException(
        { message: UserMessageError.InvalidPhone },
        HttpStatus.BAD_REQUEST
      );
    }
    if (user.status === UserStatus.InActive) {
      throw new HttpException(
        { message: AuthMessageError.AccountInactive },
        HttpStatus.BAD_REQUEST
      );
    }

    if (new Date().getTime() <= user.blockPhoneTime) {
      throw new HttpException(
        {
          data: {
            blockPhoneTime: user.blockPhoneTime,
            invalidPhoneCodeTime: user.invalidPhoneCodeTime,
          },
          message: UserMessageError.DeviceLocked,
        },
        HttpStatus.BAD_REQUEST
      );
    }
    user.phoneVerify = phone;
    user.phoneCode = randomNumber(Number(process.env.DEFAULT_CODE_LENGTH));
    user.invalidPhoneCodeTime = 0;
    user.expirePhoneCode =
      new Date().getTime() + Number(process.env.CODE_EXPIRE_TIME);
    user.updatedAt = new Date();
    user.isVerifyPhone = false;
    user.blockPhoneTime = null;

    await this.twilioLib.sendSMSCode(phone, user.phoneCode);

    await this.userRepository.save(user);
    return true;
  }

  public async sendOtp(userId: string): Promise<boolean> {
    const user = await this.userRepository.getUserById(userId);
    if (user.typeOfUser === TypeOfUser.Admin) {
      throw new HttpException(
        { message: UserMessageError.InvalidPhone },
        HttpStatus.BAD_REQUEST
      );
    }

    if (user.status === UserStatus.InActive) {
      throw new HttpException(
        { message: AuthMessageError.AccountInactive },
        HttpStatus.BAD_REQUEST
      );
    }

    if (!user.isVerifyPhone) {
      throw new HttpException(
        { message: UserMessageError.NotVerifyPhone },
        HttpStatus.BAD_REQUEST
      );
    }

    if (new Date().getTime() <= user.blockPhoneTime) {
      throw new HttpException(
        {
          data: {
            blockPhoneTime: user.blockPhoneTime,
            invalidPhoneCodeTime: user.invalidPhoneCodeTime,
          },
          message: UserMessageError.DeviceLocked,
        },
        HttpStatus.BAD_REQUEST
      );
    }

    user.phoneCode = randomNumber(Number(process.env.DEFAULT_CODE_LENGTH));
    user.invalidPhoneCodeTime = 0;
    user.expirePhoneCode =
      new Date().getTime() + Number(process.env.CODE_EXPIRE_TIME);
    user.blockPhoneTime = null;

    await this.twilioLib.sendSMSCode(user.phoneVerify, user.phoneCode);
    await this.userRepository.save(user);
    return true;
  }

  public async validatePhoneCode(
    userId: string,
    phone: string,
    phoneCode: string
  ): Promise<boolean> {
    const user = await this.userRepository.getUserById(userId);

    if (user.phoneVerify !== phone) {
      throw new HttpException(
        { message: UserMessageError.InvalidCode },
        HttpStatus.BAD_REQUEST
      );
    }

    if (
      (user.phoneCode !== phoneCode &&
        phoneCode !== process.env.DEFAULT_CODE &&
        isDevelopment()) ||
      (user.phoneCode !== phoneCode && isProduction()) ||
      new Date().getTime() > user.expirePhoneCode
    ) {
      const invalidPhoneCodeTime = user.invalidPhoneCodeTime + 1;
      if (invalidPhoneCodeTime > Number(process.env.CODE_INVALID_TIME)) {
        const currentTime = new Date().getTime();
        const blockPhoneTime = !user.blockPhoneTime
          ? currentTime + +process.env.MINUTES_BLOCK * 60 * 1000
          : user.blockPhoneTime;
        user.blockPhoneTime = blockPhoneTime;

        await this.userRepository.save(user);

        throw new HttpException(
          {
            data: {
              blockPhoneTime,
              invalidPhoneCodeTime,
            },
            message: UserMessageError.DeviceLocked,
          },
          HttpStatus.BAD_REQUEST
        );
      }

      user.invalidPhoneCodeTime = invalidPhoneCodeTime;

      await this.userRepository.save(user);

      throw new HttpException(
        {
          data: {
            blockPhoneTime: null,
            invalidPhoneCodeTime,
          },
          message: UserMessageError.InvalidCode,
        },
        HttpStatus.BAD_REQUEST
      );
    }

    user.phoneCode = null;
    user.isVerifyPhone = true;
    await this.userRepository.save(user);

    return true;
  }

  public async verifyOtp(
    userId: string,
    verifyOTPDto: VerifyOTPDto
  ): Promise<boolean> {
    const user = await this.userRepository.getUserById(userId);

    if (
      (user.phoneCode !== verifyOTPDto.otpCode &&
        verifyOTPDto.otpCode !== process.env.DEFAULT_CODE &&
        isDevelopment()) ||
      (user.phoneCode !== verifyOTPDto.otpCode && isProduction()) ||
      new Date().getTime() > user.expirePhoneCode
    ) {
      const invalidPhoneCodeTime = user.invalidPhoneCodeTime + 1;
      if (invalidPhoneCodeTime > Number(process.env.CODE_INVALID_TIME)) {
        const currentTime = new Date().getTime();
        const blockPhoneTime = !user.blockPhoneTime
          ? currentTime + +process.env.MINUTES_BLOCK * 60 * 1000
          : user.blockPhoneTime;
        user.blockPhoneTime = blockPhoneTime;
        user.invalidPhoneCodeTime = invalidPhoneCodeTime;

        await this.userRepository.save(user);

        throw new HttpException(
          {
            data: {
              blockPhoneTime,
              invalidPhoneCodeTime,
            },
            message: UserMessageError.DeviceLocked,
          },
          HttpStatus.BAD_REQUEST
        );
      }

      user.invalidPhoneCodeTime = invalidPhoneCodeTime;

      await this.userRepository.save(user);

      throw new HttpException(
        {
          data: {
            blockPhoneTime: null,
            invalidPhoneCodeTime,
          },
          message: UserMessageError.InvalidCode,
        },
        HttpStatus.BAD_REQUEST
      );
    }

    user.phoneCode = null;
    user.isVerifyPhone = true;
    await this.userRepository.save(user);

    return true;
  }

  private async _handleVendorCategory(query: any) {
    const sort = { sortCreatedAt: "-1" };
    query.status = "Active";
    return this.vendorCategoryRepository.getListByCondition(query, sort, [
      "_id",
      "name",
      "thumbnail",
      "status",
    ]);
  }

  public getRecommendFieldToSearch(favorites: Favorite[]): any {
    const numberOfBaths = favorites.map((item) => {
      return item.numberOfBaths;
    });

    const numberOfBeds = favorites.map((item) => {
      return item.numberOfBeds;
    });

    const prices = favorites.map((item) => {
      return item.price;
    });

    return {
      numberOfBaths: numberOfBaths.toString(),
      numberOfBeds: numberOfBeds.toString(),
      price: prices.toString(),
    };
  }

  private async _handleListings(userId: string, userHomePageDto: any) {
    userHomePageDto.fields =
      "id,propertySubType,propertyType,city,price,photo,price";

    let filterArr = {};

    // get favorite listing
    const favorites = await this.favoriteRepository.getFavoriteByUserId(userId);
    filterArr = this.getRecommendFieldToSearch(favorites);

    const queryParams = mappingParams({
      ...filterArr,
      limit: LIMIT,
      page: PAGE,
    });
    return this.brideLib.getListingByQueryParams(queryParams);
  }

  private async _handleListCourse(userId: string, query: any) {
    const sort = { sortCreatedAt: "-1" };
    const courses = await this.courseRepository.getListByCondition(
      query,
      sort,
      [
        "_id",
        "name",
        "type",
        "thumbnail",
        "createdAt",
        "updatedAt",
        "userType",
        "author",
        "video",
        "duration",
        "page",
        "token",
      ]
    );
    const resultData = [];
    for (const course of courses) {
      const userCourse =
        await this.userCourseRepository.getUserCourseByCourseId(
          userId,
          course._id
        );

      resultData.push({
        _id: course._id,
        name: course.name,
        type: course.type,
        page: course.page,
        author: course?.author || null,
        video: course.video,
        token: course.token,
        duration: course.duration,
        thumbnail: course.thumbnail,
        userType: course.userType,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        userCourse: userCourse || null,
      });
    }
    return resultData;
  }

  private async _handleNft(userId: string, query: any) {
    query.sortByCreatedAt = "ASC";
    query.limit = LIMIT;
    query.page = PAGE;
    const data = await this.nftRepository.getNFTMarketPlace(query, userId);
    const listNFTIds = data.data.map((NFT) => {
      return NFT._id;
    });

    const sellingConfigs =
      await this.nftSellingConfigsRepository.getListConfigActiveByNftIds(
        listNFTIds
      );

    for (const nft of data.data) {
      const sellingConfig = sellingConfigs.find(
        (e) => e.nftId === nft._id.toString()
      );
      nft.salesType = {
        key: sellingConfig?.type,
        title: MappingSellingConfigType[sellingConfig?.type],
      };
      nft.sellingConfigId = sellingConfig?._id;
    }
    return data.data;
  }

  private async _handleReview(query: any) {
    const sort = { sortCreatedAt: "-1" };

    const reviews = await this.reviewRepository.getReviewByHome(query, sort);

    const resultData = [];

    for (const review of reviews) {
      query.limit = LIMIT;
      query.page = PAGE;
      query.parentId = review._id.toString();
      query.vendorCateId = review.vendorCateId;
      const subReviews = await this.reviewRepository.getReviewByVendorId(
        query,
        sort,
        ["_id", "comment", "createdAt", "updatedAt", "parentId", "userId"]
      );

      const totalSubReviews = await this.reviewRepository.countReviewByVendorId(
        review.vendorCateId,
        review.vendorId,
        review._id
      );

      const subReviewResult = [];
      for (const subReview of subReviews) {
        const subUser = await this.userRepository.getUserById(subReview.userId);

        let subFullName = null;
        if (subUser) subFullName = `${subUser.firstName} ${subUser.lastName}`;
        if (subUser && subUser.typeOfUser === TypeOfUser.Vendor)
          subFullName = subUser.businessName;

        subReviewResult.push({
          _id: subReview._id,
          comment: subReview.comment,
          userInfo: {
            avatarUrl: subUser?.avatarUrl,
            fullName: subFullName,
          },
          createdAt: subReview.createdAt,
          updatedAt: subReview.updatedAt,
          parentId: subReview.parentId,
        });
      }

      const user = await this.userRepository.getUserById(review.userId);

      let fullName = null;
      if (user) fullName = `${user.firstName} ${user.lastName}`;
      if (user && user.typeOfUser === TypeOfUser.Vendor)
        fullName = user.businessName;

      resultData.push({
        _id: review._id,
        comment: review.comment,
        userInfo: {
          avatarUrl: user?.avatarUrl,
          fullName,
        },
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        subReviews: subReviewResult,
        totalSubReviews,
        vendorId: review?.vendorId,
        vendorCateId: review?.vendorCateId,
      });
    }

    return resultData;
  }

  public async getUserHomePage(
    user: any,
    userHomePageDto: UserHomePageDto
  ): Promise<{
    courses: Course[];
    listings: any[];
    vendors: VendorCategory[];
  }> {
    if (user.typeOfUser !== TypeOfUser.User) {
      throw new HttpException(
        { message: UserMessageError.WrongType },
        HttpStatus.BAD_REQUEST
      );
    }

    userHomePageDto.page = PAGE;
    userHomePageDto.limit = LIMIT;
    userHomePageDto.userType = TypeOfUser.User;

    const courses = await this._handleListCourse(user.id, userHomePageDto);
    const response = await this._handleListings(user.id, userHomePageDto);
    const vendors = await this._handleVendorCategory(userHomePageDto);

    return {
      courses,
      listings: response.listings,
      vendors,
    };
  }

  public async getAgentHomePage(
    user: any,
    agentHomePageDto: AgentHomePageDto
  ): Promise<{
    courses: Course[];
    nfts: Nft[];
    vendors: VendorCategory[];
  }> {
    if (user.typeOfUser !== TypeOfUser.KlaytnAgent) {
      throw new HttpException(
        { message: UserMessageError.WrongType },
        HttpStatus.BAD_REQUEST
      );
    }

    agentHomePageDto.page = PAGE;
    agentHomePageDto.limit = LIMIT;
    agentHomePageDto.userType = TypeOfUser.KlaytnAgent;
    const courses = await this._handleListCourse(user.id, agentHomePageDto);
    const nfts = await this._handleNft(user.id, agentHomePageDto);
    const vendors = await this._handleVendorCategory(agentHomePageDto);

    return {
      courses,
      nfts,
      vendors,
    };
  }

  public async getVendorHomePage(
    user: any,
    vendorHomePageDto: VendorHomePageDto
  ): Promise<Review[]> {
    if (user.typeOfUser !== TypeOfUser.Vendor) {
      throw new HttpException(
        { message: UserMessageError.WrongType },
        HttpStatus.BAD_REQUEST
      );
    }

    vendorHomePageDto.limit = LIMIT;
    vendorHomePageDto.page = PAGE;
    vendorHomePageDto.vendorId = user.id;
    return this._handleReview(vendorHomePageDto);
  }
}
