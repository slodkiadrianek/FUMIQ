import { Authentication } from "../../../middleware/auth.middleware.js";
import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { ValidationMiddleware } from "../../../middleware/validation.middleware.js";
import {
  changePasswordUser,
  deleteUser,
  updateUser,
  userId,
} from "../../../schemas/user.schema.js";
import { sessionId } from "../../../schemas/session.schema.js";
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
      "/api/v1/users/:userId",
      this.auth.verify,
      ValidationMiddleware.validate(userId, "params"),
      this.userController.getUserById,
    );
    this.router.post(
      "/api/v1/users/:userId/sessions/",
      this.auth.verify,
      ValidationMiddleware.validate(userId, "params"),

      this.userController.joinQuiz,
    );
    this.router.get(
      "/api/v1/users/:userId/sessions/:sessionId",
      this.auth.verify,
      ValidationMiddleware.validate(sessionId, "params"),
      this.userController.getQuestions,
    );
    this.router.patch(
      "/api/v1/users/:userId/sessions/:sessionId",
      this.auth.verify,
      ValidationMiddleware.validate(sessionId, "params"),
      this.userController.submitQuiz,
    );
    this.router.patch(
      "/api/v1/users/:userId",
      this.auth.verify,
      ValidationMiddleware.validate(userId, "params"),
      ValidationMiddleware.validate(changePasswordUser),
      this.userController.changePassword,
    ); //zmiana hasła
    this.router.delete(
      "/api/v1/users/:userId",
      this.auth.verify,
      ValidationMiddleware.validate(userId, "params"),
      ValidationMiddleware.validate(deleteUser),
      this.auth.blacklist,

      this.userController.deleteUser,
    ); //usuwanie konta
    this.router.put(
      "/api/v1/users/:userId",
      this.auth.verify,
      ValidationMiddleware.validate(userId, "params"),
      ValidationMiddleware.validate(updateUser),

      this.userController.updateUser,
    ); //aktualizacja danych użytkownika
    this.router.get(
      "/api/v1/users/:userId/sessions/:sessionId/results",
      this.auth.verify,
      this.userController.getResult,
    );
  }
}
