import { RedisCacheService } from "../types/common.type.js";
import { Logger } from "../utils/logger.js";
import { IUser, User } from "../models/user.model.js";
import { BaseService } from "./base.service.js";

export class UserService extends BaseService {
  constructor(logger: Logger, caching: RedisCacheService) {
    super(logger, caching);
  }
  getUserById = async (userId: string): Promise<IUser> => {
    return this.getItemById("User", userId, User);
  };
  changePassword = async (userId: string, newPassword:string): Promise<IUser> => {
    const result: IUser | null = await User.findByIdAndUpdate(
      {
        _id: userId,
      },
      {
        password:newPassword,
      },
      { new: true }
    );
    if (!result) {
      this.logger.error(
        `An error occurred while updating the password for user ${userId}`
      );
      throw new Error(
        `An error occurred while updating the password for user ${userId}`
      );
    }
<<<<<<< HEAD
    return result;
  };
}
=======
    getUserById = async(userId:string):Promise<IUser> =>{
        return this.getItemById("User", userId, User)
    }
}
>>>>>>> cae7fa829c38f6d20db5eac0852c1d10ced8f0d4
