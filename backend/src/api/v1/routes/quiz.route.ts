import { Router } from "express";
import { ValidationMiddleware } from "../../../middleware/validation.middleware.js";
import { QuizController } from "../controllers/quiz.controller.js";
import { Authentication } from "../../../middleware/auth.middleware.js";
import { createQuiz, quizId } from "../../../schemas/quiz.schema.js";
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
      "/api/v1/quizez/:quizId/session",
      this.auth.verify,
      ValidationMiddleware.validate(quizId, "params"),
      this.quizController.startQuiz,
    );
  }
}
