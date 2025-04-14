import { IQuiz, Quiz } from "../models/quiz.model.js";
import { RedisCacheService } from "../types/common.type.js";
import { Logger } from "../utils/logger.js";
import { BaseService } from "./base.service.js";
import { ITakenQuiz, TakenQuiz } from "../models/takenQuiz.model.js";
import { IUser } from "../models/user.model.js";

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
  startQuizSession = async (
    quizId: string,
    userId: string,
  ): Promise<ITakenQuiz> => {
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
  endQuizSession = async (sessionId: string): Promise<void> => {
    const quizSession: ITakenQuiz | null = await TakenQuiz.findOne({
      _id: sessionId,
    });
    if (!quizSession) {
      this.logger.error(`Quiz with id ${sessionId} not found`);
      throw new Error(`Quiz with id ${sessionId} not found`);
    }
    quizSession.isActive = false;
    await quizSession.save();
  };
  showQuizResults = async (
    quizId: string,
    sessionId: string,
  ): Promise<{ name: string; score: number }[]> => {
    console.log("HUJ");
    const result: { name: string; score: number }[] = [];
    const quizSession = await TakenQuiz.findOne({
      _id: sessionId,
      quizId: quizId,
      isActive: false,
    })
      .populate([
        { path: "quizId", model: "Quiz" },
        { path: "competitors.userId", model: "User" },
      ])
      .lean<
        ITakenQuiz & { quizId: IQuiz } & { competitors: { userId: IUser }[] }
      >();
    if (!quizSession) {
      this.logger.error(`Quiz with id ${sessionId} not found`);
      throw new Error(`Quiz with id ${sessionId} not found`);
    }
    console.log(quizSession);
    const answers = quizSession.quizId.questions.map((el) => ({
      question: el._id,
      answer: el.correctAnswer,
    }));
    for (const el of quizSession.competitors) {
      const name: string = `${el.userId.firstname} ${el.userId.lastname}`;
      const userAnswers = el.answers;
      let score: number = 0;
      for (const el of answers) {
        for (const userAnswer of userAnswers) {
          if (el.question.toString() === userAnswer.questionId.toString()) {
            if (typeof el.answer === "string") {
              if (el.answer.toLowerCase() === userAnswer.answer) {
                score++;
              }
            } else {
              if (el.answer.join(",").toLowerCase() === userAnswer.answer) {
                score++;
              }
            }
          }
        }
      }
      score = Math.ceil((score / answers.length) * 100);
      result.push({ name, score });
    }
    return result;
  };
}
