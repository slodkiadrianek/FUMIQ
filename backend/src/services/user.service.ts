import { RedisCacheService } from "../types/common.type.js";
import { Types } from "mongoose";
import { Logger } from "../utils/logger.js";
import { IUser, User } from "../models/user.model.js";
import { BaseService } from "./base.service.js";
import { ITakenQuiz, TakenQuiz } from "../models/takenQuiz.model.js";

export class UserService extends BaseService {
  constructor(logger: Logger, caching: RedisCacheService) {
    super(logger, caching);
  }
  getUserById = async (userId: string): Promise<IUser> => {
    return this.getItemById("User", userId, User);
  };
  changePassword = async (
    userId: string,
    newPassword: string
  ): Promise<IUser> => {
    const result: IUser | null = await User.findByIdAndUpdate(
      {
        _id: userId,
      },
      {
        password: newPassword,
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
    return result;
  };
  joinQuiz = async (code: string): Promise<boolean> => {
    // const userObjectId = new Types.ObjectId(userId);

    const quiz: ITakenQuiz | null = await TakenQuiz.findOne({
      code,
      isActive: true,
    });
    if (!quiz) {
      this.logger.error(`Quiz with code ${code} not found`);
      throw new Error(`Quiz with code ${code} not found`);
    }
    return true;
    // let isUserJoined: boolean = false;
    // let userIndex: number = -1;
    // for (const el of quiz.competitors) {
    //   if (el.userId.toString() === userId) {
    //     userIndex = quiz.competitors.indexOf(el);
    //     isUserJoined = true;
    //     break;
    //   }
    // }
    // if (isUserJoined) {
    //   return { quizId: quiz.quizId, ...quiz.competitors[userIndex] };
    // }

    // quiz.competitors.push({
    //   userId: userObjectId,
    //   finished: false,
    //   answers: [],
    // });

    // await quiz.save();
    // return quiz;
  };
}
