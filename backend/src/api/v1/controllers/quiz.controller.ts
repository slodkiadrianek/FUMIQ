import { Request, Response, NextFunction } from "express";
import { ITakenQuiz } from "../../../models/takenQuiz.model.js";
import { QuizService } from "../../../services/quiz.service.js";
import { Logger } from "../../../utils/logger.js";
import { IQuiz } from "../../../models/quiz.model.js";
import { CustomRequest } from "../../../types/common.type.js";
import { AppError } from "../../../models/error.model.js";

export class QuizController {
  constructor(
    private logger: Logger,
    private quizService: QuizService,
  ) {}

  createQuiz = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!(req as CustomRequest).user.id) {
        throw new AppError(400, "User", "User id not found");
      }
      const data: Omit<IQuiz, "_id"> = {
        ...req.body,
        userId: (req as CustomRequest).user.id,
      };
      this.logger.info("Attempting to create a quiz");
      await this.quizService.createQuiz(data);
      this.logger.info("Quiz has been created successfully");
      res.status(200).json({
        success: true,
      });
      return;
    } catch (error) {
      next(error);
    }
  };
  getAllQuizez = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!(req as CustomRequest).user.id) {
        throw new AppError(400, "User", "User id not found");
      }
      const userId = (req as CustomRequest).user.id;
      this.logger.info("Attempting to get all quizez for user");
      const result: IQuiz[] = await this.quizService.getAllQuizez(userId);
      this.logger.info("Quizez have been downloaded");
      res.status(200).json({
        success: true,
        data: {
          quizez: result,
        },
      });
      return;
    } catch (error) {
      next(error);
    }
  };
  getQuizById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!(req as CustomRequest).user.id) {
        throw new AppError(400, "User", "User id not found");
      }
      const userId = (req as CustomRequest).user.id;
      const quizId = req.params.quizId as string;
      this.logger.info(
        `Attempting to get quiz with id ${quizId} for ${userId}`,
      );
      const result: IQuiz = await this.quizService.getQuizById(quizId);
      this.logger.info(`Quiz has been downloaded`);
      res.status(200).json({
        success: true,
        data: {
          quizez: result,
        },
      });
      return;
    } catch (error) {
      next(error);
    }
  };
  updateQuiz = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!(req as CustomRequest).user.id) {
        throw new AppError(400, "User", "User id not found");
      }
      const quizId = req.params.quizId as string;
      const data: Omit<IQuiz, "_id"> = {
        ...req.body,
        userId: (req as CustomRequest).user.id,
      };
      this.logger.info("Attempting to edit a quiz", { quizId });
      const result: IQuiz = await this.quizService.updateQuiz(quizId, data);
      this.logger.info("Quiz has been edited successfully", { result });
      res.status(200).json({
        success: true,
      });
      return;
    } catch (error) {
      next(error);
    }
  };
  deleteQuizById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const quizId = req.params.quizId as string;
      this.logger.info(`Attempting to delete quiz with id ${quizId}`);
      const result: string = await this.quizService.deleteQuizById(quizId);
      this.logger.info(`Quiz has been downloaded`);
      res.status(200).json({
        success: true,
        data: {
          quizez: result,
        },
      });
      return;
    } catch (error) {
      next(error);
    }
  };
  startQuizSession = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!(req as CustomRequest).user.id) {
        throw new AppError(400, "User", "User id not found");
      }
      const quizId = req.params.quizId as string;
      this.logger.info(`Attempting to start quiz`);
      const result: ITakenQuiz = await this.quizService.startQuizSession(
        quizId,
        (req as CustomRequest).user.id,
      );
      this.logger.info(`Quiz has been started`);
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
  endQuizSession = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const sessionId = req.params.sessionId as string;
      this.logger.info(`Attempting to end quiz`);
      await this.quizService.endQuizSession(sessionId);
      this.logger.info(`Quiz has been ended`);
      res.status(204).send();
      return;
    } catch (error) {
      next(error);
    }
  };
}
