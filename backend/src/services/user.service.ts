import { RedisCacheService } from "../types/common.type.js";
import { Logger } from "../utils/logger.js";
import { IUser, User } from "../models/user.model.js";
import { BaseService } from "./base.service.js";
import { ITakenQuiz, TakenQuiz } from "../models/takenQuiz.model.js";
import { Types } from "mongoose";
import { AppError } from "../models/error.model.js";
import bcrypt from "bcryptjs";
export class UserService extends BaseService {
  constructor(logger: Logger, caching: RedisCacheService) {
    super(logger, caching);
  }
  getUserById = async (userId: string): Promise<IUser> => {
    return this.getItemById("User", userId, User);
  };
  changePassword = async (
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> => {
    const user: IUser | null = await this.getUserById(userId);
    if (!user) {
      this.logger.error(`User not found`, { userId });
      throw new AppError(404, "User", "User not found");
    }
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      this.logger.error(`Invalid password during password change`, { userId });
      throw new AppError(400, "User", "Invalid password");
    }
    await User.updateOne(
      {
        _id: userId,
      },
      {
        password: newPassword,
      },
    );
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
  getQuestions = async (sessionId: string, userId: string) => {
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
  deleteUser = async (userId: string): Promise<void> => {
    const user: IUser | null = await User.findById(userId);
    if (!user) {
      this.logger.error(`User with this id not found`, { userId });
      throw new AppError(400, "User", `User with this id not found`);
    }
    await User.deleteOne();
    this.logger.info(`User deleted successfully`, { userId });
  };
  updateUser = async (
    userId: string,
    data: Omit<IUser, "_id">,
  ): Promise<void> => {
    const user: IUser | null = await User.findById(userId);
    if (!user) {
      this.logger.error(`User with this id not found`, { userId });
      throw new AppError(400, "User", `User with this id not found`);
    }
    await User.updateOne({ _id: userId }, data);
    this.logger.info(`User updated successfully`, { userId });
  };
}
