import { Request, Response, NextFunction } from "express";
import { UserService } from "../../../services/user.service.js";
import { Logger } from "../../../utils/logger.js";
import { IUser } from "../../../models/user.model.js";

export class UserController {
  constructor(
    private logger: Logger,
    private userService: UserService,
  ) {}

  getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.params.id as string;
      this.logger.info(`Attempting to get user information`, { userId });
      const result: IUser = await this.userService.getUserById(userId);
      this.logger.info("User data downloaded", { result });
      res.status(200).json({
        success: true,
        data: {
          user: result,
        },
      });
      return;
    } catch (error) {
      next(error);
    }
  };
  joinQuiz = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const code = req.body.code as string;
      this.logger.info(`Attempting to join quiz with code ${code}`);
      const result: string = await this.userService.joinQuiz(code);
      this.logger.info(`User joined quiz with code ${code}`);
      res.status(200).json({
        success: true,
        data: {
          quiz: {
            _id: result,
          },
        },
      });
      return;
    } catch (error) {
      next(error);
    }
  };
  getQuestions = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId: string = req.params.userId;
      const quizId: string = req.params.quizId;
      this.logger.info(`Attempting get questions for quiz`, { userId });
      const result = await this.userService.getQuestions(quizId, userId);
      this.logger.info(`Quiz loaded successfully`, { result });
      res.status(200).json({
        success: true,
        data: {
          quiz: result,
        },
      });
      return;
    } catch (error) {
      next(error);
    }
  };
}
