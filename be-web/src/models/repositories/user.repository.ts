import { Model } from "mongoose";
import { User, UserDocument } from "src/models/schemas/user.schema";
import {
  ListUserDto,
  ListUserDtoSort,
} from "src/modules/user/dto/list-user.dto";

export class UserRepository {
  constructor(private readonly model: Model<UserDocument>) {}

  private static extractCondition(conditions: ListUserDto | any): {} {
    const conditionQuery = {};
    for (const key in conditions) {
      if (key === "name") {
        conditionQuery["$or"] = [
          {
            firstName: { $regex: ".*" + conditions[key] + ".*", $options: "i" },
          },
          {
            lastName: { $regex: ".*" + conditions[key] + ".*", $options: "i" },
          },
        ];
        continue;
      }
      if (key === "userTags") {
        conditionQuery["userTag"] = { $in: conditions[key].split(",") };
      }

      if (key === "typeOfUser") {
        conditionQuery["typeOfUser"] = conditions[key];
        continue;
      }

      if (key === "vendorType") {
        conditionQuery["vendorType"] = { $in: conditions[key] };
        continue;
      }

      if (key === "status") {
        conditionQuery["status"] = conditions[key];
        continue;
      }

      if (key === "licenseNumber") {
        conditionQuery["license"] = conditions[key];
        continue;
      }

      if (key === "page" || key === "limit") {
        continue;
      }

      conditionQuery[key] = { $regex: ".*" + conditions[key] + ".*" };
    }
    return conditionQuery;
  }

  async getUserById(userId: string, filter = []): Promise<User> {
    return this.model.findOne({ _id: userId }).select(filter);
  }

  async getUserBylistAgentMlsId(listAgentMlsId: string): Promise<User> {
    return this.model.findOne({ listAgentMlsId });
  }

  async save(user: User): Promise<User> {
    const newUser = new this.model(user);
    return this.model.create(newUser);
  }

  async getUserByEmail(email: string, filter = []): Promise<User> {
    return this.model.findOne({ email: email }).select(filter);
  }

  async getUserByLicense(license, filter = []): Promise<User> {
    return this.model.findOne({ license: license }).select(filter);
  }

  private static extractSort(sort: ListUserDtoSort): {} {
    const sortExtracted = {};
    if (sort.sortTypeOfUser) sortExtracted["typeOfUser"] = sort.sortTypeOfUser;
    if (sort.sortStatus) sortExtracted["status"] = sort.sortStatus;
    if (sort.sortEmail) sortExtracted["email"] = sort.sortEmail;
    if (sort.firstName) sortExtracted["firstName"] = sort.firstName;
    if (sort.lastName) sortExtracted["lastName"] = sort.lastName;
    if (sort.sortPhone) sortExtracted["phone"] = sort.sortPhone;
    if (sort.sortCreatedAt) sortExtracted["createdAt"] = sort.sortCreatedAt;
    return sortExtracted;
  }

  async getListUserByCondition(
    conditions: ListUserDto | any,
    sort: ListUserDtoSort | any
  ): Promise<User[]> {
    const conditionQuery = UserRepository.extractCondition(conditions);
    const extractSort = UserRepository.extractSort(sort);

    return this.model
      .find(conditionQuery)
      .collation({ locale: "en" })
      .sort(extractSort)
      .skip((conditions.page - 1) * conditions.limit)
      .limit(conditions.limit);
  }

  async countAllUserByCondition(
    conditions: ListUserDto | any
  ): Promise<number> {
    const conditionQuery = UserRepository.extractCondition(conditions);
    return this.model.count(conditionQuery);
  }

  async deleteUser(userId: string): Promise<void> {
    await this.model.deleteOne({ _id: userId });
  }

  async getListUserByIds(userIds: string[], filter = []): Promise<User[]> {
    return this.model
      .find({
        _id: { $in: userIds },
      })
      .select(filter);
  }
}
