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
    /**
     * @swagger
     * /api/v1/quizzes/:
     *   post:
     *     summary: Create a new quiz
     *     tags: [Quiz]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *             properties:
     *               title:
     *                 type: string
     *                 example: TEST
     *               description:
     *                 type: string
     *                 example: TEST
     *               timeLimit:
     *                 type: number
     *                 example: 12
     *               Question:
     *                 type: object
     *                 required:
     *                   - options
     *                   - questionText
     *                   - questionType
     *                 properties:
     *                   photoUrl:
     *                     type: string
     *                     format: uri
     *                     nullable: true
     *                     description: URL to a photo for the question (optional).
     *                   correctAnswer:
     *                     oneOf:
     *                       - type: string
     *                       - type: array
     *                         items:
     *                           type: string
     *                       - type: "null"
     *                     description: The correct answer, can be a string, array of strings, or null.
     *                   options:
     *                     type: array
     *                     items:
     *                       oneOf:
     *                         - type: string
     *                         - type: "null"
     *                     description: Array of possible answer options.
     *                   questionText:
     *                     type: string
     *                     description: The text of the question.
     *                   questionType:
     *                     type: string
     *                     description: The type of the question.
     *     responses:
     *       201:
     *         description: Successfully created quiz
     */
    this.router.post(
      "/api/v1/quizzes/",
      ValidationMiddleware.validate(createQuiz, "body"),
      this.auth.verify,
      this.quizController.createQuiz,
      /**
       * @swagger
       * /api/v1/quizzes/:
       *   get:
       *     summary: Get all quizzes
       *     tags: [Quiz]
       *     responses:
       *       200:
       *         description: Quiz created successfully
       *         content:
       *           application/json:
       *             schema:
       *               type: array
       *               items:
       *                 type: object
       *                 properties:
       *                   title:
       *                     type: string
       *                     example: TEST
       *                   description:
       *                     type: string
       *                     example: TEST
       *                   timeLimit:
       *                     type: number
       *                     example: 12
       *                   Question:
       *                     type: object
       *                     required:
       *                       - options
       *                       - questionText
       *                       - questionType
       *                     properties:
       *                       photoUrl:
       *                         type: string
       *                         format: uri
       *                         nullable: true
       *                         description: URL to a photo for the question (optional).
       *                       correctAnswer:
       *                         oneOf:
       *                           - type: string
       *                           - type: array
       *                             items:
       *                               type: string
       *                           - type: "null"
       *                         description: The correct answer, can be a string, array of strings, or null.
       *                       options:
       *                         type: array
       *                         items:
       *                           oneOf:
       *                             - type: string
       *                             - type: "null"
       *                         description: Array of possible answer options.
       *                       questionText:
       *                         type: string
       *                         description: The text of the question.
       *                       questionType:
       *                         type: string
       *                         description: The type of the question.
       */
    );
    this.router.get(
      "/api/v1/quizzes/",
      this.auth.verify,
      this.quizController.getAllQuizez,
    );
    /**
     * @swagger
     * /api/v1/quizzes/{quizId}:
     *   get:
     *     summary: Get a quiz by ID
     *     tags: [Quiz]
     *     parameters:
     *       - in: path
     *         name: quizId
     *         schema:
     *           type: string
     *         required: true
     *         description: ID of the quiz to retrieve
     *     responses:
     *       200:
     *         description: Quiz retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 title:
     *                   type: string
     *                   example: TEST
     *                 description:
     *                   type: string
     *                   example: TEST
     *                 timeLimit:
     *                   type: number
     *                   example: 12
     *                 Question:
     *                   type: object
     *                   required:
     *                     - options
     *                     - questionText
     *                     - questionType
     *                   properties:
     *                     photoUrl:
     *                       type: string
     *                       format: uri
     *                       nullable: true
     *                       description: URL to a photo for the question (optional).
     *                     correctAnswer:
     *                       oneOf:
     *                         - type: string
     *                         - type: array
     *                           items:
     *                             type: string
     *                         - type: "null"
     *                       description: The correct answer, can be a string, array of strings, or null.
     *                     options:
     *                       type: array
     *                       items:
     *                         oneOf:
     *                           - type: string
     *                           - type: "null"
     *                       description: Array of possible answer options.
     *                     questionText:
     *                       type: string
     *                       description: The text of the question.
     *                     questionType:
     *                       type: string
     *                       description: The type of the question.
     */
    this.router.get(
      "/api/v1/quizzes/:quizId",
      this.auth.verify,
      ValidationMiddleware.validate(quizId, "params"),
      this.quizController.getQuizById,
    );
    /**
     * @swagger
     * /api/v1/quizzes/{quizId}:
     *   put:
     *     summary: Update a quiz by ID
     *     tags: [Quiz]
     *     parameters:
     *       - in: path
     *         name: quizId
     *         schema:
     *           type: string
     *         required: true
     *         description: ID of the quiz to retrieve
     *     responses:
     *       204:
     *         description: Quiz updated successfully
     */
    this.router.put(
      "/api/v1/quizzes/:quizId",
      this.auth.verify,
      ValidationMiddleware.validate(createQuiz, "body"),
      ValidationMiddleware.validate(quizId, "params"),
      this.quizController.updateQuiz,
    );
    /**
     * @swagger
     * /api/v1/quizzes/{quizId}:
     *   delete:
     *     summary: Delete a quiz by ID
     *     tags: [Quiz]
     *     parameters:
     *       - in: path
     *         name: quizId
     *         schema:
     *           type: string
     *         required: true
     *         description: ID of the quiz to retrieve
     *     responses:
     *       204:
     *         description: Quiz deleted successfully
     */
    this.router.delete(
      "/api/v1/quizzes/:quizId",
      this.auth.verify,
      ValidationMiddleware.validate(quizId, "params"),
      this.quizController.deleteQuizById,
    );
    /**
     * @swagger
     * /api/v1/quizzes/{quizId}/sessions:
     *   post:
     *     summary: Start quiz session
     *     tags: [Session]
     *     parameters:
     *       - in: path
     *         name: quizId
     *         schema:
     *           type: string
     *         required: true
     *         description: ID of the quiz to retrieve
     *     responses:
     *       204:
     *         description: Quiz deleted successfully
     */
    this.router.post(
      "/api/v1/quizzes/:quizId/sessions",
      this.auth.verify,
      ValidationMiddleware.validate(quizId, "params"),
      this.quizController.startQuizSession,
    );
    this.router.patch(
      "/api/v1/quizzes/:quizId/sessions/:sessionId",
      this.auth.verify,
      ValidationMiddleware.validate(endQuizSession, "params"),
      this.quizController.endQuizSession,
    );
    this.router.get(
      "/api/v1/quizzes/:quizId/sessions/:sessionId/results",
      this.auth.verify,
      ValidationMiddleware.validate(endQuizSession, "params"),
      this.quizController.getQuizResults,
    );
    this.router.get(
      "/api/v1/quizzes/:quizId/sessions",
      this.auth.verify,
      ValidationMiddleware.validate(quizId, "params"),
      this.quizController.getAllSessions,
    );
    this.router.get(
      "/api/v1/quizzes/:quizId/sessions/:sessionId",
      this.auth.verify,
      ValidationMiddleware.validate(endQuizSession, "params"),
      this.quizController.getSession,
    );
  }
}
