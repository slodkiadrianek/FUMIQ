import { Router } from "express";
import { ValidationMiddleware } from "../../../middleware/validation.middleware.js";
import { QuizController } from "../controllers/quiz.controller.js";
import { Authentication } from "../../../middleware/auth.middleware.js";
import {
  createQuiz,
  endQuizSession,
  quizId,
} from "../../../schemas/quiz.schema.js";
export class QuizRoutes {
  constructor(
    private quizController: QuizController,
    private auth: Authentication,
    public router: Router = Router(),
  ) {
    this.initializeRoutes();
  }

  protected initializeRoutes(): void {
    this.router.post(
      "/api/v1/quizez/",
      ValidationMiddleware.validate(createQuiz, "body"),
      this.auth.verify,
      this.quizController.createQuiz,
    );
    this.router.get(
      "/api/v1/quizez/",
      this.auth.verify,
      this.quizController.getAllQuizez,
    );
    this.router.get(
      "/api/v1/quizez/:quizId",
      this.auth.verify,
      ValidationMiddleware.validate(quizId, "params"),
      this.quizController.getQuizById,
    );
    this.router.put(
      "/api/v1/quizez/:quizId",
      this.auth.verify,
      ValidationMiddleware.validate(createQuiz, "body"),
      ValidationMiddleware.validate(quizId, "params"),
      this.quizController.updateQuiz,
    );
    this.router.delete(
      "/api/v1/quizez/:quizId",
      this.auth.verify,
      ValidationMiddleware.validate(quizId, "params"),
      this.quizController.deleteQuizById,
    );
    this.router.post(
      "/api/v1/quizez/:quizId/sessions",
      this.auth.verify,
      ValidationMiddleware.validate(quizId, "params"),
      this.quizController.startQuizSession,
    );
    this.router.patch(
      "/api/v1/quizez/:quizId/sessions/:sessionId",
      this.auth.verify,
      ValidationMiddleware.validate(endQuizSession, "params"),
      this.quizController.endQuizSession,
    );
    this.router.get(
      "/api/v1/quizez/:quizId/sessions/:sessionId/results",
      this.auth.verify,
      ValidationMiddleware.validate(endQuizSession, "params"),
      this.quizController.getQuizResults,
    );
  }
}
