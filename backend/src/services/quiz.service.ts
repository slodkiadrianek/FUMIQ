import { IQuiz, Quiz } from "../models/quiz.model.js";
import { RedisCacheService } from "../types/common.type.js";
import { Logger } from "../utils/logger.js";
import { BaseService } from "./base.service.js";
import { ITakenQuiz, TakenQuiz } from "../models/takenQuiz.model.js";

export class QuizService extends BaseService {
  constructor(logger: Logger, caching: RedisCacheService) {
    super(logger, caching);
  }
  createQuiz = async (data: Omit<IQuiz, "_id">): Promise<IQuiz> => {
    return this.insertToDatabaseAndCache("Quiz", data, Quiz);
  };
  getAllQuizez = async (userId: string): Promise<IQuiz[]> => {
    return await this.getAllItems("Quizez", userId, Quiz);
  };
  getQuizById = async (quizId: string): Promise<IQuiz> => {
    return this.getItemById("Quiz", quizId, Quiz);
  };
  updateQuiz = async (
    quizId: string,
    quizData: Omit<IQuiz, "_id">,
  ): Promise<IQuiz> => {
    return this.updateItem("Quiz", quizId, quizData, Quiz);
  };
  deleteQuizById = async (quizId: string): Promise<string> => {
    return this.deleteItem("Quiz", quizId, Quiz);
  };
  startQuiz = async (quizId: string, userId: string): Promise<ITakenQuiz> => {
    const quizCheck: ITakenQuiz | null = await TakenQuiz.findOne({
      quizId,
      userId,
      isActive: true,
    });
    if (quizCheck) {
      return quizCheck;
    }
    let error: number = 0;
    let code: string;
    do {
      code = `${Math.floor(100000 + Math.random() * 900000)}`;
      const codeCheck: ITakenQuiz | null = await TakenQuiz.findOne({
        code,
      });
      if (codeCheck) {
        this.logger.error(`Code is already in use`);
        error = 1;
      }
    } while (error === 1);
    const result: ITakenQuiz = await TakenQuiz.create({
      userId,
      quizId,
      code,
    });
    return result;
  };
}
