import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../models/error.model.js";
import { Logger } from "../utils/logger.js";
import { RedisCacheService } from "../types/common.type.js";
import { IUser } from "../models/user.model.js";
export class Authentication {
  jwt: string;
  jwtSecret: string;
  logger: Logger;
  constructor(jwt: string, logger: Logger, private caching: RedisCacheService) {
    this.jwt = jwt;
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables.");
    }
    this.jwtSecret = process.env.JWT_SECRET;
    this.logger = logger;
  }

  sign = (user: IUser): string => {
    const token = jwt.sign(
      { user, iat: Math.floor(Date.now() / 1000) - 60 },
      this.jwtSecret,
      {
        expiresIn: "1h",
      }
    );
    return token;
  };
  verify = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const token = req.headers?.authorization?.split(" ")[1];
    if (!token) {
      this.logger.error(
        `Token is missing during verification of request ${req.baseUrl} with data: ${req.body}`
      );
      res.status(401).json({ message: "Token is missing" });
      return;
    }
    try {
      const isBlacklisted = await this.caching.exists(`blacklist:${token}`);
      if (isBlacklisted) {
        this.logger.error(
          `Token is blacklisted  of request ${req.baseUrl} with data: ${req.body}`
        );
        throw new AppError(401, "Authorization", "Token is blacklisted.");
      }
      const decoded = jwt.verify(token, this.jwtSecret) as JwtPayload;
      (
        req as Request & {
          user?: { id: string; email: string; role: string; iat: number };
        }
      ).user = {
        id: decoded.user.id,
        email: decoded.user.email,
        role: decoded.user.role,
        iat: decoded.iat || 0,
      };
      this.logger.info(`User succssefully authorized`);
      return next();
    } catch (error) {
      this.logger.error(
        `Token is invalid of request ${req.url} with data: ${JSON.stringify(
          req.body
        )} `
      );
      res.status(401).json({ message: "Invalid token", error });
      return;
    }
  };
  async blacklist(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    const token = req.headers?.authorization?.split(" ")[1];
    if (!token) {
      this.logger.error(
        `Token is missing during verification of request ${req.baseUrl} with data: ${req.body}`
      );
      res.status(401).json({ message: "Token is missing" });
      return;
    }
    const decoded = jwt.decode(token) as { exp: number };
    if (!decoded || !decoded.exp) {
      this.logger.error(
        `Token is invalid of request ${req.baseUrl} with data: ${req.body}`
      );
      throw new Error("Invalid token.");
    }
    const expiration = decoded.exp - Math.floor(Date.now() / 1000);
    await this.caching.set(
      `blacklist:${token}`,
      JSON.stringify({
        EX: expiration,
      })
    );
    this.logger.info(
      `Token has been blacklisted  of request ${req.baseUrl} with data: ${req.body}`
    );
  }
}
