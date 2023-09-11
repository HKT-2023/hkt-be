import { Model } from "mongoose";
import { User, UserDocument } from "src/models/schemas/user.schema";
import { ListVendorDto } from "src/modules/vendor-category/dto";

export class UserRepository {
  constructor(private readonly model: Model<UserDocument>) {}

  public async save(user: User): Promise<User> {
    const newUser = new this.model(user);
    return this.model.create(newUser);
  }

  public async getUserByEmail(email: string): Promise<User> {
    return this.model.findOne({ email: email });
  }

  public async getUserByPhone(phoneVerify: string): Promise<User> {
    return this.model.findOne({ phoneVerify, isVerifyPhone: true });
  }

  public async getUserById(id: string, filter = []): Promise<User> {
    return this.model.findOne({ _id: id }).select(filter);
  }

  public async getUserByListAgentMlsId(
    listAgentMlsId: string,
    filter = []
  ): Promise<User> {
    return this.model.findOne({ listAgentMlsId }).select(filter);
  }

  public async getUserByBusinessName(
    businessName: string,
    filter = []
  ): Promise<User> {
    return this.model.findOne({ businessName }).select(filter);
  }

  async getUserByLicense(license): Promise<User> {
    return this.model.findOne({ license: license });
  }

  async getListUserByIds(userIds: string[], filter = []): Promise<User[]> {
    return this.model
      .find({
        _id: { $in: userIds },
      })
      .select(filter);
  }

  async getAllUser(filter = []): Promise<User[]> {
    return this.model.find().select(filter);
  }

  async getUserByVendorId(
    vendorId: string,
    conditions: ListVendorDto,
    filter = []
  ): Promise<User[]> {
    return this.model
      .find({
        vendorType: {
          $elemMatch: {
            $eq: vendorId,
          },
        },
      })
      .select(filter)
      .skip((conditions.page - 1) * conditions.limit)
      .limit(conditions.limit);
  }

  async countUserByVendorId(vendorId: string): Promise<number> {
    return this.model.count({
      vendorType: {
        $elemMatch: {
          $eq: vendorId,
        },
      },
    });
  }
}
