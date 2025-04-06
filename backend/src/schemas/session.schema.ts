import Joi, { ObjectSchema } from "joi";

export const sessionId: ObjectSchema = Joi.object({
  userId: Joi.string().required(),
  sessionId: Joi.string().required(),
});
