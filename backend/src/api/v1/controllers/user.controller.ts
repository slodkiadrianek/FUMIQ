import {Request,Response, NextFunction } from "express";
import { UserService } from "../../../services/user.service.js";
import { Logger } from "../../../utils/logger.js";
import { IUser } from "../../../models/user.model.js";

export class UserController {
    constructor(private logger:Logger, private userService:UserService){}

    getUserById = async (req:Request, res:Response, next:NextFunction):Promise<void> =>{
        try {
            const userId= req.params.id as string
            this.logger.info(`Attempting to get user information`, {userId})
            const result:IUser = await this.userService.getUserById(userId)
            this.logger.info("User data downloaded", {result})
            res.status(200).json({
                success:true,
                data:{
                    user: result
                }
            })
            return
        } catch (error) {
            next(error)
        }
    }
}