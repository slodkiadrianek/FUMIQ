import { Authentication } from "../../../middleware/auth.middleware.js";
import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
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
      this.userController.getQuestions,
    );
    this.router.delete(
      "/api/v1/users/:userId/session/:sessionId",
      this.auth.verify,
      this.userController.submitQuiz,
    );
  }
}
