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
    public router: Router = Router()
  ) {
    this.initializeRoutes();
  }

  protected initializeRoutes(): void {
    /**
     * @swagger
     * /api/v1/auth/register:
     *   post:
     *     summary: Register a new user
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *             properties:
     *               firstname:
     *                 type: string
     *                 example: Joe
     *               lastname:
     *                 type: string
     *                 example: Doe
     *               email:
     *                 type: string
     *                 example: jode@mail.com
     *               password:
     *                 type: string
     *                 example: Password123!
     *               confirmPassword:
     *                 type: string
     *                 example: Password123!
     *     responses:
     *       200:
     *         description: User
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     user:
     *                       type: object
     *                       properties:
     *                         _id:
     *                           type: string
     *                           example: 1234567890abcdef12345678
     *                         firstname:
     *                           type: string
     *                           example: Joe
     *                         lastname:
     *                           type: string
     *                           example: Doe
     *                         email:
     *                           type: string
     *                           example: joedoe@mail.com
     *                         isActivated:
     *                           type: boolean
     *                           example: false
     *                         createdAt:
     *                           type: string
     *                           example: 2023-10-01T12:00:00.000Z
     *                         updatedAt:
     *                           type: string
     *                           example: 2023-10-01T12:00:00.000Z
     *                         password:
     *                           type: string
     *                           example: dn723udgh297380dg32pdjasidhb97823
     */
    this.router.post(
      "/api/v1/quizzes/",
      ValidationMiddleware.validate(createQuiz, "body"),
      this.auth.verify,
      this.quizController.createQuiz
    );
    this.router.get(
      "/api/v1/quizzes/",
      this.auth.verify,
      this.quizController.getAllQuizez
    );
    this.router.get(
      "/api/v1/quizzes/:quizId",
      this.auth.verify,
      ValidationMiddleware.validate(quizId, "params"),
      this.quizController.getQuizById
    );
    this.router.put(
      "/api/v1/quizzes/:quizId",
      this.auth.verify,
      ValidationMiddleware.validate(createQuiz, "body"),
      ValidationMiddleware.validate(quizId, "params"),
      this.quizController.updateQuiz
    );
    this.router.delete(
      "/api/v1/quizzes/:quizId",
      this.auth.verify,
      ValidationMiddleware.validate(quizId, "params"),
      this.quizController.deleteQuizById
    );
    this.router.post(
      "/api/v1/quizzes/:quizId/sessions",
      this.auth.verify,
      ValidationMiddleware.validate(quizId, "params"),
      this.quizController.startQuizSession
    );
    this.router.patch(
      "/api/v1/quizzes/:quizId/sessions/:sessionId",
      this.auth.verify,
      ValidationMiddleware.validate(endQuizSession, "params"),
      this.quizController.endQuizSession
    );
    this.router.get(
      "/api/v1/quizzes/:quizId/sessions/:sessionId/results",
      this.auth.verify,
      ValidationMiddleware.validate(endQuizSession, "params"),
      this.quizController.getQuizResults
    );
    this.router.get(
      "/api/v1/quizzes/:quizId/sessions",
      this.auth.verify,
      ValidationMiddleware.validate(quizId, "params"),
      this.quizController.getAllSessions
    );
    this.router.get(
      "/api/v1/quizzes/:quizId/sessions/:sessionId",
      this.auth.verify,
      ValidationMiddleware.validate(endQuizSession, "params"),
      this.quizController.getSession
    );
  }
}
