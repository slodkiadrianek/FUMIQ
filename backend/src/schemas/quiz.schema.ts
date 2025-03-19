import Joi, { ObjectSchema } from "joi";

export const createQuiz: ObjectSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  timeLimit: Joi.number().required(),
  questions: Joi.array()
    .items(
      Joi.object({
        correctAnswer: Joi.alternatives()
          .try(Joi.string(), Joi.array().items(Joi.string()))
          .required(),
        options: Joi.array().items(Joi.string()).required().messages({
          "string.empty": "Option must be provided",
        }),
        questionText: Joi.string().required().messages({
          "string.empty": "Question must be provided",
        }),
        questionType: Joi.string().required().messages({
          "string.empty": "Question type must be provided",
        }),
      })
    )
    .required(),
});

export const quizId:ObjectSchema = Joi.object({
  id:Joi.string().required()
})
