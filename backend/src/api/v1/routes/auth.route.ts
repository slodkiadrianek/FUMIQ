import { Router } from "express";
import { RateLimitRequestHandler } from "express-rate-limit";
import { rateLimit } from "express-rate-limit";
import { AuthController } from "../controllers/auth.controller.js";
import { ValidationMiddleware } from "../../../middleware/validation.middleware.js";
import {
  registerUser,
  loginUser,
  passwordUser,
  emailUser,
} from "../../../schemas/user.schema.js";
import { Authentication } from "../../../middleware/auth.middleware.js";
export class AuthRoutes {
  private readonly rateLimit: RateLimitRequestHandler = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        description: "Too many requests, please try again in 5 minutes.",
      },
    },
  });

  constructor(
    private authController: AuthController,
    private auth: Authentication,
    public router: Router = Router()
  ) {
    this.initializeRoutes();
  }

  protected initializeRoutes(): void {
    this.router.post(
      "/api/v1/auth/register",
      this.rateLimit,
      ValidationMiddleware.validate(registerUser, "body"),
      this.authController.registerUser
    );
    this.router.post(
      "/api/v1/auth/login",
      this.rateLimit,
      ValidationMiddleware.validate(loginUser, "body"),
      this.authController.loginUser
    );
    this.router.post(
      "/api/v1/auth/logout",
      this.auth.blacklist,
      this.authController.logoutEmployee
    );
    this.router.post(
      "/api/v1/auth/reset-password",
      ValidationMiddleware.validate(emailUser, "body"),
      this.authController.sendEmailToResetPassword
    );
    this.router.post(
      "/api/v1/auth/reset-password/:token",
      ValidationMiddleware.validate(passwordUser, "body"),
      this.authController.resetPassword
    );
    this.router.get(
      "/api/v1/auth/activate/:token",
      this.authController.activateUser
    );
  }
}
