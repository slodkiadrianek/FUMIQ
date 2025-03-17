import { Router } from "express";
import { RateLimitRequestHandler } from "express-rate-limit";
import { rateLimit } from "express-rate-limit";
import { AuthController } from "../controllers/auth.controller.js";
import { ValidationMiddleware } from "../../../middleware/validation.middleware.js";
import {
  loginEmployee,
  registerEmployee,
} from "../../../schemas/employee.schema.js";
import { Authentication } from "../../../middleware/auth.middleware.js";
export class AuthRoutes {
  private readonly rateLimit: RateLimitRequestHandler = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 3,
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
      ValidationMiddleware.validate(registerEmployee, "body"),
      this.authController.registerEmployee
    );
    this.router.post(
      "/api/v1/auth/login",
      this.rateLimit,
      ValidationMiddleware.validate(loginEmployee, "body"),
      this.authController.loginEmployee
    );
    this.router.post(
      "/api/v1/auth/logout",
      this.auth.blacklist,
      this.authController.logoutEmployee
    );
    this.router.post(
      "/api/v1/auth/reset-password",
      this.authController.sendEmailToResetPassword
    );
    this.router.post("/api/v1/auth/reset-password/:token",) ;
  }
}