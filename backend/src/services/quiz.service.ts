import { IQuiz, Quiz } from "../models/quiz.model.js";
import { RedisCacheService } from "../types/common.type.js";
import { Logger } from "../utils/logger.js";
import { BaseService } from "./base.service.js";

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
    quizData: Omit<IQuiz, "_id">
  ): Promise<IQuiz> => {
    return this.updateItem("Quiz", quizId, quizData, Quiz);
  };
  deleteQuizById = async (quizId: string): Promise<string> => {
    return this.deleteItem("Quiz", quizId, Quiz);
  };
}
