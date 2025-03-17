import express from "express";
import helmet from "helmet";
import cors from "cors";
import { createClient } from "redis";
import { errorHandler } from "./middleware/error.middleware.js";
import { EmailService } from "./services/email.service.js";
import { AuthController } from "./api/v1/controllers/auth.controller.js";
import { Authentication } from "./middleware/auth.middleware.js";
import { AuthService } from "./services/auth.service.js";
import { ValidationMiddleware } from "./middleware/validation.middleware.js";
import { RedisCacheService } from "./types/common.type.js";
import { Logger } from "./utils/logger.js";
import { AuthRoutes } from "./api/v1/routes/auth.route.js";
export const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

export let caching: unknown;
if (process.env.CACHE_LINK) {
  caching = await createClient({
    url: process.env.CACHE_LINK,
  })
    .on("error", (err) => console.log("Redis Client Error", err))
    .connect();
} else {
  console.error(`No cache link provided`);
  process.exit(1);
}
if (
  !process.env.EMAIL_SERVICE ||
  !process.env.EMAIL_USER ||
  !process.env.EMAIL_PASS ||
  !process.env.EMAIL_FROM
) {
  console.error(`You have to specifie email data to use email service`);
  process.exit(1);
}
const emailService: EmailService = new EmailService(
  process.env.EMAIL_SERVICE,
  process.env.EMAIL_USER,
  process.env.EMAIL_PASS,
  process.env.EMAIL_FROM
);
const logger: Logger = new Logger();
const auth: Authentication = new Authentication(
  process.env.JWT_SECRET || "",
  logger,
  caching as RedisCacheService
);


//AUTH
const authService: AuthService = new AuthService(
  logger,
  auth,
  caching as RedisCacheService,
  emailService
);
const authController: AuthController = new AuthController(logger, authService);
const authRoutes: AuthRoutes = new AuthRoutes(authController, auth);

//USE
app.use(authRoutes.router);
app.use(errorHandler);
