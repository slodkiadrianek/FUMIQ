import { string } from "joi";
import { Document, Schema, model, Types, Model } from "mongoose";

export interface ITakenQuiz extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  quizId: Types.ObjectId;
  code: string;
  isActive: boolean;
  competitors: [
    {
      userId: Types.ObjectId;
      answers: [
        {
          questionId: Types.ObjectId;
          answer: string;
          correct: boolean;
        }
      ];
      fninished: boolean;
    }
  ];
}

const takenQuizSchema = new Schema<ITakenQuiz>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    code: { type: String, required: true },
    isActive: { type: Boolean, required: true },
    competitors: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        answers: [
          {
            question: { type: String },
            answer: { type: String },
            correct: { type: Boolean },
          },
        ],
        finished: { type: Boolean },
      },
    ],
  },
  { timestamps: true }
);
export const TakenQuiz: Model<ITakenQuiz> = model<ITakenQuiz>(
  "TakenQuiz",
  takenQuizSchema
);
