import { RedisCacheService } from "../types/common.type.js";
import { Logger } from "../utils/logger.js";
import { IUser, User } from "../models/user.model.js";
import { BaseService } from "./base.service.js";
import { ITakenQuiz, TakenQuiz } from "../models/takenQuiz.model.js";
import { Types } from "mongoose";
import { AppError } from "../models/error.model.js";
export class UserService extends BaseService {
  constructor(logger: Logger, caching: RedisCacheService) {
    super(logger, caching);
  }
  getUserById = async (userId: string): Promise<IUser> => {
    return this.getItemById("User", userId, User);
  };
  changePassword = async (
    userId: string,
    newPassword: string,
  ): Promise<IUser> => {
    const result: IUser | null = await User.findByIdAndUpdate(
      {
        _id: userId,
      },
      {
        password: newPassword,
      },
      { new: true },
    );
    if (!result) {
      this.logger.error(
        `An error occurred while updating the password for user ${userId}`,
      );
      throw new Error(
        `An error occurred while updating the password for user ${userId}`,
      );
    }
    return result;
  };
  joinQuiz = async (code: string): Promise<string> => {
    const quiz: ITakenQuiz | null = await TakenQuiz.findOne({
      code,
      isActive: true,
    });
    if (!quiz) {
      this.logger.error(`Quiz with code ${code} not found`);
      throw new Error(`Quiz with code ${code} not found`);
    }
    return `${quiz._id}`;
  };
  getQuestions = async (sessionId: string, userId: string): Promise<any> => {
    const quizSession: ITakenQuiz | null = await TakenQuiz.findOne({
      _id: sessionId,
    }).populate({
      path: "quizId",
      select: "-questions.correctAnswer", // Exclude correctAnswer field
    });

    if (!quizSession) {
      this.logger.error(`Quiz session with this id does not exist`, {
        quizSession,
      });
      throw new AppError(
        400,
        "Quiz",
        "Quiz session with this id does not exist",
      );
    }
    const userObjectId = new Types.ObjectId(userId);
    let isUserJoined: boolean = false;
    for (const el of quizSession.competitors) {
      if (el.userId.toString() === userId) {
        isUserJoined = true;
        break;
      }
    }
    if (isUserJoined) {
      return quizSession;
    }

    quizSession.competitors.push({
      userId: userObjectId,
      finished: false,
      answers: [],
    });
    await quizSession.save();
    return quizSession;
  };
  endQuiz = async (userId: string, sessionId: string) => {
    const sesssionQuiz = await TakenQuiz.findOne({
      _id: sessionId,
    }).populate("quizId");
    if (!sesssionQuiz) {
      this.logger.error(`Session with this id not found`, { sessionId });
      throw new AppError(400, "Session", `Session with this id not found`);
    }
    console.log(sesssionQuiz);
    // let pointScored: number = 0;
    for (const el of sesssionQuiz.competitors) {
      if (el.userId.toString() === userId) {
        console.log(el.answers, sesssionQuiz.quizId.questionss);
        for (let i = 0; i < sesssionQuiz.quizId.questions; i++) {}
      }
    }
  };
}
