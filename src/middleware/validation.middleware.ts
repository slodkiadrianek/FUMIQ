import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";


export class ValidationMiddleware {
    constructor(){}
  protected validate(
    schema: ObjectSchema,
    property: "body" | "query" | "params" = "body",
  ) {
    return (req: Request, res: Response, next: NextFunction) => {
      const { error } = schema.validate(req[property], { abortEarly: false });
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.details.map((detail) => detail.message),
        });
      }
      next();
    };
  }
}