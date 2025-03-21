import { RedisCacheService } from "../types/common.type.js";
import { Logger } from "../utils/logger.js";
import { IUser, User } from "../models/user.model.js";
import { BaseService } from "./base.service.js";

export class UserService extends BaseService {
    constructor(logger:Logger, caching: RedisCacheService){
        super(logger, caching)
    }
    getUserById = async(userId:string):Promise<IUser> =>{
        return this.getItemById("User", userId, User)
    }
}