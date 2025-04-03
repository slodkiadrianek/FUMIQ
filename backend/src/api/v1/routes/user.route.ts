import { Authentication } from "../../../middleware/auth.middleware.js";
import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { ValidationMiddleware } from "../../../middleware/validation.middleware.js";
import { quizId } from "../../../schemas/quiz.schema.js";
export class UserRoutes {
  constructor(
    private userController: UserController,
    private auth: Authentication,
    public router: Router = Router(),
  ) {
    this.initializeRoutes();
  }
  protected initializeRoutes(): void {
    this.router.get(
      "/api/v1/users/:id",
      this.auth.verify,
      this.userController.getUserById,
    );
    this.router.post(
      "/api/v1/users/:id/session/",
      this.auth.verify,
      this.userController.joinQuiz,
    );
    this.router.get(
      "/api/v1/users/:userId/session/:sessionId",
      this.auth.verify,
      ValidationMiddleware.validate(quizId, "params"),

      this.userController.getQuestions,
    );
    this.router.delete(
      "/api/v1/users/:userId/session/:sessionId",
      this.auth.verify,
      ValidationMiddleware.validate(quizId, "params"),

      this.userController.submitQuiz,
    );
    this.router.patch(
      "/api/v1/users/:userId/session/:sessionId",
      this.auth.verify,
      ValidationMiddleware.validate(quizId, "params"),

      // this.userController.submitAnswer,
      // Koniec testu
    );
    this.router.patch(
      "/api/v1/users/:id",
      this.auth.verify,
      this.userController.changePassword,
    ); //zmiana hasła
    this.router.delete(
      "/api/v1/users/:id",
      this.auth.verify,
      this.userController.deleteUser,
    ); //usuwanie konta
    this.router.put(
      "/api/v1/users/:id",
      this.auth.verify,
      this.userController.updateUser,
    ); //aktualizacja danych użytkownika
  }
}
