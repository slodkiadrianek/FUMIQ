import Joi, { ObjectSchema } from "joi";

export const registerUser: ObjectSchema = Joi.object({
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  password: Joi.string()
    .min(8)
    .max(30)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .required()
    .messages({
      "any.pattern":
        "Password must contain at least 1 lowercase letter, 1 uppercase letter, 1 digit, and 1 special character. It must be at least 8 characters long.",
    }),
  email: Joi.string().email().required(),
});

export const loginUser: ObjectSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .max(30)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .required()
    .messages({
      "string.pattern":
        "Password must contain at least 1 lowercase letter, 1 uppercase letter, 1 digit, and 1 special character. It must be at least 8 characters long.",
    }),
});

export const emailUser: ObjectSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const passwordUser: ObjectSchema = Joi.object({
  password: Joi.string()
    .min(8)
    .max(30)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .required()
    .messages({
      "string.pattern":
        "Password must contain at least 1 lowercase letter, 1 uppercase letter, 1 digit, and 1 special character. It must be at least 8 characters long.",
    }),
});
