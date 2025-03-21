import {Request,Response, NextFunction } from "express";
import { UserService } from "../../../services/user.service.js";
import { Logger } from "../../../utils/logger.js";
import { IUser } from "../../../models/user.model.js";
import { AppError } from "../../../models/error.model.js";

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
    changePassword = async (req:Request, res:Response, next:NextFunction):Promise<void> =>{
        try {
            const userId = req.params.id as string
            const {newPassword, password} = req.body as {
                newPassword:string,
                password:string
            }
            const user:IUser | null = await this.userService.getUserById(userId)
            if(!user){
                this.logger.error("User not found", {userId})
                throw new AppError(404, "User", "User not found")
            }
            if()
        } catch (error) {
            next(error)
        }
    }
}